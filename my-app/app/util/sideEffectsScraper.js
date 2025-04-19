import puppeteer from "puppeteer";

export default async function getDrugConflicts(drugName) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://www.drugs.com");

  await page.setViewport({ width: 1080, height: 1024 });
  const drugInput = await page.waitForSelector("#livesearch-main");
  await drugInput.type(`${drugName}`);

  await page.waitForSelector("#ls-wrap");
  await page.waitForSelector(".ls-item");
  await page.click(".ls-item"); //selects first suggestion

  await page.waitForNavigation({ waitUntil: "networkidle0" });

  const formattedName = drugName.toLowerCase().replace(/\s+/g, "-");
  console.log(formattedName)
  const sideEffectsLink = `/sfx/${formattedName}-side-effects.html`;

  // Wait for the link to appear and click it
  await page.waitForSelector(`a[href="${sideEffectsLink}"]`);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click(`a[href="${sideEffectsLink}"]`),
  ]);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }), // wait for full navigation
  ]);

  await page.waitForSelector("h2#summary");

  const sideEffects = await page.$$eval("h2#summary + p + ul > li", (items) =>
    items.map((li) => li.textContent.trim())
  );

  console.log("Common Side Effects:", sideEffects);

  await browser.close();

  return sideEffects;
}
