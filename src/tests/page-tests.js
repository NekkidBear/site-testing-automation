// filepath: /site-testing-automation/site-testing-automation/src/tests/page-tests.js
const { Builder, By, Key, until } = require('selenium-webdriver');
const SeleniumConfig = require('../config/selenium-config');
const UrlCollector = require('../core/url-collector');
const ReportGenerator = require('../reports/report-generator');
const EmailSender = require('../reports/email-sender');
const logger = require('../utils/logger');

const seleniumConfig = new SeleniumConfig();
const urlCollector = new UrlCollector();
const reportGenerator = new ReportGenerator();
const emailSender = new EmailSender();

async function runPageTests() {
  const urls = await urlCollector.collectUrls();
  const results = [];

  for (const url of urls) {
    try {
      const driver = await seleniumConfig.createDriver('chrome');
      await driver.get(url);
      const result = await validatePage(driver, url);
      results.push(result);
      await driver.quit();
    } catch (error) {
      logger.logError(`Error testing ${url}: ${error.message}`);
      results.push({ url, status: 'failed', error: error.message });
    }
  }

  await reportGenerator.generateReport(results);
  await emailSender.sendReport();
}

async function validatePage(driver, url) {
  // Example validation logic
  const title = await driver.getTitle();
  const status = title ? 'passed' : 'failed';
  return { url, status, title };
}

module.exports = { runPageTests, validatePage };