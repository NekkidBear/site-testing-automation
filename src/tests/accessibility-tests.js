const axe = require('axe-core');
const puppeteer = require('puppeteer');
const logger = require('../utils/logger');

/**
 * Run accessibility tests using axe-core and WAVE
 * @param {string} url - URL to test
 * @returns {Promise<Object>} Test results
 */
async function runAccessibilityTests(url) {
  logger.info(`Running accessibility tests for: ${url}`);
  
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Inject axe-core
    await page.goto(url);
    await page.addScriptTag({ content: axe.source });

    // Run axe analysis
    const results = await page.evaluate(async () => {
      return await axe.run();
    });

    await browser.close();

    // Process results
    const violations = results.violations.map(violation => ({
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map(node => ({
        html: node.html,
        failureSummary: node.failureSummary,
        target: node.target
      }))
    }));

    const incomplete = results.incomplete.map(check => ({
      impact: check.impact,
      description: check.description,
      help: check.help,
      helpUrl: check.helpUrl,
      nodes: check.nodes.map(node => ({
        html: node.html,
        failureSummary: node.failureSummary,
        target: node.target
      }))
    }));

    // Calculate scores
    const totalChecks = results.passes.length + violations.length;
    const score = (results.passes.length / totalChecks) * 100;

    return {
      url,
      timestamp: new Date().toISOString(),
      score,
      summary: {
        violations: violations.length,
        passes: results.passes.length,
        incomplete: incomplete.length,
        total: totalChecks
      },
      details: {
        violations,
        incomplete
      },
      engine: {
        name: 'axe-core',
        version: results.testEngine.version
      }
    };
  } catch (error) {
    logger.error(`Accessibility test failed for ${url}:`, error);
    return {
      url,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

module.exports = {
  runAccessibilityTests
};
