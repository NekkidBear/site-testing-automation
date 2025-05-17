const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const logger = require('../utils/logger');

/**
 * Run Lighthouse tests for performance, PWA, best practices
 * @param {string} url - URL to test
 * @returns {Promise<Object>} Test results
 */
async function runLighthouseTests(url) {
  logger.info(`Running Lighthouse tests for: ${url}`);
  
  try {
    const chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
    });

    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
      port: chrome.port
    };

    const runnerResult = await lighthouse(url, options);
    await chrome.kill();

    const { categories } = runnerResult.lhr;
    
    return {
      url,
      timestamp: new Date().toISOString(),
      scores: {
        performance: categories.performance.score * 100,
        accessibility: categories.accessibility.score * 100,
        bestPractices: categories['best-practices'].score * 100,
        seo: categories.seo.score * 100,
        pwa: categories.pwa.score * 100
      },
      audits: runnerResult.lhr.audits
    };
  } catch (error) {
    logger.error(`Lighthouse test failed for ${url}:`, error);
    return {
      url,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

module.exports = {
  runLighthouseTests
};
