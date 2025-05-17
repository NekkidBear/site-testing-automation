# Website Testing Framework

A comprehensive automated testing framework for web properties that covers all aspects of web testing including performance, accessibility, SEO, visual regression, language quality, and security.

## Features

- **Performance Testing** (Lighthouse)
  - Page load metrics
  - Core Web Vitals
  - Performance scoring
  - Resource optimization

- **Accessibility Testing** (axe-core)
  - WCAG compliance
  - Automated checks
  - Detailed violation reports
  - Remediation suggestions

- **SEO Testing**
  - Meta tags analysis
  - Heading structure
  - Link analysis
  - Google Search Console integration
  - Content optimization suggestions

- **Visual Regression Testing** (BackstopJS)
  - Cross-browser testing
  - Responsive design validation
  - Visual diff reports
  - Multiple viewport testing

- **Language Quality** (LanguageTool)
  - Grammar checking
  - Spell checking
  - Style consistency
  - Multi-language support

- **Security Headers**
  - HTTP header analysis
  - Security best practices
  - Cache configuration
  - SSL/TLS validation

- **Comprehensive Reporting**
  - HTML reports
  - Email notifications
  - Slack/Teams integration
  - Trend analysis

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/website-testing-framework.git
   cd website-testing-framework
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment configuration:
   ```bash
   cp src/.env.example .env
   ```

4. Update the `.env` file with your configuration values.

## Configuration

The framework is highly configurable through environment variables. See `.env.example` for all available options:

- Email settings for notifications
- Google API credentials
- Testing thresholds
- Feature flags
- Debug settings
- And more...

## Usage

Run all tests:
```bash
npm test
```

Run specific test suites:
```bash
npm run test:perf      # Performance tests
npm run test:a11y      # Accessibility tests
npm run test:seo       # SEO tests
npm run test:visual    # Visual regression tests
npm run test:language  # Language quality tests
npm run test:headers   # Security headers tests
npm run test:unit      # Unit tests
npm run test:integration # Integration tests
```

View the latest report:
```bash
npm run report
```

## Visual Regression Testing

For visual regression testing:

1. Generate reference images:
   ```bash
   npm run reference
   ```

2. Compare against reference:
   ```bash
   npm run compare
   ```

## Reports

Reports are generated in the `reports/test-results` directory:
- HTML report with detailed test results
- JSON data for programmatic access
- Screenshots and visual diffs
- Coverage reports for unit tests

## Notifications

The framework can send notifications through:
- Email (using SMTP/Gmail)
- Slack webhooks
- Microsoft Teams webhooks

Configure notification settings in the `.env` file.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Dependencies

Major dependencies include:
- Lighthouse for performance testing
- axe-core for accessibility testing
- BackstopJS for visual regression
- LanguageTool for language quality
- Jest for unit testing
- Puppeteer for browser automation
- And more (see package.json)

## Troubleshooting

### Common Issues

1. **Chrome/Puppeteer Issues**
   - Ensure Chrome is installed
   - Try running with --no-sandbox flag
   - Check system dependencies

2. **API Rate Limits**
   - Configure MAX_REQUESTS_PER_SECOND
   - Use appropriate API keys
   - Check service quotas

3. **Visual Regression Failures**
   - Verify viewport sizes
   - Check for dynamic content
   - Adjust comparison threshold

### Debug Mode

Enable debug mode in `.env`:
```
DEBUG=true
LOG_LEVEL=debug
SAVE_HTML_SNAPSHOT=true
SAVE_CONSOLE_LOGS=true
```

## Support

For support, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue if needed
