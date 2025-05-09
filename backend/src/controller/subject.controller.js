import Subject from '../models/subject.model.js';
import {
  errorResponse,
  HTTP_STATUS,
  successResponse,
} from '../config/http.config.js';
import {
  getSubjectResponse,
  SubjectOptions,
} from '../dto/subject.response.dto.js';
import Venue from '../models/venue.model.js';
import { VenueOptionsDTO } from '../dto/venue.dto.js';

// Add a new subject
export const addSubject = async (req, res) => {
  try {
    let { name, code, credits } = req.body;

    // Check if the subject already exists
    if (await Subject.findOne({ code })) {
      return errorResponse(
        res,
        'Subject with this code already exists',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (name === undefined || code === undefined || credits === undefined) {
      return errorResponse(
        res,
        'Please provide all required fields',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    //First letter of the name is capitalized
    name = name.charAt(0).toUpperCase() + name.slice(1);

    if (!Number.isInteger(credits) || credits < 1 || credits > 4) {
      return errorResponse(
        res,
        'Credits must be an integer between 1 and 4',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    //save to db
    const subject = new Subject({ name, code, credits });
    await subject.save();

    return successResponse(
      res,
      'Subject added Successfully',
      HTTP_STATUS.CREATED,
      getSubjectResponse(subject),
    );
  } catch (e) {
    errorResponse(
      res,
      e.message || 'Error when creating a subject',
      HTTP_STATUS.NOT_FOUND,
    );
  }
};

// Get all subjects
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();

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
      HTTP_STATUS.NOT_FOUND,
    );
  }
};

// Update subject
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, credits } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (code !== undefined) updateFields.code = code;
    if (credits !== undefined) updateFields.credits = credits;

    if (Object.keys(updateFields).length === 0) {
      return errorResponse(res, 'No fields provided to update', HTTP_STATUS.BAD_REQUEST);
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedSubject) {
      return errorResponse(res, 'Subject not found', HTTP_STATUS.NOT_FOUND);
    }

    return successResponse(
      res,
      'Subject updated successfully',
      HTTP_STATUS.OK,
      updatedSubject
    );

  } catch (error) {
    console.error('Error updating subject:', error);
    return errorResponse(
      res,
      error.message || 'Error updating subject',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

// Delete subject
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Attempting to delete subject: ', id);
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
      HTTP_STATUS.NOT_FOUND,
    );
  }
};

export const getSubjectOptions = async (req, res) => {
  try {
    const subjects = await Subject.find();

    if (!subjects.length) {
      return errorResponse(res, 'No subjects found', HTTP_STATUS.OK);
    }
    return successResponse(
      res,
      'Subject Options fetched successfully',
      HTTP_STATUS.OK,
      subjects.map(SubjectOptions),
    );
  } catch (err) {
    console.error('Error fetching subject options:', err);
    return errorResponse(
      null,
      'Server error occurred while fetching subject options',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};
