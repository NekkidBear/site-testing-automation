const puppeteer = require('puppeteer');
const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Run language tests using LanguageTool API
 * @param {string} url - URL to test
 * @returns {Promise<Object>} Test results
 */
async function runLanguageTests(url) {
  logger.info(`Running language tests for: ${url}`);
  
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    await page.goto(url);

    // Extract all text content from the page
    const textContent = await page.evaluate(() => {
      // Get text from these specific elements
      const selectors = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'li', 'dt', 'dd',
        'button', 'a',
        'label', 'input[type="submit"]',
        'meta[name="description"]'
      ];

      const textNodes = [];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          let text;
          if (selector === 'meta[name="description"]') {
            text = element.getAttribute('content');
          } else if (selector === 'input[type="submit"]') {
            text = element.value;
          } else {
            text = element.innerText;
          }
          
          if (text && text.trim()) {
            textNodes.push({
              text: text.trim(),
              selector: selector,
              path: getElementPath(element)
            });
          }
        });
      });

      // Helper function to get element's path
      function getElementPath(element) {
        const path = [];
        while (element && element.nodeType === Node.ELEMENT_NODE) {
          let selector = element.nodeName.toLowerCase();
          if (element.id) {
            selector += '#' + element.id;
          } else {
            let sibling = element;
            let nth = 1;
            while (sibling.previousElementSibling) {
              sibling = sibling.previousElementSibling;
              if (sibling.nodeName.toLowerCase() === selector) nth++;
            }
            if (nth !== 1) selector += ":nth-of-type("+nth+")";
          }
          path.unshift(selector);
          element = element.parentNode;
        }
        return path.join(' > ');
      }

      return textNodes;
    });

    await browser.close();

    // Check text using LanguageTool API
    const languageToolUrl = process.env.LANGUAGE_TOOL_URL || 'https://api.languagetool.org/v2/check';
    const results = [];
    
    for (const node of textContent) {
      try {
        const response = await axios.post(languageToolUrl, {
          text: node.text,
          language: 'en-US',
          disabledRules: 'WHITESPACE_RULE'  // Ignore whitespace issues
        });

        if (response.data.matches.length > 0) {
          results.push({
            text: node.text,
            location: node.path,
            issues: response.data.matches.map(match => ({
              message: match.message,
              suggestions: match.replacements.map(r => r.value),
              rule: match.rule.id,
              category: match.rule.category.id,
              offset: match.offset,
              length: match.length
            }))
          });
        }
      } catch (error) {
        logger.warn(`Language check failed for text "${node.text}":`, error.message);
      }
    }

    // Calculate score based on number of issues relative to content length
    const totalWords = textContent.reduce((count, node) => 
      count + node.text.split(/\s+/).length, 0);
    const totalIssues = results.reduce((count, result) => 
      count + result.issues.length, 0);
    const score = Math.max(0, 100 - (totalIssues / totalWords * 1000));

    // Group issues by category
    const issuesByCategory = results.reduce((categories, result) => {
      result.issues.forEach(issue => {
        if (!categories[issue.category]) {
          categories[issue.category] = [];
        }
        categories[issue.category].push({
          text: result.text,
          location: result.location,
          message: issue.message,
          suggestions: issue.suggestions
        });
      });
      return categories;
    }, {});

    return {
      url,
      timestamp: new Date().toISOString(),
      score,
      summary: {
        totalWords,
        totalIssues,
        issuesByCategory: Object.entries(issuesByCategory).map(([category, issues]) => ({
          category,
          count: issues.length
        }))
      },
      details: {
        results,
        categorizedIssues: issuesByCategory
      }
    };
  } catch (error) {
    logger.error(`Language test failed for ${url}:`, error);
    return {
      url,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

module.exports = {
  runLanguageTests
};
