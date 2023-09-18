import "dotenv/config";
import ac from "@antiadmin/anticaptchaofficial";
import puppeteer from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import * as fs from "node:fs/promises";

import { EErrors, type TRowData } from "./types/typeUtils";
import { USER_INPUT, groupById, scrapeFunction } from "./utils";

// MIDDLEWARE
puppeteer.use(stealthPlugin());

const runCrawler = async () => {
  console.log("solving captcha ⏲️");
  const token = await ac.solveRecaptchaV2Proxyless(
    USER_INPUT.websiteURL,
    USER_INPUT.websiteKey
  );
  if (typeof token !== "string") {
    throw new Error("recaptcha not solved");
  }
  console.log("recaptcha solved ✅: ");

  console.log("opening browser ⏲️");
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100
    // ignoreDefaultArgs: ["--disable-extensions", "--enable-automation"]
  });
  console.log("open browser ✅");

  console.log("creating new tab ⏲️");
  const page = await browser.newPage();
  console.log("create new tab ✅");

  console.log("changing windows size ⏲️");
  await page.setViewport({ width: 1280, height: 720 });
  console.log("change windows size ✅");

  console.log("open target page ⏲️");
  await page.goto(USER_INPUT.websiteURL, { waitUntil: "networkidle0" });
  console.log("open target page ✅");

  // SETTING RECAPTCHA g-response
  console.log("typing recaptcha ⏲️");
  const gRecaptchaSelector = "textarea#g-recaptcha-response";
  await page.evaluate(
    (selector, token) => {
      const element = document.querySelector(selector);
      if (element instanceof HTMLTextAreaElement) {
        element.value = token;
      }
    },
    gRecaptchaSelector,
    token
  );
  console.log("recaptcha typed ✅");

  // FILL JURISDICTIONS
  // get options
  const options = await page.$$eval(
    "select#formPublica\\:camaraNumAni > option",
    (options) => {
      return options.map((option) => {
        return {
          value: option.getAttribute("value"),
          textContent: option.textContent
        };
      });
    }
  );
  // get option value
  const optionValue = options.find(
    (option) =>
      option.textContent?.toLowerCase().includes(USER_INPUT.jurisdiction)
  )?.value;
  if (typeof optionValue === "string") {
    await page.select("#formPublica\\:camaraNumAni", optionValue);
  }

  // FILL EXP-NUMBER AND YEAR
  await page.type("#formPublica\\:numero", USER_INPUT.exp);
  await page.type("#formPublica\\:anio", USER_INPUT.year);

  // CLICK SUBMIT
  console.log("submitting ⏲️");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click("#formPublica\\:buscarPorNumeroButton")
  ]);
  const divError = await page.$eval("#fcMsg", (divNode) => {
    const summaryMessage = divNode.querySelector(
      "span.ui-messages-error-summary"
    )?.textContent;
    return { error: divNode.hasChildNodes(), message: summaryMessage };
  });
  if (divError.error) {
    console.log("Failed to submit form");
    throw new Error(divError.message ?? EErrors.FORM_SUBMIT);
  }
  console.log("redirection completed ✅");

  // TAKE SCREENSHOT
  console.log("taking screenshot ⏲️");
  await page.screenshot({ path: "./screenshot/home-page.png" });
  console.log("take screenshot ✅");

  // SCRAPPING THE PAGE
  console.log("scrapping the page ⏲️");
  // scrape first page and ommit the first json value because is an empty cell;
  const scrappedPage = (await page.evaluate(scrapeFunction)).slice(1);
  let scrappedData: TRowData[] = [...scrappedPage];
  const nextPageSelector = "#expediente\\:j_idt218\\:j_idt235";
  while ((await page.$(nextPageSelector)) != null) {
    await Promise.all([
      page.waitForSelector(nextPageSelector, { visible: true }),
      page.click(nextPageSelector)
    ]);
    scrappedData = [
      ...scrappedData,
      ...(await page.evaluate(scrapeFunction)).slice(1)
    ];
  }

  const scrappedDataToSave = JSON.stringify(scrappedData, null, 2);
  const formattedData = groupById(scrappedData, "date");
  const formattedDateData = Object.assign({}, formattedData, {
    processData: new Date()
  });
  const formattedDataToSave = JSON.stringify(formattedDateData, null, 2);

  await fs.writeFile("./resources/scrapped.json", scrappedDataToSave);
  await fs.writeFile("./resources/formatted.json", formattedDataToSave);
  console.log("data saved on ./resources ✅");

  // CLOSE BROWSER
  console.log("closing browser ⏲️");
  await browser.close();
  console.log("close browser ✅");
};

const run = async () => {
  try {
    const token = process.env.RECAPTCHA_TOKEN;
    if (typeof token === "string") {
      ac.setAPIKey(token);
    }
    const balance = await ac.getBalance();
    console.log({ balance });
    console.log(`My balance is: $${balance} 💰`);
    if (balance <= 0) {
      throw new Error("Negative balance");
    }
    await runCrawler();
  } catch (error) {
    console.log({ "❌ msg": error });
    process.exit(1);
  }
};

void run();
