const { runPerformanceTests } = require('../tests/performance-tests');
const { Crawler } = require('../core/crawler');
const { UrlCollector } = require('../core/url-collector');
const { EmailSender } = require('../reports/email-sender');
const { ReportGenerator } = require('../reports/report-generator');

async function main() {
  const crawler = new Crawler();
  const urlCollector = new UrlCollector();
  const emailSender = new EmailSender();
  const reportGenerator = new ReportGenerator();

  let urls;

  try {
    // Attempt to collect URLs from the sitemap
    urls = await urlCollector.collectUrls('https://gymnarctosstudiosllc.com/sitemap.xml');
  } catch (error) {
    // If the sitemap is unavailable, crawl the site
    console.error('Sitemap unavailable, crawling the site:', error);
    urls = await crawler.crawl('https://gymnarctosstudiosllc.com');
  }

  // Run performance tests for each URL
  const performanceResults = await runPerformanceTests(urls);

  // Generate and save the report
  const reportPath = reportGenerator.generateReport(performanceResults);

  // Send the report via email
  await emailSender.sendReport(reportPath, 'gymnarctosstudiosllc@gmail.com');
}

main().catch(error => {
  console.error('Error during testing:', error);
});