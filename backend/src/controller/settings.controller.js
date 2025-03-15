import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { successResponse, errorResponse, HTTP_STATUS } from '../config/http.config.js';
import emailService from '../services/email.service.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_FILE_PATH = path.resolve(__dirname, '../../.env');

// Initialize env
dotenv.config();

// In-memory settings storage (could be replaced with database storage in production)
export const emailSettings = {
  isEnabled: process.env.EMAIL_ENABLED === 'true',
  service: 'gmail',
  email: process.env.EMAIL_SERVICE_EMAIL || '',
  password: process.env.EMAIL_SERVICE_PASSWORD || '',
};

// Get email settings
export const getEmailSettings = async (req, res) => {
  try {
    // Return settings without the password for security
    const safeSettings = {
      isEnabled: emailSettings.isEnabled,
      service: emailSettings.service,
      email: emailSettings.email,
      // Password is intentionally omitted
    };

    return successResponse(
      res,
      'Email settings retrieved successfully',
      HTTP_STATUS.OK,
      safeSettings
    );
  } catch (error) {
    console.error('Error getting email settings:', error);
    return errorResponse(
      res,
      'Server error',
      HTTP_STATUS.SERVER_ERROR
    );
  }
};

// Update email settings
export const updateEmailSettings = async (req, res) => {
  try {
    const { isEnabled, service, email, password } = req.body;

    // Validate input
    if (isEnabled && (!email || (!password && !emailSettings.password))) {
      return errorResponse(
        res,
        'Email and password are required when email notifications are enabled',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Update settings
    emailSettings.isEnabled = isEnabled;
    emailSettings.service = service || 'gmail';
    emailSettings.email = email || '';
    
    // Only update password if provided
    if (password) {
      emailSettings.password = password;
    }

    // Update environment variables (for current session only)
    process.env.EMAIL_ENABLED = isEnabled ? 'true' : 'false';
    process.env.EMAIL_SERVICE_EMAIL = email;
    if (password) {
      process.env.EMAIL_SERVICE_PASSWORD = password;
    }

    // Reinitialize email service providers with new settings
    emailService.initializeProviders();

    return successResponse(
      res,
      'Email settings updated successfully',
      HTTP_STATUS.OK,
      {
        isEnabled: emailSettings.isEnabled,
        service: emailSettings.service,
        email: emailSettings.email,
        // Password is intentionally omitted
      }
    );
  } catch (error) {
    console.error('Error updating email settings:', error);
    return errorResponse(
      res,
      'Server error',
      HTTP_STATUS.SERVER_ERROR
    );
  }
};

// Send test email
export const sendTestEmail = async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return errorResponse(
        res,
        'Email address is required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!emailSettings.isEnabled) {
      return errorResponse(
        res,
        'Email notifications are disabled in settings',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Generate HTML content for the test email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4a6da7; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
          .footer { font-size: 12px; color: #777; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Academic Scheduler - Test Email</h2>
          </div>
          <div class="content">
            <p>This is a test email from the Academic Scheduler system.</p>
            <p>If you received this email, it means your email configuration is working correctly.</p>
            <p>Time sent: ${new Date().toLocaleString()}</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send the test email
    const result = await emailService.sendEmail(
      to,
      'Academic Scheduler - Test Email',
      'This is a test email from the Academic Scheduler system. If you received this email, it means your email configuration is working correctly.',
      htmlContent
    );

    if (result.success) {
      return successResponse(
        res,
        'Test email sent successfully',
        HTTP_STATUS.OK,
        result
      );
    } else {
      return errorResponse(
        res,
        `Failed to send test email: ${result.message}`,
        HTTP_STATUS.BAD_REQUEST,
        result
      );
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return errorResponse(
      res,
      'Server error',
      HTTP_STATUS.SERVER_ERROR
    );
  }
}; 