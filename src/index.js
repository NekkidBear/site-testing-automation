require('dotenv').config();
const logger = require('./utils/logger');
const urlCollector = require('./core/url-collector');
const performanceTests = require('./tests/performance-tests');
const accessibilityTests = require('./tests/accessibility-tests');
const pageTests = require('./tests/page-tests');
const reportGenerator = require('./reports/report-generator');
const emailSender = require('./reports/email-sender');

async function runTests() {
  try {
    logger.info('Starting website testing suite...');

    // Parse command line arguments for specific test suite
    const args = process.argv.slice(2);
    const suite = args.find(arg => arg.startsWith('--suite='))?.split('=')[1];

    // Collect URLs to test
    const urls = await urlCollector.collect();
    logger.info(`Collected ${urls.length} URLs for testing`);

    const results = {
      performance: [],
      accessibility: [],
      seo: [],
      visual: [],
      e2e: []
    };

    // Run appropriate tests based on suite argument
    for (const url of urls) {
      if (!suite || suite === 'performance') {
        results.performance.push(await performanceTests.run(url));
      }
      if (!suite || suite === 'accessibility') {
        results.accessibility.push(await accessibilityTests.run(url));
      }
      if (!suite || suite === 'seo' || suite === 'visual' || suite === 'e2e') {
        results[suite].push(await pageTests.run(url, suite));
      }
    }

    // Generate and send report
    const reportPath = await reportGenerator.generate(results);
    await emailSender.sendReport(reportPath);

    logger.info('Testing completed successfully');
  } catch (error) {
    logger.error('Error during test execution:', error);
    process.exit(1);
  }
}

runTests();
