const axios = require('axios');
const { parseSitemap } = require('./sitemap-parser');
const { URL } = require('url');

/**
 * Crawler class to fetch URLs from a website
 */
class Crawler {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Crawls the website to fetch URLs
   * @returns {Promise<string[]>} - Array of URLs
   */
  async crawl() {
    try {
      const sitemapUrl = new URL('/sitemap.xml', this.baseUrl).href;
      const urls = await this.fetchUrls(sitemapUrl);
      return urls.length > 0 ? urls : await this.crawlSite();
    } catch (error) {
      console.error('Error during crawling:', error);
      return [];
    }
  }

  /**
   * Fetches URLs from the sitemap
   * @param {string} sitemapUrl - The URL of the sitemap
   * @returns {Promise<string[]>} - Array of URLs
   */
  async fetchUrls(sitemapUrl) {
    try {
      const response = await axios.get(sitemapUrl);
      return parseSitemap(response.data);
    } catch (error) {
      console.error('Error fetching sitemap:', error);
      return [];
    }
  }

  /**
   * Crawls the site to collect URLs if the sitemap is unavailable
   * @returns {Promise<string[]>} - Array of URLs
   */
  async crawlSite() {
    // Implement site crawling logic here
    // This could involve fetching the homepage and following links
    console.warn('Sitemap unavailable, crawling the site directly is not implemented yet.');
    return [];
  }
}

module.exports = Crawler;