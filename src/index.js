require('dotenv').config();
const path = require('path');
const logger = require('./utils/logger');
const urlCollector = require('./core/url-collector');
const { runUnitTests } = require('./tests/unit-tests');
const { runIntegrationTests } = require('./tests/integration-tests');
const { runE2ETests } = require('./tests/e2e-tests');
const { runLighthouseTests } = require('./tests/lighthouse-tests');
const { runAccessibilityTests } = require('./tests/accessibility-tests');
const { runSeoTests } = require('./tests/seo-tests');
const { runVisualRegressionTests } = require('./tests/visual-regression-tests');
const { runLanguageTests } = require('./tests/language-tests');
const { runHeaderTests } = require('./tests/header-tests');
const reportGenerator = require('./reports/report-generator');
const notificationManager = require('./reports/notification-manager');

async function runTests() {
  try {
    logger.info('Starting comprehensive website testing suite...');

    // Parse command line arguments for specific test suite
    const args = process.argv.slice(2);
    const suite = args.find(arg => arg.startsWith('--suite='))?.split('=')[1];

    // Collect URLs to test
    const urls = await urlCollector.collect();
    logger.info(`Collected ${urls.length} URLs for testing`);

    // Initialize results object
    const results = {
      unit: [],
      integration: [],
      e2e: [],
      lighthouse: [],
      accessibility: [],
      seo: [],
      visual: [],
      language: [],
      headers: []
    };

    // Run tests based on suite argument or run all
    if (!suite || suite === 'unit') {
      results.unit = await runUnitTests();
    }
    
    if (!suite || suite === 'integration') {
      results.integration = await runIntegrationTests();
    }

    // Run URL-based tests
    for (const url of urls) {
      if (!suite || suite === 'e2e') {
        results.e2e.push(await runE2ETests(url));
      }
      if (!suite || suite === 'lighthouse') {
        results.lighthouse.push(await runLighthouseTests(url));
      }
      if (!suite || suite === 'accessibility') {
        results.accessibility.push(await runAccessibilityTests(url));
      }
      if (!suite || suite === 'seo') {
        results.seo.push(await runSeoTests(url));
      }
      if (!suite || suite === 'visual') {
        results.visual.push(await runVisualRegressionTests(url));
      }
      if (!suite || suite === 'language') {
        results.language.push(await runLanguageTests(url));
      }
      if (!suite || suite === 'headers') {
        results.headers.push(await runHeaderTests(url));
      }
    }

    // Generate comprehensive report
    const reportPath = await reportGenerator.generate(results);
    logger.info(`Report generated at: ${reportPath}`);

    // Send notifications
    await notificationManager.sendNotifications(results, reportPath);
    
    logger.info('Testing completed successfully');
    return {
      success: true,
      reportPath
    };
  } catch (error) {
    logger.error('Error during test execution:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute if called directly
if (require.main === module) {
  runTests()
    .then(result => {
      if (!result.success) {
        process.exit(1);
      }
    })
    .catch(() => process.exit(1));
}

module.exports = { runTests };
