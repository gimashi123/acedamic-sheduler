import Subject from '../models/subject.model.js';
import User from '../models/user.model.js';
import {
  errorResponse,
  HTTP_STATUS,
  successResponse,
} from '../config/http.config.js';
import { getSubjectResponse } from '../dto/subject.response.dto.js';

// Add a new subject (Admin only)
export const addSubject = async (req, res) => {
  try {
    let { name, code, credits, lecturerId } = req.body;

    // Check if user is admin
    if (!req.user || req.user.role !== 'Admin') {
      return errorResponse(res, 'Only administrators can add subjects', HTTP_STATUS.FORBIDDEN);
    }

    // Check if the subject already exists
    if (await Subject.findOne({ code })) {
      return errorResponse(res, 'Subject with this code already exists', HTTP_STATUS.BAD_REQUEST);
    }
    
    if (name === undefined || code === undefined || credits === undefined) {
      return errorResponse(
        res,
        'Please provide all required fields',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // First letter of the name is capitalized
    name = name.charAt(0).toUpperCase() + name.slice(1);

    // Validate subject code format (2-3 uppercase letters + 3-5 digits)
    const codeRegex = /^[A-Z]{2,3}[0-9]{3,5}$/;
    if (!codeRegex.test(code)) {
      return errorResponse(
        res,
        'Subject code must be in format XX000 or XXX00000 (2-3 uppercase letters + 3-5 digits)',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!Number.isInteger(credits) || credits < 1 || credits > 4) {
      return errorResponse(
        res,
        'Credits must be an integer between 1 and 4',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Check if lecturer exists if lecturerId is provided
    if (lecturerId) {
      const lecturer = await User.findById(lecturerId);
      if (!lecturer) {
        return errorResponse(res, 'Lecturer not found', HTTP_STATUS.NOT_FOUND);
      }
      if (lecturer.role !== 'Lecturer') {
        return errorResponse(res, 'User is not a lecturer', HTTP_STATUS.BAD_REQUEST);
      }
    }

    // Create the subject
    const subject = new Subject({ 
      name, 
      code, 
      credits,
      lecturer: lecturerId || null 
    });
    await subject.save();

    return successResponse(
      res,
      'Subject added successfully',
      HTTP_STATUS.CREATED,
      getSubjectResponse(subject),
    );
  } catch (e) {
    return errorResponse(
      res,
      e.message || 'Error when creating a subject',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};

// Get all subjects
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate('lecturer', 'firstName lastName email');

    const subjectResponses = subjects?.map((subject) => {
      return getSubjectResponse(subject);
    });
    return successResponse(
      res,
      'Subjects retrieved successfully',
      HTTP_STATUS.OK,
      subjectResponses,
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || 'Error retrieving subjects',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};

// Get subject by ID
export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id).populate('lecturer', 'firstName lastName email');
    
    if (!subject) {
      return errorResponse(res, 'Subject not found', HTTP_STATUS.NOT_FOUND);
    }

    return successResponse(
      res,
      'Subject retrieved successfully',
      HTTP_STATUS.OK,
      getSubjectResponse(subject),
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || 'Error retrieving subject',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};

// Update subject (Admin only)
export const updateSubject = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'Admin') {
      return errorResponse(res, 'Only administrators can update subjects', HTTP_STATUS.FORBIDDEN);
    }

    const { id } = req.params;
    const { name, code, credits, lecturerId } = req.body;
    
    const subject = await Subject.findById(id);
    
    if (!subject) {
      return errorResponse(res, 'Subject not found', HTTP_STATUS.NOT_FOUND);
    }

    // Update fields if provided
    if (code) {
      subject.code = code;
    }

    if (credits) {
      subject.credits = credits;
    }

    if (name) {
      subject.name = name;
    }

    // Update lecturer if provided
    if (lecturerId !== undefined) {
      if (lecturerId === null) {
        subject.lecturer = null;
      } else {
        const lecturer = await User.findById(lecturerId);
        if (!lecturer) {
          return errorResponse(res, 'Lecturer not found', HTTP_STATUS.NOT_FOUND);
        }
        if (lecturer.role !== 'Lecturer') {
          return errorResponse(res, 'User is not a lecturer', HTTP_STATUS.BAD_REQUEST);
        }
        subject.lecturer = lecturerId;
      }
    }

    await subject.save();

    // Populate lecturer info before returning
    const updatedSubject = await Subject.findById(id).populate('lecturer', 'firstName lastName email');

    return successResponse(
      res,
      'Subject updated successfully',
      HTTP_STATUS.OK,
      getSubjectResponse(updatedSubject),
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || 'Error updating subject',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};

// Delete subject (Admin only)
export const deleteSubject = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'Admin') {
      return errorResponse(res, 'Only administrators can delete subjects', HTTP_STATUS.FORBIDDEN);
    }

    const { id } = req.params;

    const deletedSubject = await Subject.findByIdAndDelete(id);
    if (!deletedSubject) {
      return errorResponse(res, 'Subject not found', HTTP_STATUS.NOT_FOUND);
    }
    return successResponse(
      res,
      'Subject deleted successfully',
      HTTP_STATUS.OK,
      null,
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || 'Error deleting subject',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};

// Get subjects for a specific lecturer
export const getLecturerSubjects = async (req, res) => {
  try {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    let lecturerId;
    
    // If user is admin and lecturerId is provided in the query, use that
    if (req.user.role === 'Admin' && req.query.lecturerId) {
      lecturerId = req.query.lecturerId;
    } else if (req.user.role === 'Lecturer') {
      // If user is lecturer, use their own ID
      lecturerId = req.user.userId;
    } else {
      return errorResponse(res, 'Invalid request', HTTP_STATUS.BAD_REQUEST);
    }

    const subjects = await Subject.find({ lecturer: lecturerId });

    return successResponse(
      res,
      'Lecturer subjects retrieved successfully',
      HTTP_STATUS.OK,
      subjects.map(subject => getSubjectResponse(subject)),
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || 'Error retrieving lecturer subjects',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};
