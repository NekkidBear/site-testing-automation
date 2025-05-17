const axios = require('axios');
const xml2js = require('xml2js');

/**
 * Parses the sitemap XML to extract URLs
 * @param {string} sitemapUrl - The URL of the sitemap
 * @returns {Promise<string[]>} - A promise that resolves to an array of URLs
 */
async function parseSitemap(sitemapUrl) {
  try {
    const response = await axios.get(sitemapUrl);
    const xml = response.data;

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xml);

    const urls = result.urlset.url.map(url => url.loc[0]);
    return urls;
  } catch (error) {
    throw new Error(`Failed to parse sitemap: ${error.message}`);
  }
}

module.exports = { parseSitemap };