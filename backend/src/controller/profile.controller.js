import User from '../models/user.model.js';
import { uploadToS3, deleteFileFromS3 } from '../services/s3.service.js';
import {
  errorResponse,
  HTTP_STATUS,
  successResponse,
} from '../config/http.config.js';

// Upload profile picture
export const uploadProfilePicture = (req, res) => {
  uploadToS3(req, res, async (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return errorResponse(
        res,
        err.message || 'Error uploading file',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!req.file) {
      return errorResponse(
        res,
        'No file uploaded',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    try {
      const userId = req.user._id;
      const user = await User.findById(userId);

      if (!user) {
        return errorResponse(
          res,
          'User not found',
          HTTP_STATUS.NOT_FOUND
        );
      }

      // If user already has a profile picture, delete it from S3
      if (user.profilePicture && user.profilePicture.key) {
        try {
          await deleteFileFromS3(user.profilePicture.key);
        } catch (deleteErr) {
          console.error('Error deleting previous profile picture:', deleteErr);
          // Continue even if deletion fails
        }
      }

      // Update user with new profile picture info
      user.profilePicture = {
        key: req.file.key,
        url: req.file.location,
      };

      await user.save();

      successResponse(
        res,
        'Profile picture uploaded successfully',
        HTTP_STATUS.OK,
        {
          profilePicture: user.profilePicture,
        }
      );
    } catch (error) {
      console.error('Error saving profile picture:', error);
      errorResponse(
        res,
        'Error saving profile picture',
        HTTP_STATUS.SERVER_ERROR,
        error
      );
    }
  });
};

// Delete profile picture
export const deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(
        res,
        'User not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Check if user has a profile picture
    if (!user.profilePicture || !user.profilePicture.key) {
      return errorResponse(
        res,
        'No profile picture found',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Delete file from S3
    await deleteFileFromS3(user.profilePicture.key);

    // Update user record
    user.profilePicture = {
      key: null,
      url: null,
    };

    await user.save();

    successResponse(
      res,
      'Profile picture deleted successfully',
      HTTP_STATUS.OK
    );
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    errorResponse(
      res,
      'Error deleting profile picture',
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
};

// Get current user's profile picture
export const getProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(
        res,
        'User not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    successResponse(
      res,
      'Profile picture retrieved successfully',
      HTTP_STATUS.OK,
      {
        profilePicture: user.profilePicture,
      }
    );
  } catch (error) {
    console.error('Error retrieving profile picture:', error);
    errorResponse(
      res,
      'Error retrieving profile picture',
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
};

// Update user profile picture by admin (for a specific user)
export const updateUserProfilePicture = (req, res) => {
  uploadToS3(req, res, async (err) => {
    if (err) {
      return errorResponse(
        res,
        err.message || 'Error uploading file',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!req.file) {
      return errorResponse(
        res,
        'No file uploaded',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    try {
      const { userId } = req.params;
      const user = await User.findById(userId);

      if (!user) {
        return errorResponse(
          res,
          'User not found',
          HTTP_STATUS.NOT_FOUND
        );
      }

      // If user already has a profile picture, delete it from S3
      if (user.profilePicture && user.profilePicture.key) {
        try {
          await deleteFileFromS3(user.profilePicture.key);
        } catch (deleteErr) {
          console.error('Error deleting previous profile picture:', deleteErr);
          // Continue even if deletion fails
        }
      }

      // Update user with new profile picture info
      user.profilePicture = {
        key: req.file.key,
        url: req.file.location,
      };

      await user.save();

      successResponse(
        res,
        'User profile picture updated successfully',
        HTTP_STATUS.OK,
        {
          profilePicture: user.profilePicture,
        }
      );
    } catch (error) {
      console.error('Error updating user profile picture:', error);
      errorResponse(
        res,
        'Error updating user profile picture',
        HTTP_STATUS.SERVER_ERROR,
        error
      );
    }
  });
}; 