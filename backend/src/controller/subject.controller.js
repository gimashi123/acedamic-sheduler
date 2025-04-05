import Subject from '../models/subject.model.js';
import User from '../models/user.model.js';

/**
 * Create a new subject
 */
export const createSubject = async (req, res) => {
  try {
    console.log('Creating subject - request body:', req.body);
    console.log('Creating subject - user from token:', req.user);
    
    const { name, code, description, credits, department } = req.body;
    
    if (!req.user || !req.user.userId) {
      console.error('User ID not found in token:', req.user);
      return res.status(401).json({ message: 'Authentication error: User ID not found' });
    }
    
    const lecturerId = req.user.userId; // Get lecturer ID from authenticated user

    // Verify user is a lecturer
    const user = await User.findById(lecturerId);
    console.log('User from DB:', user);
    
    if (!user) {
      console.error('User not found with ID:', lecturerId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'Lecturer') {
      console.error('User is not a lecturer:', user.role);
      return res.status(403).json({ message: 'Only lecturers can add subjects' });
    }

    // Check if the lecturer already has a subject
    const existingLecturerSubject = await Subject.findOne({ lecturer: lecturerId });
    console.log('Existing subject for lecturer:', existingLecturerSubject);
    
    if (existingLecturerSubject) {
      return res.status(400).json({ 
        message: 'You have already added a subject. A lecturer can only manage one subject.' 
      });
    }

    // Check if subject code already exists
    const existingSubject = await Subject.findOne({ code });
    if (existingSubject) {
      return res.status(400).json({ message: 'Subject with this code already exists' });
    }

    // Create new subject
    const subject = new Subject({
      name,
      code,
      description,
      lecturer: lecturerId,
      credits: credits || 3,
      department,
      status: 'active'
    });

    const savedSubject = await subject.save();
    console.log('Subject created successfully:', savedSubject);
    
    return res.status(201).json({
      message: 'Subject created successfully',
      subject: savedSubject
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

/**
 * Get all subjects
 */
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate('lecturer', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    return res.status(200).json({ subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get subjects for a specific lecturer
 */
export const getLecturerSubjects = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication error: User ID not found' });
    }
    
    const lecturerId = req.user.userId;
    console.log('Getting subjects for lecturer:', lecturerId);
    
    const subjects = await Subject.find({ lecturer: lecturerId })
      .sort({ createdAt: -1 });
    
    return res.status(200).json({ subjects });
  } catch (error) {
    console.error('Error fetching lecturer subjects:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Update a subject
 */
export const updateSubject = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication error: User ID not found' });
    }
    
    const { id } = req.params;
    const { name, description, credits, department, status } = req.body;
    const lecturerId = req.user.userId;

    const subject = await Subject.findById(id);
    
    // Check if subject exists
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Verify user is the subject's lecturer or an admin
    if (subject.lecturer.toString() !== lecturerId && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'You do not have permission to update this subject' });
    }

    // Update fields
    subject.name = name || subject.name;
    subject.description = description || subject.description;
    subject.credits = credits || subject.credits;
    subject.department = department || subject.department;
    subject.status = status || subject.status;

    await subject.save();
    
    return res.status(200).json({
      message: 'Subject updated successfully',
      subject
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Delete a subject
 */
export const deleteSubject = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication error: User ID not found' });
    }
    
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const subject = await Subject.findById(id);
    
    // Check if subject exists
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Only allow the lecturer who created the subject or admin to delete it
    if (subject.lecturer.toString() !== userId && userRole !== 'Admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this subject' });
    }

    await Subject.findByIdAndDelete(id);
    
    return res.status(200).json({
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message
    });
  }
}; 