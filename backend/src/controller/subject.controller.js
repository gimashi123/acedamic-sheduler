import Subject from '../models/subject.model.js';

// Get all subjects
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: subjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subjects',
      error: error.message
    });
  }
};

// Get a single subject by ID
export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subject',
      error: error.message
    });
  }
};

// Create a new subject
export const createSubject = async (req, res) => {
  try {
    const { name, moduleCode, credit, description, department, faculty } = req.body;
    
    // Check if a subject with the same module code already exists
    const existingSubject = await Subject.findOne({ moduleCode });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this module code already exists'
      });
    }
    
    const subject = new Subject({
      name,
      moduleCode,
      credit,
      description,
      department,
      faculty
    });
    
    await subject.save();
    
    res.status(201).json({
      success: true,
      data: subject,
      message: 'Subject created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating subject',
      error: error.message
    });
  }
};

// Update a subject
export const updateSubject = async (req, res) => {
  try {
    const { name, moduleCode, credit, description, department, faculty } = req.body;
    
    // Check if another subject (not this one) already has the same module code
    const existingSubject = await Subject.findOne({ 
      moduleCode, 
      _id: { $ne: req.params.id } 
    });
    
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Another subject with this module code already exists'
      });
    }
    
    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      { name, moduleCode, credit, description, department, faculty },
      { new: true, runValidators: true }
    );
    
    if (!updatedSubject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedSubject,
      message: 'Subject updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating subject',
      error: error.message
    });
  }
};

// Delete a subject
export const deleteSubject = async (req, res) => {
  try {
    const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
    
    if (!deletedSubject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting subject',
      error: error.message
    });
  }
}; 