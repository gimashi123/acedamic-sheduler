import SubjectAssignment from '../models/subject_assignment.model.js';
import User from '../models/user.model.js';
import Subject from '../models/subject.model.js';
import { ROLES } from '../constants/roles.js';

// Get all subject assignments with populated data
export const getAllSubjectAssignments = async (req, res) => {
  try {
    // Check if we should clean up bad references
    if (req.query.checkReferences === 'true') {
      console.log('Checking for invalid assignment references...');
      const badAssignments = await SubjectAssignment.find();
      let removedCount = 0;
      
      // Check each assignment for valid subject and lecturer
      for (const assignment of badAssignments) {
        const subjectExists = await Subject.findById(assignment.subject);
        const lecturerExists = await User.findById(assignment.lecturer);
        
        if (!subjectExists || !lecturerExists) {
          console.log('Removing invalid assignment:', assignment._id, 
                     'Subject exists:', !!subjectExists, 
                     'Lecturer exists:', !!lecturerExists);
          await SubjectAssignment.findByIdAndDelete(assignment._id);
          removedCount++;
        }
      }
      
      if (removedCount > 0) {
        console.log(`Removed ${removedCount} invalid assignments`);
      } else {
        console.log('No invalid assignments found');
      }
    }
    
    const assignments = await SubjectAssignment.find()
      .populate({
        path: 'subject',
        select: 'name moduleCode description'
      })
      .populate('lecturer', 'firstName lastName email')
      .sort({ updatedAt: -1 });
    
    // Log raw data for debugging
    console.log('DEBUG - Raw assignments before mapping:', 
      assignments.map(a => ({
        id: a._id,
        subject: a.subject,
        lecturer: a.lecturer
      }))
    );
    
    // Check if any subjects have missing moduleCode
    assignments.forEach((assignment, index) => {
      if (!assignment.subject) {
        console.log(`Assignment ${index} has no subject:`, assignment._id);
      } else if (!assignment.subject.moduleCode) {
        console.log(`Assignment ${index} with missing moduleCode:`, assignment._id);
        console.log('Subject data:', assignment.subject);
      }
    });
    
    console.log('DEBUG - Backend assignments returned:', 
      assignments.map(a => ({
        id: a._id,
        subject: a.subject ? {
          id: a.subject._id,
          name: a.subject.name,
          moduleCode: a.subject.moduleCode
        } : 'Subject not populated',
        lecturer: a.lecturer ? {
          name: `${a.lecturer.firstName} ${a.lecturer.lastName}`
        } : 'Lecturer not populated'
      }))
    );
    
    res.status(200).json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error in getAllSubjectAssignments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subject assignments',
      error: error.message
    });
  }
};

// Get assignments for a specific lecturer
export const getLecturerAssignments = async (req, res) => {
  try {
    const { lecturerId } = req.params;
    
    const assignments = await SubjectAssignment.find({ lecturer: lecturerId })
      .populate({
        path: 'subject',
        select: 'name moduleCode description'
      })
      .sort({ updatedAt: -1 });
    
    res.status(200).json({
      success: true,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lecturer assignments',
      error: error.message
    });
  }
};

// Get assignments for a specific subject
export const getSubjectAssignments = async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    const assignments = await SubjectAssignment.find({ subject: subjectId })
      .populate('lecturer', 'firstName lastName email')
      .sort({ updatedAt: -1 });
    
    res.status(200).json({
      success: true,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subject assignments',
      error: error.message
    });
  }
};

// Get a single assignment by ID
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await SubjectAssignment.findById(req.params.id)
      .populate({
        path: 'subject',
        select: 'name moduleCode description'
      })
      .populate('lecturer', 'firstName lastName email');
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment',
      error: error.message
    });
  }
};

// Create a new subject assignment
export const createAssignment = async (req, res) => {
  try {
    const { subjectId, lecturerId, academicYear, semester, notes } = req.body;
    
    // Verify subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    // Verify lecturer exists and is a lecturer
    const lecturer = await User.findOne({ 
      _id: lecturerId,
      role: ROLES.LECTURER
    });
    
    if (!lecturer) {
      return res.status(404).json({
        success: false,
        message: 'Lecturer not found or user is not a lecturer'
      });
    }
    
    // Check if assignment already exists
    const existingAssignment = await SubjectAssignment.findOne({
      subject: subjectId,
      lecturer: lecturerId,
      academicYear,
      semester
    });
    
    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'This lecturer is already assigned to this subject for the given academic year and semester'
      });
    }
    
    const assignment = new SubjectAssignment({
      subject: subjectId,
      lecturer: lecturerId,
      academicYear,
      semester,
      notes: notes || ''
    });
    
    await assignment.save();
    
    // Populate the assignment with subject and lecturer details
    const populatedAssignment = await SubjectAssignment.findById(assignment._id)
      .populate({
        path: 'subject',
        select: 'name moduleCode description'
      })
      .populate('lecturer', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      data: populatedAssignment,
      message: 'Subject assigned to lecturer successfully'
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This lecturer is already assigned to this subject for the given academic year and semester'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating assignment',
      error: error.message
    });
  }
};

// Update an assignment
export const updateAssignment = async (req, res) => {
  try {
    const { subjectId, lecturerId, academicYear, semester, notes } = req.body;
    
    const updateData = { academicYear, semester, notes };
    
    // Get the current assignment
    const currentAssignment = await SubjectAssignment.findById(req.params.id);
    if (!currentAssignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Allow changing the subject if provided
    if (subjectId) {
      // Verify subject exists
      const subject = await Subject.findById(subjectId);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }
      
      updateData.subject = subjectId;
    }
    
    // Allow changing the lecturer if provided
    if (lecturerId) {
      // Verify lecturer exists and is a lecturer
      const lecturer = await User.findOne({ 
        _id: lecturerId,
        role: ROLES.LECTURER
      });
      
      if (!lecturer) {
        return res.status(404).json({
          success: false,
          message: 'Lecturer not found or user is not a lecturer'
        });
      }
      
      updateData.lecturer = lecturerId;
    }
    
    // Check if a similar assignment already exists (avoiding duplicates)
    const subjectToCheck = subjectId || currentAssignment.subject;
    const lecturerToCheck = lecturerId || currentAssignment.lecturer;
    
    if (subjectToCheck !== currentAssignment.subject.toString() || 
        lecturerToCheck !== currentAssignment.lecturer.toString()) {
      const existingAssignment = await SubjectAssignment.findOne({
        _id: { $ne: req.params.id }, // exclude the current assignment
        subject: subjectToCheck,
        lecturer: lecturerToCheck,
        academicYear: academicYear || currentAssignment.academicYear,
        semester: semester || currentAssignment.semester
      });
      
      if (existingAssignment) {
        return res.status(400).json({
          success: false,
          message: 'This lecturer is already assigned to this subject for the given academic year and semester'
        });
      }
    }
    
    // Only update fields that are provided
    const updatedAssignment = await SubjectAssignment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate({
      path: 'subject',
      select: 'name moduleCode description'
    })
    .populate('lecturer', 'firstName lastName email');
    
    res.status(200).json({
      success: true,
      data: updatedAssignment,
      message: 'Assignment updated successfully'
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating assignment',
      error: error.message
    });
  }
};

// Delete an assignment
export const deleteAssignment = async (req, res) => {
  try {
    const deletedAssignment = await SubjectAssignment.findByIdAndDelete(req.params.id);
    
    if (!deletedAssignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting assignment',
      error: error.message
    });
  }
};

// Get available lecturers (unassigned to specified subject in the given period)
export const getAvailableLecturers = async (req, res) => {
  try {
    const { subjectId, academicYear, semester } = req.query;
    
    // Validation
    if (!subjectId || !academicYear || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Subject ID, academic year, and semester are required'
      });
    }
    
    // Find lecturers already assigned to this subject in this period
    const assignedLecturers = await SubjectAssignment.find({
      subject: subjectId,
      academicYear,
      semester
    }).select('lecturer');
    
    const assignedLecturerIds = assignedLecturers.map(assignment => assignment.lecturer.toString());
    
    // Find all lecturers not in the assigned list
    const availableLecturers = await User.find({
      role: ROLES.LECTURER,
      _id: { $nin: assignedLecturerIds }
    }).select('_id firstName lastName email');
    
    res.status(200).json({
      success: true,
      data: availableLecturers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching available lecturers',
      error: error.message
    });
  }
};

// Get all assignments for the current academic year and semester
export const getCurrentAssignments = async (req, res) => {
  try {
    const { academicYear, semester } = req.query;
    
    if (!academicYear || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Academic year and semester are required'
      });
    }
    
    const assignments = await SubjectAssignment.find({
      academicYear,
      semester: parseInt(semester)
    })
    .populate({
      path: 'subject',
      select: 'name moduleCode description'
    })
    .populate('lecturer', 'firstName lastName email')
    .sort({ updatedAt: -1 });
    
    res.status(200).json({
      success: true,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching current assignments',
      error: error.message
    });
  }
}; 