import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { successResponse, errorResponse, HTTP_STATUS } from '../config/http.config.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_FILE_PATH = path.resolve(__dirname, '../../.env');

// Initialize env
dotenv.config();

// Store email settings in memory for fallback if .env cannot be updated
export let emailSettings = {
  email: process.env.EMAIL_SERVICE_EMAIL || '',
  password: process.env.EMAIL_SERVICE_PASSWORD || '',
  isEnabled: process.env.EMAIL_ENABLED === 'true',
};

// Get current email settings
export const getEmailSettings = async (req, res) => {
  try {
    return successResponse(
      res,
      'Email settings retrieved successfully',
      HTTP_STATUS.OK,
      {
        email: emailSettings.email,
        isEnabled: emailSettings.isEnabled,
        // Don't return the password
      }
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
    const { email, password, isEnabled } = req.body;
    
    // Update in-memory settings first
    emailSettings = {
      email: email || '',
      password: password || '',
      isEnabled: isEnabled === true,
    };

    // Update environment variables
    process.env.EMAIL_SERVICE_EMAIL = email || '';
    process.env.EMAIL_SERVICE_PASSWORD = password || '';
    process.env.EMAIL_ENABLED = isEnabled === true ? 'true' : 'false';
    
    // Try to update .env file, but don't fail if it can't be updated
    try {
      // Read existing .env file content
      let envContent = '';
      if (fs.existsSync(ENV_FILE_PATH)) {
        envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
      }

      // Parse the existing entries
      const envLines = envContent.split('\n').filter(line => 
        !line.startsWith('EMAIL_SERVICE_EMAIL=') && 
        !line.startsWith('EMAIL_SERVICE_PASSWORD=') && 
        !line.startsWith('EMAIL_ENABLED=')
      );

      // Add our updated values
      envLines.push(`EMAIL_SERVICE_EMAIL=${email || ''}`);
      if (password) {
        envLines.push(`EMAIL_SERVICE_PASSWORD=${password}`);
      } else if (process.env.EMAIL_SERVICE_PASSWORD) {
        // Keep existing password if not provided
        envLines.push(`EMAIL_SERVICE_PASSWORD=${process.env.EMAIL_SERVICE_PASSWORD}`);
      }
      envLines.push(`EMAIL_ENABLED=${isEnabled === true ? 'true' : 'false'}`);

      // Write back to the file
      fs.writeFileSync(ENV_FILE_PATH, envLines.join('\n') + '\n');
    } catch (fileError) {
      console.warn('Could not update .env file:', fileError);
      // This is not a critical error, we continue with the in-memory settings
    }

    return successResponse(
      res,
      'Email settings updated successfully',
      HTTP_STATUS.OK,
      { isEnabled: emailSettings.isEnabled }
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

// Test email configuration
export const testEmailSettings = async (req, res) => {
  try {
    const { testEmail } = req.body;
    
    if (!testEmail) {
      return errorResponse(
        res,
        'Test email address is required',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    if (!emailSettings.isEnabled) {
      return errorResponse(
        res,
        'Email notifications are currently disabled',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    if (!emailSettings.email || !emailSettings.password) {
      return errorResponse(
        res,
        'Email settings are incomplete. Please check your configuration.',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Set up the transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailSettings.email,
        pass: emailSettings.password,
      },
    });
    
    // Send a test email
    await transporter.sendMail({
      from: emailSettings.email,
      to: testEmail,
      subject: 'Academic Scheduler - Test Email',
      text: `This is a test email from the Academic Scheduler system.
      
If you received this email, it means your email configuration is working correctly.

Best regards,
Academic Scheduler Team`,
    });
    
    return successResponse(
      res,
      'Test email sent successfully',
      HTTP_STATUS.OK,
      {}
    );
  } catch (error) {
    console.error('Error sending test email:', error);
    return errorResponse(
      res,
      `Failed to send test email: ${error.message}`,
      HTTP_STATUS.SERVER_ERROR
    );
  }
}; 