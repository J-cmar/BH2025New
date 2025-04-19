import puppeteer from 'puppeteer';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://scriptcost.com/scriptcycle/DrugPriceLookup/DrugLookupResult');
    await page.setViewport({ width: 1080, height: 1024 });
    const drugInput = await page.waitForSelector('#DrugName_I');
    await drugInput.type('Xanax');
    await page.waitForSelector('#DrugName_DDD_L_LBT > tbody')
    const firstResult = await page.waitForSelector('#DrugName_DDD_L_LBT > tbody tr'); // selector for autocomplete table

    console.log('First autocomplete suggestion:', firstResult);
    await delay(200);
    const zipInput = await page.waitForSelector('#ZipCode_I');
    await zipInput.type('91768');

    await delay(1000);

    const submitButton = await page.waitForSelector('#SubmitButton');
    await submitButton.click();

    await page.waitForSelector('#BodyContentWrapper > div.container.result-display-settings', { timeout: 10000 });
    console.log('result page')
    await browser.close();
})();