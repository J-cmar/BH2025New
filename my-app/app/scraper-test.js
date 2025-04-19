import puppeteer from 'puppeteer';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://scriptcost.com/scriptcycle/DrugPriceLookup/DrugLookupResult');
    await page.setViewport({ width: 1080, height: 1024 });
    const drugInput = await page.waitForSelector('#DrugName_I');
    await drugInput.type('Ozempic');
    await page.waitForSelector('#DrugName_DDD_L_LBT > tbody')
    const firstResult = await page.waitForSelector('#DrugName_DDD_L_LBT > tbody tr'); // selector for autocomplete table

    console.log('First autocomplete suggestion:', firstResult);
    await delay(200);
    const zipInput = await page.waitForSelector('#ZipCode_I');
    await zipInput.type('91768');

    const submitButton = await page.waitForSelector('#SubmitButton');
    await submitButton.click();

    await page.waitForSelector('#BodyContentWrapper > div.container.result-display-settings', { timeout: 10000 });
    console.log('result page')

    // Extract all store names and prices
    const stores = await page.$$eval('.store-price-list form', forms =>
        forms.map(form => {
            const name = form.querySelector('.network-name')?.innerText.trim() || 'N/A';
            const price = form.querySelector('.network-price .price')?.innerText.trim() || 'N/A';
            return { name, price };
        })
    );

    console.log('Drug Prices by Store:\n', stores);


    await delay(10000)
    await browser.close();
})();


// drug description
// #BodyContentWrapper > div.container.result-display-settings > div.row > div.col-lg-9.result-right-col > div:nth-child(1) > div > div.drug-summary

// drug price list
// #BodyContentWrapper > div.container.result-display-settings > div.row > div.col-lg-9.result-right-col > div:nth-child(3) > div > div.drug-price-results