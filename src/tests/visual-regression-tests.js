const backstop = require('backstopjs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Run visual regression tests using BackstopJS
 * @param {string} url - URL to test
 * @returns {Promise<Object>} Test results
 */
async function runVisualRegressionTests(url) {
  logger.info(`Running visual regression tests for: ${url}`);
  
  try {
    const config = {
      id: `visual_test_${Date.now()}`,
      viewports: [
        {
          label: 'phone',
          width: 320,
          height: 480
        },
        {
          label: 'tablet',
          width: 1024,
          height: 768
        },
        {
          label: 'desktop',
          width: 1920,
          height: 1080
        }
      ],
      scenarios: [
        {
          label: 'Homepage',
          url: url,
          hideSelectors: [],
          removeSelectors: [],
          selectors: ['document'],
          readyEvent: '',
          delay: 500,
          misMatchThreshold: 0.1
        }
      ],
      paths: {
        bitmaps_reference: path.join(process.cwd(), 'reports', 'visual', 'reference'),
        bitmaps_test: path.join(process.cwd(), 'reports', 'visual', 'test'),
        html_report: path.join(process.cwd(), 'reports', 'visual'),
        ci_report: path.join(process.cwd(), 'reports', 'visual', 'ci')
      },
      report: ['browser', 'CI'],
      engine: 'puppeteer',
      engineOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      },
      asyncCaptureLimit: 5,
      asyncCompareLimit: 50,
      debug: false,
      debugWindow: false
    };

    // First run: If no reference images exist, create them
    try {
      await backstop('reference', { config });
      logger.info('Created reference images for visual testing');
    } catch (error) {
      logger.warn('Reference images already exist, proceeding with comparison');
    }

    // Run the test
    const results = await backstop('test', { config });

    // Process and format the results
    const testResults = results.tests.map(test => ({
      viewport: test.viewport,
      status: test.status,
      mismatch: test.mismatch,
      diffImage: test.diffImage,
      referenceImage: test.referenceImage,
      testImage: test.testImage
    }));

    // Calculate overall score
    const passedTests = testResults.filter(test => test.status === 'pass').length;
    const score = (passedTests / testResults.length) * 100;

    return {
      url,
      timestamp: new Date().toISOString(),
      score,
      summary: {
        total: testResults.length,
        passed: passedTests,
        failed: testResults.length - passedTests
      },
      details: testResults,
      reportPath: path.join(config.paths.html_report, 'index.html')
    };
  } catch (error) {
    logger.error(`Visual regression test failed for ${url}:`, error);
    return {
      url,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

module.exports = {
  runVisualRegressionTests
};
