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
    const gmailPassword =
      emailSettings.password || process.env.EMAIL_SERVICE_PASSWORD;

    if (gmailEmail && gmailPassword) {
      this.addProvider('gmail', {
        service: 'gmail',
        auth: { user: gmailEmail, pass: gmailPassword },
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
        auth: { user: smtpUser, pass: smtpPass },
      });
    }

    // Add Sendgrid provider if API key is available
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    if (sendgridApiKey) {
      this.addProvider('sendgrid', {
        service: 'SendGrid',
        auth: { api_key: sendgridApiKey },
      });
    }

    // Add a fallback console provider that just logs emails (always available)
    this.addProvider(
      'console',
      {
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
        },
      },
      true,
    ); // true means this is a custom transport
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
      isCustom,
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
        provider: null,
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
          text,
        };

        // Add HTML content if provided
        if (html) {
          mailOptions.html = html;
        }

        // Send the email
        if (provider.isCustom && provider.name === 'console') {
          // Handle console transport differently
          await new Promise((resolve) => {
            provider.transport.send(
              {
                data: mailOptions,
                message: text,
              },
              () => resolve(),
            );
          });
        } else {
          // Regular nodemailer transport
          await provider.transport.sendMail(mailOptions);
        }

        console.log(`Email sent successfully using provider: ${provider.name}`);
        return {
          success: true,
          message: 'Email sent successfully',
          provider: provider.name,
        };
      } catch (error) {
        console.error(
          `Failed to send email using provider ${provider.name}:`,
          error,
        );
        // Continue to the next provider
      }
    }

    // If we get here, all providers failed
    return {
      success: false,
      message: 'Failed to send email with all configured providers',
      provider: null,
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
          .header { background-color: #d9534f; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
          .reason { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { font-size: 12px; color: #777; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Academic Scheduler - Registration Request Rejected</h2>
          </div>
          <div class="content">
            <p>Dear ${firstName} ${lastName},</p>
            <p>We regret to inform you that your registration request for the Academic Scheduler system has been rejected.</p>
            
            ${
              reason
                ? `
            <div class="reason">
              <p><strong>Reason:</strong> ${reason}</p>
            </div>
            `
                : ''
            }
            
            <p>If you believe this is an error or would like to provide additional information, please contact the administrator.</p>
            
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

  // Generate HTML email template for password change notification
  generatePasswordChangeHtml(firstName, lastName, email, newPassword = null) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #5bc0de; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
          .credentials { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .warning { color: #d9534f; font-weight: bold; }
          .footer { font-size: 12px; color: #777; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Academic Scheduler - Password ${newPassword ? 'Updated' : 'Changed'}</h2>
          </div>
          <div class="content">
            <p>Dear ${firstName} ${lastName},</p>
            
            <p>Your password has been ${newPassword ? 'updated' : 'changed'} in the Academic Scheduler system.</p>
            
            <div class="credentials">
              <p><strong>Username:</strong> ${email}</p>
              <p><strong>Password:</strong> ${newPassword || '[Your new password]'}</p>
            </div>
            
            <p class="warning">Important: Please keep this information secure. Do not share your password with anyone.</p>
            
            <p>If you did not make this change, please contact the administrator immediately.</p>
            
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

  // Send password update notification email with the new password
  async sendPasswordUpdateEmail(email, newPassword) {
    try {
      // Find user by email to get their name
      const User = (await import('../models/user.model.js')).default;
      const user = await User.findOne({ email });

      if (!user) {
        console.error(
          `User with email ${email} not found for password update notification`,
        );
        return {
          success: false,
          message: 'User not found',
          provider: null,
        };
      }

      const subject = 'Academic Scheduler - Password Update';
      const text = `Dear ${user.firstName} ${user.lastName},\n\nYour password has been updated in the Academic Scheduler system.\n\nUsername: ${email}\nPassword: ${newPassword}\n\nImportant: Please keep this information secure. Do not share your password with anyone.\n\nIf you did not make this change, please contact the administrator immediately.\n\nBest regards,\nAcademic Scheduler Team`;
      const html = this.generatePasswordChangeHtml(
        user.firstName,
        user.lastName,
        user.email,
        newPassword,
      );

      return await this.sendEmail(email, subject, text, html);
    } catch (error) {
      console.error('Error sending password update notification:', error);
      return {
        success: false,
        message: error.message,
        provider: null,
      };
    }
  }
}

// Create and export a singleton instance
const emailService = new EmailService();
export default emailService;
