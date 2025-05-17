// filepath: /site-testing-automation/site-testing-automation/src/config/selenium-config.js
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const safari = require('selenium-webdriver/safari');
const fs = require('fs');
const path = require('path');

/**
 * Configuration for Selenium WebDriver
 */
class SeleniumConfig {
  constructor(config = {}) {
    this.config = {
      browsers: config.browsers || ['chrome', 'firefox'],
      headless: config.headless !== undefined ? config.headless : true,
      windowSize: config.windowSize || { width: 1366, height: 768 },
      implicitTimeout: config.implicitTimeout || 10000,
      explicitTimeout: config.explicitTimeout || 30000,
      screenshotsDir: config.screenshotsDir || './reports/screenshots',
      ...config
    };

    if (!fs.existsSync(this.config.screenshotsDir)) {
      fs.mkdirSync(this.config.screenshotsDir, { recursive: true });
    }
  }

  async createDriver(browserName) {
    let driver;
    let options;
    
    switch (browserName.toLowerCase()) {
      case 'chrome':
        options = new chrome.Options();
        if (this.config.headless) options.addArguments('--headless=new');
        options.addArguments(`--window-size=${this.config.windowSize.width},${this.config.windowSize.height}`);
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
        break;
        
      case 'firefox':
        options = new firefox.Options();
        if (this.config.headless) options.addArguments('--headless');
        options.addArguments(`--width=${this.config.windowSize.width}`);
        options.addArguments(`--height=${this.config.windowSize.height}`);
        driver = await new Builder().forBrowser('firefox').setFirefoxOptions(options).build();
        break;
        
      case 'edge':
        options = new edge.Options();
        if (this.config.headless) options.addArguments('--headless');
        options.addArguments(`--window-size=${this.config.windowSize.width},${this.config.windowSize.height}`);
        driver = await new Builder().forBrowser('MicrosoftEdge').setEdgeOptions(options).build();
        break;
        
      case 'safari':
        options = new safari.Options();
        driver = await new Builder().forBrowser('safari').setSafariOptions(options).build();
        break;
        
      default:
        throw new Error(`Unsupported browser: ${browserName}`);
    }

    await driver.manage().setTimeouts({ implicit: this.config.implicitTimeout });
    
    return driver;
  }

  async takeScreenshot(driver, testName, browserName = 'browser') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotName = `${testName}_${browserName}_${timestamp}.png`;
    const screenshotPath = path.join(this.config.screenshotsDir, screenshotName);
    
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    
    return screenshotPath;
  }
}

module.exports = SeleniumConfig;