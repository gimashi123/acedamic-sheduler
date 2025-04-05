import Timetable from '../models/timetable.model.js';
import Group from '../models/group.model.js';
import Subject from '../models/subject.model.js';
import Venue from '../models/venue.model.js';
import { HTTP_STATUS, errorResponse, successResponse } from '../config/http.config.js';

// Helper function to check venue availability
const isVenueAvailable = (venue, day, startTime, endTime, existingTimeSlots) => {
  // Check if venue is already booked in this time slot
  return !existingTimeSlots.some(slot => 
    slot.day === day && 
    slot.venue.toString() === venue.toString() && 
    ((startTime >= slot.startTime && startTime < slot.endTime) || 
     (endTime > slot.startTime && endTime <= slot.endTime) ||
     (startTime <= slot.startTime && endTime >= slot.endTime))
  );
};

// Helper function to check lecturer availability
const isLecturerAvailable = (lecturer, day, startTime, endTime, existingTimeSlots) => {
  // Check if lecturer is already assigned in this time slot
  return !existingTimeSlots.some(slot => 
    slot.day === day && 
    slot.lecturer.toString() === lecturer.toString() && 
    ((startTime >= slot.startTime && startTime < slot.endTime) || 
     (endTime > slot.startTime && endTime <= slot.endTime) ||
     (startTime <= slot.startTime && endTime >= slot.endTime))
  );
};

// Generate timetable for a specific group
export const generateTimetable = async (req, res) => {
  try {
    const { groupId, month, year } = req.body;
    
    if (!groupId || !month || !year) {
      return errorResponse(
        res, 
        'Group ID, month, and year are required', 
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Validate month
    if (month < 1 || month > 12) {
      return errorResponse(
        res, 
        'Month must be between 1 and 12', 
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Check if group exists
    const group = await Group.findById(groupId).populate('students');
    if (!group) {
      return errorResponse(
        res, 
        'Group not found', 
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    // Check if timetable already exists for this group/month/year
    let timetable = await Timetable.findOne({ group: groupId, month, year });
    if (timetable) {
      return errorResponse(
        res, 
        'Timetable already exists for this group in the specified month and year', 
        HTTP_STATUS.CONFLICT
      );
    }
    
    // Get subjects that should be assigned to this group
    // This logic can be adjusted based on how subjects are assigned to groups
    // For now, we're getting subjects based on the department
    const subjects = await Subject.find({ 
      department: group.department,
      status: 'active'
    }).populate('lecturer');
    
    if (subjects.length === 0) {
      return errorResponse(
        res, 
        'No subjects found for this group', 
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    // Get available venues
    const venues = await Venue.find({
      department: group.department,
      capacity: { $gte: group.students.length }
    });
    
    if (venues.length === 0) {
      return errorResponse(
        res, 
        'No suitable venues found for this group', 
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    // Generate time slots
    // Basic algorithm - can be enhanced for more sophisticated scheduling
    const timeSlots = [];
    const existingSlots = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    // Define time slots
    const availableTimeSlots = [
      { start: '08:00', end: '10:00' },
      { start: '10:00', end: '12:00' },
      { start: '13:00', end: '15:00' },
      { start: '15:00', end: '17:00' }
    ];
    
    // For each subject, assign a time slot
    for (const subject of subjects) {
      let slotAssigned = false;
      
      for (const day of days) {
        if (slotAssigned) break;
        
        for (const timeSlot of availableTimeSlots) {
          if (slotAssigned) break;
          
          // Find a suitable venue
          for (const venue of venues) {
            if (isVenueAvailable(venue._id, day, timeSlot.start, timeSlot.end, existingSlots) &&
                isLecturerAvailable(subject.lecturer._id, day, timeSlot.start, timeSlot.end, existingSlots)) {
              
              const newSlot = {
                day,
                startTime: timeSlot.start,
                endTime: timeSlot.end,
                subject: subject._id,
                venue: venue._id,
                lecturer: subject.lecturer._id
              };
              
              timeSlots.push(newSlot);
              existingSlots.push(newSlot);
              slotAssigned = true;
              break;
            }
          }
        }
      }
      
      if (!slotAssigned) {
        console.warn(`Could not assign a slot for subject ${subject.name}`);
      }
    }
    
    // Create a new timetable
    timetable = new Timetable({
      group: groupId,
      month,
      year,
      timeSlots
    });
    
    await timetable.save();
    
    return successResponse(
      res,
      'Timetable generated successfully',
      HTTP_STATUS.CREATED,
      timetable
    );
    
  } catch (error) {
    console.error('Error generating timetable:', error);
    return errorResponse(
      res,
      'Server error while generating timetable',
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
};

// Generate timetables for all groups for a specific month and year
export const generateAllTimetables = async (req, res) => {
  try {
    const { month, year } = req.body;
    
    if (!month || !year) {
      return errorResponse(
        res, 
        'Month and year are required', 
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Validate month
    if (month < 1 || month > 12) {
      return errorResponse(
        res, 
        'Month must be between 1 and 12', 
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Get all active groups
    const groups = await Group.find();
    if (groups.length === 0) {
      return errorResponse(
        res, 
        'No groups found', 
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    const results = {
      success: [],
      failed: []
    };
    
    // Generate timetable for each group
    for (const group of groups) {
      try {
        // Check if timetable already exists
        const existingTimetable = await Timetable.findOne({ 
          group: group._id, 
          month, 
          year 
        });
        
        if (existingTimetable) {
          results.failed.push({
            group: group.name,
            reason: 'Timetable already exists'
          });
          continue;
        }
        
        // Mock request object to reuse the generateTimetable function
        const mockReq = {
          body: { groupId: group._id, month, year }
        };
        
        // Mock response object
        const mockRes = {
          status: (code) => ({
            json: (data) => {
              if (code >= 200 && code < 300) {
                results.success.push({
                  group: group.name,
                  id: data.data._id
                });
              } else {
                results.failed.push({
                  group: group.name,
                  reason: data.message
                });
              }
              return mockRes;
            }
          })
        };
        
        await generateTimetable(mockReq, mockRes);
        
      } catch (error) {
        results.failed.push({
          group: group.name,
          reason: error.message
        });
      }
    }
    
    return successResponse(
      res,
      'Batch timetable generation completed',
      HTTP_STATUS.OK,
      results
    );
    
  } catch (error) {
    console.error('Error generating all timetables:', error);
    return errorResponse(
      res,
      'Server error while generating timetables',
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
};

// Get all timetables
export const getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find()
      .populate('group')
      .populate({
        path: 'timeSlots.subject',
        model: 'Subject'
      })
      .populate({
        path: 'timeSlots.venue',
        model: 'Venue'
      })
      .populate({
        path: 'timeSlots.lecturer',
        model: 'User'
      });
    
    return successResponse(
      res,
      'Timetables retrieved successfully',
      HTTP_STATUS.OK,
      timetables
    );
    
  } catch (error) {
    console.error('Error retrieving timetables:', error);
    return errorResponse(
      res,
      'Server error while retrieving timetables',
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
};

// Get timetables by group
export const getTimetablesByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    if (!groupId) {
      return errorResponse(
        res, 
        'Group ID is required', 
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    const timetables = await Timetable.find({ group: groupId })
      .populate('group')
      .populate({
        path: 'timeSlots.subject',
        model: 'Subject'
      })
      .populate({
        path: 'timeSlots.venue',
        model: 'Venue'
      })
      .populate({
        path: 'timeSlots.lecturer',
        model: 'User'
      });
    
    return successResponse(
      res,
      'Timetables retrieved successfully',
      HTTP_STATUS.OK,
      timetables
    );
    
  } catch (error) {
    console.error('Error retrieving timetables:', error);
    return errorResponse(
      res,
      'Server error while retrieving timetables',
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
};

// Get timetable by id
export const getTimetableById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return errorResponse(
        res, 
        'Timetable ID is required', 
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    const timetable = await Timetable.findById(id)
      .populate('group')
      .populate({
        path: 'timeSlots.subject',
        model: 'Subject'
      })
      .populate({
        path: 'timeSlots.venue',
        model: 'Venue'
      })
      .populate({
        path: 'timeSlots.lecturer',
        model: 'User'
      });
    
    if (!timetable) {
      return errorResponse(
        res,
        'Timetable not found',
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    return successResponse(
      res,
      'Timetable retrieved successfully',
      HTTP_STATUS.OK,
      timetable
    );
    
  } catch (error) {
    console.error('Error retrieving timetable:', error);
    return errorResponse(
      res,
      'Server error while retrieving timetable',
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
};

// Update timetable status (draft/published)
export const updateTimetableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id) {
      return errorResponse(
        res, 
        'Timetable ID is required', 
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    if (!status || !['draft', 'published'].includes(status)) {
      return errorResponse(
        res, 
        'Valid status (draft/published) is required', 
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    const timetable = await Timetable.findById(id);
    
    if (!timetable) {
      return errorResponse(
        res,
        'Timetable not found',
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    timetable.status = status;
    await timetable.save();
    
    return successResponse(
      res,
      'Timetable status updated successfully',
      HTTP_STATUS.OK,
      timetable
    );
    
  } catch (error) {
    console.error('Error updating timetable status:', error);
    return errorResponse(
      res,
      'Server error while updating timetable status',
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
};

// Delete timetable
export const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return errorResponse(
        res, 
        'Timetable ID is required', 
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    const timetable = await Timetable.findByIdAndDelete(id);
    
    if (!timetable) {
      return errorResponse(
        res,
        'Timetable not found',
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    return successResponse(
      res,
      'Timetable deleted successfully',
      HTTP_STATUS.OK,
      { id }
    );
    
  } catch (error) {
    console.error('Error deleting timetable:', error);
    return errorResponse(
      res,
      'Server error while deleting timetable',
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
}; 