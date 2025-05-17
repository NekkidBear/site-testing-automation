class EmailConfig {
  constructor(config = {}) {
    this.config = {
      host: config.host || 'smtp.example.com',
      port: config.port || 587,
      secure: config.secure || false,
      user: config.user || 'your-email@example.com',
      pass: config.pass || 'your-email-password',
      from: config.from || 'your-email@example.com',
      to: config.to || 'recipient@example.com',
      subject: config.subject || 'Test Report',
      text: config.text || 'Please find the attached test report.',
      html: config.html || '<p>Please find the attached test report.</p>',
      ...config
    };
  }

  configureTransport() {
    const nodemailer = require('nodemailer');
    return nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: {
        user: this.config.user,
        pass: this.config.pass
      }
    });
  }

  async sendEmail(reportPath) {
    const transporter = this.configureTransport();
    const mailOptions = {
      from: this.config.from,
      to: this.config.to,
      subject: this.config.subject,
      text: this.config.text,
      html: this.config.html,
      attachments: [
        {
          path: reportPath
        }
      ]
    };

    return transporter.sendMail(mailOptions);
  }
}

module.exports = EmailConfig;