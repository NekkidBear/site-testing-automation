// filepath: /site-testing-automation/site-testing-automation/src/index.js
const SeleniumConfig = require('./config/selenium-config');
const EmailConfig = require('./config/email-config');
const Crawler = require('./core/crawler');
const UrlCollector = require('./core/url-collector');
const { runPageTests } = require('./tests/page-tests');
const { runAccessibilityTests } = require('./tests/accessibility-tests');
const { runPerformanceTests } = require('./tests/performance-tests');
const ReportGenerator = require('./reports/report-generator');
const EmailSender = require('./reports/email-sender');
const logger = require('./utils/logger');

(async () => {
    const seleniumConfig = new SeleniumConfig();
    const emailConfig = new EmailConfig();
    const crawler = new Crawler();
    const urlCollector = new UrlCollector();
    
    try {
        const sitemapUrl = 'https://gymnarctosstudiosllc.com/sitemap.xml';
        const urls = await urlCollector.collectUrls(sitemapUrl);

        for (const url of urls) {
            await runPageTests(url);
            await runAccessibilityTests(url);
            await runPerformanceTests(url);
        }

        const reportGenerator = new ReportGenerator();
        const reportPath = reportGenerator.generateReport(urls);
        
        const emailSender = new EmailSender(emailConfig);
        await emailSender.sendReport(reportPath, 'Test Report', 'Please find the attached test report.');

        logger.logInfo('Testing completed and report sent successfully.');
    } catch (error) {
        logger.logError('An error occurred during testing: ' + error.message);
    }
})();