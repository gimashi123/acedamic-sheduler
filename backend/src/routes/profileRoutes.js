import express from 'express';
import User from '../models/user.model.js';
import upload from '../middleware/multerConfig.js';
import fs from 'fs';
import path from 'path';
import { authenticateToken as auth } from '../middleware/jwt.middleware.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Upload or change profile picture
router.post('/profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    // Log the user object from the token for debugging
    console.log('User object from token:', JSON.stringify(req.user));
    
    const userId = req.user.userId;
    console.log('Using user ID:', userId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with ID: ' + userId
      });
    }
    
    // Delete previous profile picture if it exists and is not the default
    if (user.profilePicture && user.profilePicture !== 'default-profile.jpg') {
      const oldPicturePath = path.join(__dirname, '../../uploads/profile-pictures/', path.basename(user.profilePicture));
      console.log('Attempting to delete old profile picture at:', oldPicturePath);
      
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
        console.log('Successfully deleted old profile picture');
      } else {
        console.log('Old profile picture not found at expected path');
      }
    }
    
    // Update user profile with new picture
    user.profilePicture = req.file.filename;
    await user.save();
    
    // Get the server's base URL from the request
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const profilePictureUrl = `${baseUrl}/uploads/profile-pictures/${req.file.filename}`;
    
    console.log('Profile picture URL:', profilePictureUrl);
    
    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profilePicture: {
          url: profilePictureUrl,
          filename: req.file.filename,
          key: req.file.filename
        }
      }
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while uploading profile picture' 
    });
  }
});

// Delete profile picture (reset to default)
router.delete('/profile-picture', auth, async (req, res) => {
  try {
    console.log('User object from token:', JSON.stringify(req.user));
    
    const userId = req.user.userId;
    console.log('Using user ID:', userId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with ID: ' + userId
      });
    }
    
    // Delete current profile picture if it's not the default
    if (user.profilePicture && user.profilePicture !== 'default-profile.jpg') {
      const picturePath = path.join(__dirname, '../../uploads/profile-pictures/', path.basename(user.profilePicture));
      console.log('Attempting to delete profile picture at:', picturePath);
      
      if (fs.existsSync(picturePath)) {
        fs.unlinkSync(picturePath);
        console.log('Successfully deleted profile picture');
      } else {
        console.log('Profile picture not found at expected path');
      }
      
      // Reset to default
      user.profilePicture = 'default-profile.jpg';
      await user.save();
    }
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const defaultProfilePictureUrl = `${baseUrl}/uploads/profile-pictures/default-profile.jpg`;
    
    res.status(200).json({
      success: true,
      message: 'Profile picture removed successfully',
      data: {
        profilePicture: {
          url: defaultProfilePictureUrl,
          filename: 'default-profile.jpg',
          key: 'default-profile.jpg'
        }
      }
    });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting profile picture' 
    });
  }
});

// Get profile picture
router.get('/profile-picture', auth, async (req, res) => {
  try {
    console.log('User object from token:', JSON.stringify(req.user));
    
    const userId = req.user.userId;
    console.log('Using user ID:', userId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with ID: ' + userId
      });
    }
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const profilePictureUrl = `${baseUrl}/uploads/profile-pictures/${user.profilePicture}`;
    
    res.status(200).json({
      success: true,
      data: {
        profilePicture: {
          url: profilePictureUrl,
          filename: user.profilePicture,
          key: user.profilePicture
        }
      }
    });
  } catch (error) {
    console.error('Error getting profile picture:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while getting profile picture' 
    });
  }
});

export default router; 