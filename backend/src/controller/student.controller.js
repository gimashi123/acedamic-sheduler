import Student from '../models/student.model.js';
import { 
  successResponse, 
  errorResponse, 
  HTTP_STATUS 
} from '../config/http.config.js';

// Add a new student
export const addStudent = async (req, res) => {
  try {
    const {
      studentId,
      firstName,
      lastName,
      email,
      phoneNumber,
      degreeProgram,
      groupNumber,
      subjectsEnrolled,
      dateOfBirth,
      guardianContact,
      address
    } = req.body;

    // Check if email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return errorResponse(
        res,
        'A student with this email already exists',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check if student ID exists (if provided)
    if (studentId) {
      const existingStudentId = await Student.findOne({ studentId });
      if (existingStudentId) {
        return errorResponse(
          res,
          'A student with this ID already exists',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // Create new student
    const student = new Student({
      studentId,
      firstName,
      lastName,
      email,
      phoneNumber,
      degreeProgram,
      groupNumber,
      subjectsEnrolled,
      dateOfBirth: new Date(dateOfBirth),
      guardianContact,
      address
    });

    await student.save();

    return successResponse(
      res,
      'Student added successfully',
      HTTP_STATUS.CREATED,
      student
    );
  } catch (error) {
    console.error('Error adding student:', error);
    return errorResponse(
      res,
      error.message || 'Error adding student',
      HTTP_STATUS.SERVER_ERROR
    );
  }
};

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('groupNumber', 'name')
      .populate('subjectsEnrolled', 'name code');
    
    return successResponse(
      res,
      'Students retrieved successfully',
      HTTP_STATUS.OK,
      students
    );
  } catch (error) {
    console.error('Error retrieving students:', error);
    return errorResponse(
      res,
      'Server error',
      HTTP_STATUS.SERVER_ERROR
    );
  }
};

// Get student by ID
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id)
      .populate('groupNumber', 'name')
      .populate('subjectsEnrolled', 'name code');
    
    if (!student) {
      return errorResponse(
        res,
        'Student not found',
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    return successResponse(
      res,
      'Student retrieved successfully',
      HTTP_STATUS.OK,
      student
    );
  } catch (error) {
    console.error('Error retrieving student:', error);
    return errorResponse(
      res,
      'Server error',
      HTTP_STATUS.SERVER_ERROR
    );
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // If updating email, check if it exists
    if (updateData.email) {
      const existingEmail = await Student.findOne({ 
        email: updateData.email,
        _id: { $ne: id }
      });
      
      if (existingEmail) {
        return errorResponse(
          res,
          'Email is already in use by another student',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }
    
    // If updating studentId, check if it exists
    if (updateData.studentId) {
      const existingId = await Student.findOne({ 
        studentId: updateData.studentId,
        _id: { $ne: id }
      });
      
      if (existingId) {
        return errorResponse(
          res,
          'Student ID is already in use',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }
    
    // Convert date string to Date object if provided
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }
    
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('groupNumber', 'name')
     .populate('subjectsEnrolled', 'name code');
    
    if (!updatedStudent) {
      return errorResponse(
        res,
        'Student not found',
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    return successResponse(
      res,
      'Student updated successfully',
      HTTP_STATUS.OK,
      updatedStudent
    );
  } catch (error) {
    console.error('Error updating student:', error);
    return errorResponse(
      res,
      error.message || 'Error updating student',
      HTTP_STATUS.SERVER_ERROR
    );
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudent = await Student.findByIdAndDelete(id);
    
    if (!deletedStudent) {
      return errorResponse(
        res,
        'Student not found',
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    return successResponse(
      res,
      'Student deleted successfully',
      HTTP_STATUS.OK
    );
  } catch (error) {
    console.error('Error deleting student:', error);
    return errorResponse(
      res,
      'Server error',
      HTTP_STATUS.SERVER_ERROR
    );
  }
};