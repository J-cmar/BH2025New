import puppeteer from "puppeteer";

export async function getDrugConflicts(){
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://www.drugs.com/drug_interactions.html");

  await page.setViewport({ width: 1080, height: 1024 });
  const drugInput = await page.waitForSelector("#livesearch-interaction-basic");
  await drugInput.type("Ozempic");

  await page.waitForSelector("#ls-wrap");
  await page.waitForSelector(".ls-item");
  await page.click(".ls-item"); //selects first suggestion

  const submitButton = await page.waitForSelector(
    'a.ddc-btn[href^="/interactions-check.php"]'
  );
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }), // wait for full navigation
    submitButton.click(), // click triggers navigation
  ]);

  const seriousInteractions = await page.$$eval(
    "ul.interactions.ddc-mgt-0.ddc-list-unstyled li.int_1, ul.interactions.ddc-mgt-0.ddc-list-unstyled li.int_2, ul.interactions.ddc-mgt-0.ddc-list-unstyled li.int_3",
    (items) =>
      items.map((item) => {
        const classList = Array.from(item.classList);
        const seriousnessClass = classList.find((cls) =>
          cls.startsWith("int_")
        );
        const seriousness = parseInt(seriousnessClass?.split("_")[1], 10) || 0;
        return {
          name: item.textContent.trim(),
          href: item.querySelector("a")?.href || "",
          seriousness,
        };
      })
  );

  //sort by seriousness descending (3 -> 2 -> 1)
  seriousInteractions.sort((a, b) => b.seriousness - a.seriousness);

  console.log(seriousInteractions);
}