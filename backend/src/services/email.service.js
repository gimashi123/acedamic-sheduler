import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { emailSettings } from '../controller/settings.controller.js';

dotenv.config();

// Email service class with support for multiple providers
class EmailService {
  constructor() {
    this.providers = [];
    this.initializeProviders();
  }

  // Initialize available email providers
  initializeProviders() {
    // Add Gmail provider if credentials are available
    const gmailEmail = emailSettings.email || process.env.EMAIL_SERVICE_EMAIL;
    const gmailPassword = emailSettings.password || process.env.EMAIL_SERVICE_PASSWORD;
    
    if (gmailEmail && gmailPassword) {
      this.addProvider('gmail', {
        service: 'gmail',
        auth: { user: gmailEmail, pass: gmailPassword }
      });
    }

    // Add SMTP provider if credentials are available
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    
    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      this.addProvider('smtp', {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === '465',
        auth: { user: smtpUser, pass: smtpPass }
      });
    }

    // Add Sendgrid provider if API key is available
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    if (sendgridApiKey) {
      this.addProvider('sendgrid', {
        service: 'SendGrid',
        auth: { api_key: sendgridApiKey }
      });
    }

    // Add more providers as needed...

    // Add a fallback console provider that just logs emails (always available)
    this.addProvider('console', {
      name: 'console-transport',
      version: '1.0.0',
      send: (mail, callback) => {
        const message = mail.message.toString();
        console.log('\n--- Email would be sent (CONSOLE FALLBACK) ---');
        console.log(`To: ${mail.data.to}`);
        console.log(`Subject: ${mail.data.subject}`);
        console.log(`Body: ${mail.data.text}`);
        console.log('--- End of email ---\n');
        callback(null, { response: 'Email logged to console' });
      }
    }, true); // true means this is a custom transport
  }

  // Add a provider to the list
  addProvider(name, config, isCustom = false) {
    let transport;
    
    if (isCustom) {
      transport = config;
    } else {
      transport = nodemailer.createTransport(config);
    }
    
    this.providers.push({
      name,
      transport,
      isCustom
    });
    
    console.log(`Email provider '${name}' added`);
  }

  // Send email using available providers with fallback
  async sendEmail(to, subject, text, html = null) {
    // Check if email is enabled in settings
    if (process.env.EMAIL_ENABLED !== 'true' && !emailSettings.isEnabled) {
      console.warn('Email notifications are disabled in settings.');
      return {
        success: false,
        message: 'Email notifications are disabled',
        provider: null
      };
    }

    // If no providers are available except console, log a warning
    if (this.providers.length === 1 && this.providers[0].name === 'console') {
      console.warn('No email providers configured. Using console fallback.');
    }

    // Try each provider in order until one succeeds
    for (const provider of this.providers) {
      try {
        const mailOptions = {
          from: this.getFromAddress(provider.name),
          to,
          subject,
          text
        };

        // Add HTML content if provided
        if (html) {
          mailOptions.html = html;
        }

        // Send the email
        if (provider.isCustom && provider.name === 'console') {
          // Handle console transport differently
          await new Promise((resolve) => {
            provider.transport.send({
              data: mailOptions,
              message: text
            }, () => resolve());
          });
        } else {
          // Regular nodemailer transport
          await provider.transport.sendMail(mailOptions);
        }

        console.log(`Email sent successfully using provider: ${provider.name}`);
        return {
          success: true,
          message: 'Email sent successfully',
          provider: provider.name
        };
      } catch (error) {
        console.error(`Failed to send email using provider ${provider.name}:`, error);
        // Continue to the next provider
      }
    }

    // If we get here, all providers failed
    return {
      success: false,
      message: 'Failed to send email with all configured providers',
      provider: null
    };
  }

  // Get the appropriate from address based on the provider
  getFromAddress(providerName) {
    switch (providerName) {
      case 'gmail':
        return emailSettings.email || process.env.EMAIL_SERVICE_EMAIL;
      case 'smtp':
        return process.env.SMTP_FROM || process.env.SMTP_USER;
      case 'sendgrid':
        return process.env.SENDGRID_FROM || 'noreply@academicscheduler.com';
      case 'console':
        return 'noreply@academicscheduler.com';
      default:
        return 'noreply@academicscheduler.com';
    }
  }

  // Generate HTML email template for account creation
  generateAccountCreationHtml(firstName, lastName, email, password) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4a6da7; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
          .credentials { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { font-size: 12px; color: #777; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Academic Scheduler - Account Created</h2>
          </div>
          <div class="content">
            <p>Dear ${firstName} ${lastName},</p>
            <p>Your account request has been approved. You can now log in to the Academic Scheduler system with the following credentials:</p>
            
            <div class="credentials">
              <p><strong>Username:</strong> ${email}</p>
              <p><strong>Password:</strong> ${password}</p>
            </div>
            
            <p><strong>Important:</strong> You will be required to change your password after your first login for security reasons.</p>
            
            <p>If you have any questions or need assistance, please contact the administrator.</p>
            
            <p>Best regards,<br>Academic Scheduler Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate HTML email template for request rejection
  generateRejectionHtml(firstName, lastName, reason) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #d32f2f; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
          .reason { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { font-size: 12px; color: #777; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Academic Scheduler - Request Rejected</h2>
          </div>
          <div class="content">
            <p>Dear ${firstName} ${lastName},</p>
            <p>We regret to inform you that your account request for the Academic Scheduler system has been rejected.</p>
            
            ${reason ? `
            <div class="reason">
              <p><strong>Reason:</strong> ${reason}</p>
            </div>
            ` : ''}
            
            <p>If you believe this is an error or if you have any questions, please contact the administrator.</p>
            
            <p>Best regards,<br>Academic Scheduler Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Create and export a singleton instance
const emailService = new EmailService();
export default emailService; 