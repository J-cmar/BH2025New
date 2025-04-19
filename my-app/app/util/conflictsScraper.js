import puppeteer from "puppeteer";

export default async function getDrugConflicts(drugName){
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://www.drugs.com/drug_interactions.html");

  await page.setViewport({ width: 1080, height: 1024 });
  const drugInput = await page.waitForSelector("#livesearch-interaction-basic");
  await drugInput.type(`${drugName}`);

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

  await page.waitForSelector(".ddc-link-forward");

  //find and click the "View all" link if it exists
  const clicked = await page.$$eval(".ddc-link-forward", (links) => {
    const link = links.find((el) => el.textContent.trim() === "View all");
    if (link) {
      link.click();
      return true;
    }
    return false;
  });

  if (clicked) {
    //console.log('Clicked the "View all" link.');
    //wait for the next page or DOM change
    await page.waitForNavigation({ waitUntil: "domcontentloaded" });
  } else {
    console.log('"View all" link not found.');
  }

  const drugs = await page.$$eval(
    "ul.interactions.ddc-list-column-2 li.int_1, ul.interactions.ddc-list-column-2 li.int_2, ul.interactions.ddc-list-column-2 li.int_3",
    (listItems) =>
      listItems.map((li) => {
        const link = li.querySelector("a");
        const className = li.className;
        const match = className.match(/int_(\d)/);
        const seriousness = match ? parseInt(match[1], 10) : null;

        return {
          drug: link?.textContent.trim() || "",
          href: link?.href || "",
          seriousness,
        };
      })
  );

  await browser.close();

  console.log(drugs);

  return drugs;
};