require('dotenv').config();

class EmailConfig {
  constructor(config = {}) {
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
      from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: process.env.EMAIL_SUBJECT || 'Test Report',
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
