# Website Testing Framework

A comprehensive automated testing framework developed by Gymnarctos Studios for web property quality assurance. This framework tests accessibility, performance, SEO, and visual appearance across multiple browsers.

## Features

- 🔍 **URL Collection**: Automatically collect URLs from sitemaps or by crawling pages
- 🚀 **Performance Testing**: Lighthouse performance metrics
- ♿ **Accessibility Testing**: WCAG compliance using axe-core
- 🔎 **SEO Testing**: Meta tags, headings, and other SEO factors
- 👁️ **Visual Regression**: Compare screenshots to detect visual changes
- 📊 **Reporting**: Comprehensive HTML and JSON reports
- 🔔 **Notifications**: Email alerts for test failures

## Prerequisites

- Node.js (v14+)
- Chrome browser (for Lighthouse and visual tests)
- Java Runtime Environment (for Selenium WebDriver)

## Installation

```bash
# Clone the repository
git clone https://github.com/gymnarctos-studios/website-testing-framework.git

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env
```

## Configuration

Configure the framework through environment variables in `.env`:

```env
# API and Service Keys
API_KEY=your_api_key_here

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=gymnarctosstudiosllc@gmail.com
SMTP_PASS=your-app-password
REPORT_EMAIL=gymnarctosstudiosllc@gmail.com

# Website Configuration
WEBSITE_URL=https://gymnarctosstudiosllc.com
SITEMAP_URL=https://gymnarctosstudiosllc.com/sitemap.xml
CRAWL_DEPTH=3

# Browser Configuration
HEADLESS=true
WINDOW_WIDTH=1366
WINDOW_HEIGHT=768
IMPLICIT_TIMEOUT=10000
EXPLICIT_TIMEOUT=30000
SCREENSHOT_DIR=./reports/screenshots
```

## Project Structure

```
website-testing-framework/
├── src/
│   ├── config/
│   │   ├── selenium-config.js       # Selenium WebDriver configuration
│   │   └── email-config.js          # Email configuration
│   ├── core/
│   │   ├── crawler.js               # Web crawler functionality
│   │   ├── sitemap-parser.js        # Sitemap XML parser
│   │   └── url-collector.js         # URL collection logic
│   ├── tests/
│   │   ├── accessibility-tests.js   # Accessibility compliance tests
│   │   ├── lighthouse-tests.js      # Performance testing
│   │   ├── seo-tests.js            # SEO factor tests
│   │   ├── visual-regression.js     # Visual comparison tests
│   │   └── e2e-tests.js            # End-to-end testing
│   ├── reports/
│   │   ├── report-generator.js      # Report generation
│   │   └── email-sender.js          # Email reporting
│   ├── utils/
│   │   ├── logger.js               # Logging functionality
│   │   └── helpers.js              # Utility functions
│   └── index.js                    # Application entry point
├── reports/
│   ├── screenshots/                # Test screenshots
│   ├── visual-diffs/              # Visual difference images
│   └── test-results/              # JSON and HTML results
```

## Usage

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:perf    # Performance only
npm run test:a11y    # Accessibility only
npm run test:seo     # SEO only
npm run test:visual  # Visual regression only
npm run test:e2e     # End-to-end tests only

# View the latest report
npm run report
```

### Test Workflow

1. **URL Collection**
   - Parses website's sitemap.xml
   - Falls back to crawling if sitemap unavailable

2. **Test Execution**
   - Runs Lighthouse performance metrics
   - Performs accessibility tests (WCAG compliance)
   - Checks SEO factors
   - Compares visual regression
   - Executes end-to-end scenarios

3. **Reporting**
   - Generates HTML/JSON reports
   - Creates visual diff images
   - Sends email notifications

### Automated Scheduling

Set up automated test runs using your system's scheduler:

```bash
# Linux/Mac (Cron example)
0 0 * * * cd /path/to/framework && npm test

# Windows (create run-tests.bat)
cd C:\path\to\framework
npm test
```

## Use Cases

- **Regular Testing**: Monitor website health daily/weekly
- **Pre-deployment**: Validate changes before deployment
- **Accessibility**: Ensure WCAG compliance
- **SEO**: Monitor SEO factors across site

## Troubleshooting

- **Email Issues**: Use app password for Gmail
- **Selenium Errors**: Verify browser driver installation
- **Timeout Errors**: Adjust timeout values in .env

## Dependencies

- [Selenium WebDriver](https://www.selenium.dev/documentation/webdriver/) - Browser automation
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing
- [axe-core](https://github.com/dequelabs/axe-core) - Accessibility testing
- [Puppeteer](https://pptr.dev/) - Headless browser automation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
© 2025 Gymnarctos Studios LLC
