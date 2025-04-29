import Subject from '../models/subject.model.js';
import {
  errorResponse,
  HTTP_STATUS,
  successResponse,
} from '../config/http.config.js';
import { getSubjectResponse } from '../dto/subject.response.dto.js';

// Add a new subject
export const addSubject = async (req, res) => {
  try {
    let { name, code, credits } = req.body;

     // Check if the subject already exists
     if (await Subject.findOne({ code })) {
       return errorResponse(res, 'Subject with this code already exists', HTTP_STATUS.BAD_REQUEST);
     }
    if (name === undefined || code === undefined || credits === undefined) {
      return errorResponse(res, 'Please provide all required fields', HTTP_STATUS.BAD_REQUEST); //http code add krnna ethana awula thibbe mn giya
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
    console.log( 'error when adding a subject' , e)
    errorResponse(res, e.message || 'Error when creating a subject', HTTP_STATUS.SERVER_ERROR);
  }
};

// Get all subjects
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    return successResponse(
      res,
      'Subjects retrieved successfully',
      HTTP_STATUS.OK,
      subjects,
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || 'Error retrieving subjects',
      null,
    );
  }
};

// Update subject
export const updateSubject = async (req, res) => {
  try {
    const { name, code, credits } = req.body;

    if (name === undefined || code === undefined || credits === undefined) {
      return errorResponse(res, 'Please provide all required fields', null);
    }

    if (!Number.isInteger(credits) || credits < 1 || credits > 4) {
      return errorResponse(
        res,
        'Credits must be an integer between 1 and 4',
        null,
      );
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      { name: name.charAt(0).toUpperCase() + name.slice(1), code, credits },
      { new: true },
    );

    if (!updatedSubject) {
      return errorResponse(res, 'Subject not found', null);
    }

    return successResponse(
      res,
      'Subject updated successfully',
      HTTP_STATUS.OK,
      getSubjectResponse(updatedSubject),
    );
  } catch (error) {
    return errorResponse(res, error.message || 'Error updating subject', null);
  }
};

// Delete subject
export const deleteSubject = async (req, res) => {
  try {
    const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
    if (!deletedSubject) {
      return errorResponse(res, 'Subject not found', null);
    }
    return successResponse(
      res,
      'Subject deleted successfully',
      HTTP_STATUS.OK,
      null,
    );
  } catch (error) {
    return errorResponse(res, error.message || 'Error deleting subject', null);
  }
};
