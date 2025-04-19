import puppeteer from "puppeteer";

export async function POST(request) {
    const body = await request.json();
    const { drugName } = body;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    if (!drugName) {
        return new Response(
            JSON.stringify({ error: "Drug name is required" }),
            { status: 400 }
        );
    }
    // TODO: integrate map, make locations look prettier, and fix bug with jason's autofill not being a valid entry into my api
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        const page = await browser.newPage();

        await page.goto('https://scriptcost.com/scriptcycle/DrugPriceLookup/DrugLookupResult');
        await page.setViewport({ width: 1080, height: 1024 });

        const drugInput = await page.waitForSelector('#DrugName_I');
        await drugInput.type(drugName);
        await page.waitForSelector('#DrugName_DDD_L_LBT > tbody');
        const firstResult = await page.waitForSelector('#DrugName_DDD_L_LBT > tbody tr', { timeout: 10000 });

        console.log('First autocomplete suggestion:', firstResult);
        await delay(200);
        const zipInput = await page.waitForSelector('#ZipCode_I');
        await zipInput.type('91768');

        const submitButton = await page.waitForSelector('#SubmitButton');
        await submitButton.click();

        await page.waitForSelector('#BodyContentWrapper > div.container.result-display-settings', { timeout: 10000 });
        console.log('Result page loaded.');

        // Extract all store names and prices
        const stores = await page.$$('.store-price-list form');
        const results = [];

        for (const store of stores) {
            const name = await store.$eval('.network-name', (el) => el.textContent.trim());
            const price = await store.$eval('.network-price .price', (el) => el.textContent.trim());

            // Click the "Show Location" button
            const showLocationButton = await store.$('.dxb');
            if (showLocationButton) {
                await showLocationButton.click();
                await page.waitForSelector('#PopupControl_PWC-1 > div.row', { timeout: 5000 }); // Wait for locations to load

                // Extract locations
                const locations = await page.$$eval(
                    '#PopupControl_PWC-1 > div.row > div.col-lg-6.store-price-list',
                    (storeDivs) => {
                        const allLocations = [];
                        storeDivs.forEach((storeDiv) => {
                            const forms = storeDiv.querySelectorAll('form');
                            forms.forEach((form) => {
                                const rows = form.querySelectorAll('table tbody tr');
                                const rowData = Array.from(rows)
                                    .slice(2, -1) // skip first and last rows
                                    .map((row, index) => {
                                        const tds = row.querySelectorAll('td');
                                        if (index === rows.length - 3) {
                                            // second-to-last row (before last one was sliced off)
                                            return Array.from(tds)
                                                .filter((_, tdIndex) => tdIndex !== 1) // Skip unwanted <td>
                                                .map((td) => td.textContent.replace(/get discount/i, '').trim())
                                                .join(' ');
                                        } else {
                                            return Array.from(tds).map((td) => td.textContent.replace(/get discount/i, '').trim()).join(' ');
                                        }
                                    });
                                allLocations.push(rowData.join(' | ')); // or push rowData array if you want structure
                            });
                        });
                        return allLocations;
                    }
                );


                results.push({ name, price, locations });
            } else {
                results.push({ name, price, locations: [] });
            }
            const exit_btn = await page.waitForSelector('#PopupControl_HCB-1');
            await exit_btn.click();
            await delay(500); // Small delay between interactions
        }

        console.log('Drug Prices and Locations by Store:\n', results);

        await browser.close();
        return new Response(JSON.stringify({ results }), { status: 200 });
    } catch (error) {
        console.error("Scraping failed:", error);
        return new Response(JSON.stringify({ error: "Scraping failed" }), { status: 500 });
    }
}