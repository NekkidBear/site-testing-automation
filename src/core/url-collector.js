class UrlCollector {
  constructor(sitemapParser, crawler) {
    this.sitemapParser = sitemapParser;
    this.crawler = crawler;
    this.urls = new Set();
  }

  async collectUrls(sitemapUrl) {
    try {
      const sitemapUrls = await this.sitemapParser.parseSitemap(sitemapUrl);
      sitemapUrls.forEach(url => this.urls.add(url));
    } catch (error) {
      console.error('Error collecting URLs from sitemap:', error);
      console.log('Falling back to crawler...');
      const crawledUrls = await this.crawler.crawl();
      crawledUrls.forEach(url => this.urls.add(url));
    }
  }

  getUrls() {
    return Array.from(this.urls);
  }
}

module.exports = UrlCollector;