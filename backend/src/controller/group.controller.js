import Group from '../models/group.model.js';
import User from '../models/user.model.js';
import { ROLES } from '../constants/roles.js';

// Get all faculties
export const getFaculties = async (req, res) => {
  try {
    const faculties = Group.getFaculties();
    
    res.status(200).json({
      success: true,
      data: faculties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching faculties',
      error: error.message
    });
  }
};

// Get departments for a faculty
export const getDepartments = async (req, res) => {
  try {
    const { faculty } = req.params;
    const departments = Group.getDepartments(faculty);
    
    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
};

// Get groups by type (weekday/weekend)
export const getGroupsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (type !== 'weekday' && type !== 'weekend') {
      return res.status(400).json({
        success: false,
        message: 'Invalid group type. Must be "weekday" or "weekend"'
      });
    }
    
    const groups = await Group.find({ groupType: type })
      .populate('students', 'firstName lastName email role')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching groups by type',
      error: error.message
    });
  }
};

// Get groups by faculty
export const getGroupsByFaculty = async (req, res) => {
  try {
    const { faculty } = req.params;
    
    const groups = await Group.find({ faculty })
      .populate('students', 'firstName lastName email role')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching groups by faculty',
      error: error.message
    });
  }
};

// Get groups by year and semester
export const getGroupsByYearAndSemester = async (req, res) => {
  try {
    const { year, semester } = req.params;
    
    const groups = await Group.find({ 
      year: parseInt(year, 10), 
      semester: parseInt(semester, 10)
    })
      .populate('students', 'firstName lastName email role')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching groups by year and semester',
      error: error.message
    });
  }
};

// Get all groups
export const getAllGroups = async (req, res) => {
  try {
    const { faculty, department, year, semester, type } = req.query;
    
    // Build filter object based on provided query parameters
    const filter = {};
    if (faculty) filter.faculty = faculty;
    if (department) filter.department = department;
    if (year) filter.year = parseInt(year, 10);
    if (semester) filter.semester = parseInt(semester, 10);
    if (type) filter.groupType = type;
    
    const groups = await Group.find(filter)
      .populate('students', 'firstName lastName email role')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching groups',
      error: error.message
    });
  }
};

// Get a single group by ID
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('students', 'firstName lastName email role');
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching group',
      error: error.message
    });
  }
};

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, faculty, department, year, semester, groupType } = req.body;
    
    // Check if the faculty already has 2 groups
    const isFacultyLimitValid = await Group.checkFacultyGroupLimit(faculty);
    if (!isFacultyLimitValid) {
      return res.status(400).json({
        success: false,
        message: 'Faculty already has the maximum of 2 groups allowed'
      });
    }
    
    // Check if a group with the same name already exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({
        success: false,
        message: 'A group with this name already exists'
      });
    }
    
    const group = new Group({
      name,
      faculty,
      department,
      year,
      semester,
      groupType,
      students: []
    });
    
    await group.save();
    
    res.status(201).json({
      success: true,
      data: group,
      message: 'Group created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating group',
      error: error.message
    });
  }
};

// Update a group
export const updateGroup = async (req, res) => {
  try {
    const { name, faculty, department, year, semester, groupType } = req.body;
    
    // Check if another group (not this one) has the same name
    const existingGroup = await Group.findOne({ 
      name,
      _id: { $ne: req.params.id } 
    });
    
    if (existingGroup) {
      return res.status(400).json({
        success: false,
        message: 'Another group with this name already exists'
      });
    }
    
    // If faculty is being changed, check the faculty group limit
    const currentGroup = await Group.findById(req.params.id);
    if (currentGroup && currentGroup.faculty !== faculty) {
      const isFacultyLimitValid = await Group.checkFacultyGroupLimit(faculty);
      if (!isFacultyLimitValid) {
        return res.status(400).json({
          success: false,
          message: 'Faculty already has the maximum of 2 groups allowed'
        });
      }
    }
    
    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      { name, faculty, department, year, semester, groupType },
      { new: true, runValidators: true }
    ).populate('students', 'firstName lastName email role');
    
    if (!updatedGroup) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedGroup,
      message: 'Group updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating group',
      error: error.message
    });
  }
};

// Delete a group
export const deleteGroup = async (req, res) => {
  try {
    const deletedGroup = await Group.findByIdAndDelete(req.params.id);
    
    if (!deletedGroup) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting group',
      error: error.message
    });
  }
};

// Add students to a group
export const addStudentsToGroup = async (req, res) => {
  try {
    const { studentIds } = req.body;
    const groupId = req.params.id;
    
    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if adding these students would exceed the 30-student limit
    if (group.students.length + studentIds.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add more students. Group would exceed the 30-student limit'
      });
    }
    
    // Verify all student IDs exist and are Student role
    const students = await User.find({
      _id: { $in: studentIds },
      role: ROLES.STUDENT
    });
    
    if (students.length !== studentIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more student IDs are invalid or not of Student role'
      });
    }
    
    // Add students to the group (avoiding duplicates)
    const updatedStudentsArray = [...new Set([...group.students.map(id => id.toString()), ...studentIds])];
    
    // Update the group
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { students: updatedStudentsArray },
      { new: true, runValidators: true }
    ).populate('students', 'firstName lastName email role');
    
    res.status(200).json({
      success: true,
      data: updatedGroup,
      message: 'Students added to group successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding students to group',
      error: error.message
    });
  }
};

// Remove a student from a group
export const removeStudentFromGroup = async (req, res) => {
  try {
    const { studentId } = req.params;
    const groupId = req.params.id;
    
    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if the student is in the group
    if (!group.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Student is not in this group'
      });
    }
    
    // Remove the student
    const updatedStudentsArray = group.students.filter(id => id.toString() !== studentId);
    
    // Update the group
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { students: updatedStudentsArray },
      { new: true, runValidators: true }
    ).populate('students', 'firstName lastName email role');
    
    res.status(200).json({
      success: true,
      data: updatedGroup,
      message: 'Student removed from group successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing student from group',
      error: error.message
    });
  }
};

// Get available students (not in any group)
export const getAvailableStudents = async (req, res) => {
  try {
    // Find all students
    const allStudents = await User.find({ role: ROLES.STUDENT }, '_id firstName lastName email');
    
    // Find all groups and create a set of student IDs that are already in groups
    const groups = await Group.find({}, 'students');
    const assignedStudentIds = new Set();
    
    groups.forEach(group => {
      group.students.forEach(studentId => {
        assignedStudentIds.add(studentId.toString());
      });
    });
    
    // Filter out students that are already in groups
    const availableStudents = allStudents.filter(student => 
      !assignedStudentIds.has(student._id.toString())
    );
    
    res.status(200).json({
      success: true,
      data: availableStudents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching available students',
      error: error.message
    });
  }
}; 