const puppeteer = require('puppeteer');
const { google } = require('googleapis');
const logger = require('../utils/logger');

/**
 * Run SEO tests using on-page analysis and Google Search Console data
 * @param {string} url - URL to test
 * @returns {Promise<Object>} Test results
 */
async function runSeoTests(url) {
  logger.info(`Running SEO tests for: ${url}`);
  
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    await page.goto(url);

    // Analyze meta tags
    const metaTags = await page.evaluate(() => {
      const tags = {};
      document.querySelectorAll('meta').forEach(tag => {
        const name = tag.getAttribute('name') || tag.getAttribute('property');
        if (name) {
          tags[name] = tag.getAttribute('content');
        }
      });
      return tags;
    });

    // Analyze headings structure
    const headings = await page.evaluate(() => {
      const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
      const headingsData = {};
      
      headingTags.forEach(tag => {
        const elements = document.getElementsByTagName(tag);
        headingsData[tag] = {
          count: elements.length,
          texts: Array.from(elements).map(el => el.textContent.trim())
        };
      });
      
      return headingsData;
    });

    // Analyze links
    const links = await page.evaluate(() => {
      return {
        internal: Array.from(document.querySelectorAll('a[href^="/"], a[href^="."], a[href^="#"]')).length,
        external: Array.from(document.querySelectorAll('a[href^="http"]')).length,
        broken: Array.from(document.querySelectorAll('a')).filter(a => !a.href).length
      };
    });

    // Get image optimization data
    const images = await page.evaluate(() => {
      return Array.from(document.images).map(img => ({
        src: img.src,
        hasAlt: !!img.alt,
        altText: img.alt,
        width: img.width,
        height: img.height
      }));
    });

    await browser.close();

    // Try to get Search Console data if credentials are available
    let searchConsoleData = null;
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        const searchconsole = google.searchconsole('v1');
        const auth = new google.auth.GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
        });
        const authClient = await auth.getClient();
        
        // Get last 30 days of data
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        
        const response = await searchconsole.searchanalytics.query({
          auth: authClient,
          siteUrl: url,
          requestBody: {
            startDate: thirtyDaysAgo.toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            dimensions: ['query'],
            rowLimit: 10
          }
        });
        
        searchConsoleData = response.data;
      } catch (error) {
        logger.warn('Could not fetch Search Console data:', error.message);
      }
    }

    // Calculate overall score based on various factors
    const score = calculateSeoScore({
      hasTitle: !!metaTags['title'],
      hasDescription: !!metaTags['description'],
      hasH1: headings.h1.count === 1,
      hasValidHeadings: validateHeadingsStructure(headings),
      imagesHaveAlt: images.every(img => img.hasAlt),
      hasSitemap: await checkSitemap(url),
      hasRobotsTxt: await checkRobotsTxt(url)
    });

    return {
      url,
      timestamp: new Date().toISOString(),
      score,
      analysis: {
        metaTags,
        headings,
        links,
        images: {
          total: images.length,
          withAlt: images.filter(img => img.hasAlt).length,
          withoutAlt: images.filter(img => !img.hasAlt).length
        }
      },
      searchConsoleData,
      recommendations: generateRecommendations({
        metaTags,
        headings,
        links,
        images
      })
    };
  } catch (error) {
    logger.error(`SEO test failed for ${url}:`, error);
    return {
      url,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

/**
 * Calculate SEO score based on various factors
 * @param {Object} factors - SEO factors to consider
 * @returns {number} Score from 0-100
 */
function calculateSeoScore(factors) {
  const weights = {
    hasTitle: 15,
    hasDescription: 15,
    hasH1: 10,
    hasValidHeadings: 10,
    imagesHaveAlt: 10,
    hasSitemap: 20,
    hasRobotsTxt: 20
  };

  return Object.entries(factors).reduce((score, [factor, value]) => {
    return score + (value ? weights[factor] : 0);
  }, 0);
}

/**
 * Validate headings structure
 * @param {Object} headings - Headings data
 * @returns {boolean} Whether headings structure is valid
 */
function validateHeadingsStructure(headings) {
  // Check if there's exactly one H1
  if (headings.h1.count !== 1) return false;

  // Check if headings are in proper order (no skipping levels)
  for (let i = 1; i < 6; i++) {
    if (headings[`h${i}`].count === 0 && headings[`h${i + 1}`].count > 0) {
      return false;
    }
  }

  return true;
}

/**
 * Check if sitemap.xml exists
 * @param {string} baseUrl - Base URL of the website
 * @returns {Promise<boolean>} Whether sitemap exists
 */
async function checkSitemap(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/sitemap.xml`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Check if robots.txt exists
 * @param {string} baseUrl - Base URL of the website
 * @returns {Promise<boolean>} Whether robots.txt exists
 */
async function checkRobotsTxt(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/robots.txt`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Generate SEO recommendations based on analysis
 * @param {Object} analysis - Analysis results
 * @returns {Array<string>} List of recommendations
 */
function generateRecommendations({ metaTags, headings, links, images }) {
  const recommendations = [];

  if (!metaTags['title']) {
    recommendations.push('Add a title tag to the page');
  }
  if (!metaTags['description']) {
    recommendations.push('Add a meta description to the page');
  }
  if (headings.h1.count !== 1) {
    recommendations.push('Ensure the page has exactly one H1 heading');
  }
  if (images.some(img => !img.hasAlt)) {
    recommendations.push('Add alt text to all images');
  }
  if (links.broken > 0) {
    recommendations.push(`Fix ${links.broken} broken links`);
  }

  return recommendations;
}

module.exports = {
  runSeoTests
};
