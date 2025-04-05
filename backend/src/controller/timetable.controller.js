import Timetable from '../models/timetable.model.js';
import Group from '../models/group.model.js';
import Subject from '../models/subject.model.js';
import Venue from '../models/venue.model.js';
import { HTTP_STATUS, errorResponse, successResponse } from '../config/http.config.js';
import { optimizeTimetable as optimizeTimetableUtil, generatePossibleTimeSlots, calculateTimetableScore } from '../utils/timetableOptimizer.js';

// Helper function to check venue availability
const isVenueAvailable = (venue, day, startTime, endTime, existingTimeSlots, globalBookings = []) => {
  // Check if venue is already booked in this time slot in the current group's timetable
  const bookedInGroup = existingTimeSlots.some(slot => 
    slot.day === day && 
    slot.venue.toString() === venue.toString() && 
    ((startTime >= slot.startTime && startTime < slot.endTime) || 
     (endTime > slot.startTime && endTime <= slot.endTime) ||
     (startTime <= slot.startTime && endTime >= slot.endTime))
  );
  
  if (bookedInGroup) return false;
  
  // Check if venue is already booked in another group's timetable
  const bookedGlobally = globalBookings.some(booking => 
    booking.day === day && 
    booking.venue.toString() === venue.toString() && 
    ((startTime >= booking.startTime && startTime < booking.endTime) || 
     (endTime > booking.startTime && endTime <= booking.endTime) ||
     (startTime <= booking.startTime && endTime >= booking.endTime))
  );
  
  return !bookedGlobally;
};

// Helper function to check lecturer availability
const isLecturerAvailable = (lecturer, day, startTime, endTime, existingTimeSlots, globalBookings = []) => {
  // Check if lecturer is already assigned in this time slot in the current group's timetable
  const assignedInGroup = existingTimeSlots.some(slot => 
    slot.day === day && 
    slot.lecturer.toString() === lecturer.toString() && 
    ((startTime >= slot.startTime && startTime < slot.endTime) || 
     (endTime > slot.startTime && endTime <= slot.endTime) ||
     (startTime <= slot.startTime && endTime >= slot.endTime))
  );
  
  if (assignedInGroup) return false;
  
  // Check if lecturer is already assigned in another group's timetable
  const assignedGlobally = globalBookings.some(booking => 
    booking.day === day && 
    booking.lecturer.toString() === lecturer.toString() && 
    ((startTime >= booking.startTime && startTime < booking.endTime) || 
     (endTime > booking.startTime && endTime <= booking.endTime) ||
     (startTime <= booking.startTime && endTime >= booking.endTime))
  );
  
  return !assignedGlobally;
};

// Generate time slots based on subject duration and group type
const generateTimeSlots = (group, subjects, venues, globalBookings = []) => {
  // Determine if we should include weekends based on group type
  const includeWeekends = group.groupType === 'weekend';
  
  // Get unique session durations from subjects, default to 120 if not specified
  const sessionDurations = [...new Set(
    subjects.map(subject => subject.sessionDuration || 120)
  )];
  
  // Generate possible time slots for each duration
  let allPossibleSlots = [];
  
  sessionDurations.forEach(duration => {
    const slots = generatePossibleTimeSlots(includeWeekends, duration, 8, 18);
    allPossibleSlots = [...allPossibleSlots, ...slots];
  });
  
  return allPossibleSlots;
};

// Generate timetable for a specific group
export const generateTimetable = async (req, res) => {
  try {
    const { groupId, month, year, forceRegenerate = false, globalBookings = [] } = req.body;
    
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
    
    // If timetable exists and forceRegenerate is true, delete the existing timetable
    if (timetable && forceRegenerate) {
      await Timetable.deleteOne({ _id: timetable._id });
      timetable = null;
      console.log(`Deleted existing timetable for group ${group.name} for ${month}/${year}`);
    } else if (timetable) {
      return errorResponse(
        res, 
        'Timetable already exists for this group in the specified month and year. Use forceRegenerate=true to replace it.', 
        HTTP_STATUS.CONFLICT
      );
    }
    
    // Get subjects that should be assigned to this group
    // Include Mathematics subjects for all departments as they are common subjects
    const subjects = await Subject.find({ 
      $or: [
        { department: group.department, status: 'active' },
        { department: 'Mathematics', status: 'active' }  // Include Math subjects for all departments
      ]
    }).populate('lecturer');
    
    if (subjects.length === 0) {
      return errorResponse(
        res, 
        'No subjects found for this group', 
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    console.log(`Found ${subjects.length} subjects for group ${group.name}`);
    
    // Get available venues
    // Include venues from both the group's department AND Mathematics department if available
    const venues = await Venue.find({
      $or: [
        { department: group.department, capacity: { $gte: group.students.length } },
        { department: 'Mathematics', capacity: { $gte: group.students.length } }
      ]
    });
    
    if (venues.length === 0) {
      return errorResponse(
        res, 
        'No suitable venues found for this group', 
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    console.log(`Found ${venues.length} suitable venues for group ${group.name}`);
    
    // Generate time slots
    // Improved algorithm for better scheduling
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
    
    // For each subject, assign a time slot with improved distribution
    for (const subject of subjects) {
      let slotAssigned = false;
      console.log(`Trying to assign subject: ${subject.name} (${subject.department})`);
      
      // Try different days and times for better distribution
      // Start from a random position in the day/time grid to avoid patterns
      let dayIndex = Math.floor(Math.random() * days.length);
      let timeIndex = Math.floor(Math.random() * availableTimeSlots.length);
      
      // Try to find an available slot
      // We need to try all possible combinations of days and time slots
      for (let attemptCount = 0; attemptCount < days.length * availableTimeSlots.length; attemptCount++) {
        if (slotAssigned) break;
        
        // Get next day and time slot in sequence
        const day = days[dayIndex];
        const timeSlot = availableTimeSlots[timeIndex];
        
        // Move to next time slot for next attempt
        timeIndex = (timeIndex + 1) % availableTimeSlots.length;
        if (timeIndex === 0) {
          dayIndex = (dayIndex + 1) % days.length;
        }
        
        // Check if this day/time combination already has a subject for this group
        const groupSlotConflict = existingSlots.some(slot => 
          slot.day === day && 
          timeSlot.start === slot.startTime && 
          timeSlot.end === slot.endTime
        );
        
        if (groupSlotConflict) {
          console.log(`Slot conflict found for ${day} at ${timeSlot.start}-${timeSlot.end}`);
          continue; // Skip this time slot if there's already a subject assigned
        }
        
        // Find a suitable venue
        for (const venue of venues) {
          // For Mathematics subjects, try to find a venue in the Mathematics department first
          // but fall back to the group's department if necessary
          if ((subject.department === 'Mathematics' && 
               (venue.department === 'Mathematics' || venue.department === group.department)) ||
              (subject.department === group.department && venue.department === group.department)) {
            
            if (isVenueAvailable(venue._id, day, timeSlot.start, timeSlot.end, existingSlots, globalBookings) &&
                isLecturerAvailable(subject.lecturer._id, day, timeSlot.start, timeSlot.end, existingSlots, globalBookings)) {
              
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
              console.log(`Assigned ${subject.name} to ${group.name} on ${day} at ${timeSlot.start}-${timeSlot.end}`);
              break;
            }
          }
        }
      }
      
      if (!slotAssigned) {
        console.warn(`Could not assign a slot for subject ${subject.name}`);
      }
    }
    
    if (timeSlots.length === 0) {
      return errorResponse(
        res, 
        'Could not generate any time slots for this group', 
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Create a new timetable
    timetable = new Timetable({
      group: groupId,
      month,
      year,
      timeSlots
    });
    
    await timetable.save();
    console.log(`Timetable generated successfully for group ${group.name} with ${timeSlots.length} slots`);
    
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
    const { month, year, forceRegenerate = false } = req.body;
    
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
    
    // If forceRegenerate is true, delete all existing timetables for this month/year
    if (forceRegenerate) {
      const deleteResult = await Timetable.deleteMany({ month, year });
      console.log(`Deleted ${deleteResult.deletedCount} existing timetables for ${month}/${year}`);
    }
    
    // Sort groups by number of subjects in their department to prioritize more complex groups first
    const groupsWithInfo = [];
    for (const group of groups) {
      // Count subjects for this group's department
      const subjectCount = await Subject.countDocuments({ 
        $or: [
          { department: group.department, status: 'active' },
          { department: 'Mathematics', status: 'active' }
        ]
      });
      
      groupsWithInfo.push({
        group,
        subjectCount
      });
    }
    
    // Sort groups by subject count in descending order
    groupsWithInfo.sort((a, b) => b.subjectCount - a.subjectCount);
    
    // Centralized tracking of venue and lecturer bookings across all groups
    // This ensures no venue or lecturer is double-booked across different groups
    const globalBookings = [];
    
    // Generate timetable for each group, starting with the most complex ones
    for (const { group } of groupsWithInfo) {
      try {
        // Check if timetable already exists
        const existingTimetable = await Timetable.findOne({ 
          group: group._id, 
          month, 
          year 
        });
        
        if (existingTimetable && !forceRegenerate) {
          results.failed.push({
            groupId: group._id,
            name: group.name,
            reason: 'Timetable already exists'
          });
          continue;
        }
        
        // Special request to use global venue and lecturer booking tracking
        const mockReq = {
          body: {
            groupId: group._id,
            month,
            year,
            forceRegenerate,
            globalBookings  // Pass the global bookings to coordinate across groups
          }
        };
        
        // Mock response object
        const mockRes = {
          status: function(code) {
            this.statusCode = code;
            return this;
          },
          json: function(data) {
            this.data = data;
            return this;
          }
        };
        
        await generateTimetable(mockReq, mockRes);
        
        // Check if the operation was successful
        if (mockRes.statusCode === HTTP_STATUS.CREATED) {
          // Update global bookings with the new timetable's slots
          if (mockRes.data?.data?.timeSlots) {
            mockRes.data.data.timeSlots.forEach(slot => {
              globalBookings.push({
                day: slot.day,
                startTime: slot.startTime,
                endTime: slot.endTime,
                venue: slot.venue,
                lecturer: slot.lecturer
              });
            });
          }
          
          results.success.push({
            groupId: group._id,
            name: group.name
          });
        } else {
          results.failed.push({
            groupId: group._id,
            name: group.name,
            reason: mockRes.data?.message || 'Unknown error'
          });
        }
      } catch (error) {
        results.failed.push({
          groupId: group._id,
          name: group.name,
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

// Optimize a timetable
export const optimizeTimetable = async (req, res) => {
  try {
    const { timetableId } = req.params;
    
    if (!timetableId) {
      return errorResponse(
        res, 
        'Timetable ID is required', 
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Get the timetable
    const timetable = await Timetable.findById(timetableId)
      .populate({
        path: 'group',
        populate: {
          path: 'students'
        }
      })
      .populate('timeSlots.subject')
      .populate('timeSlots.venue')
      .populate('timeSlots.lecturer');
    
    if (!timetable) {
      return errorResponse(
        res, 
        'Timetable not found', 
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    // Get all subjects for this department
    const subjects = await Subject.find({ 
      $or: [
        { department: timetable.group.department, status: 'active' },
        { department: 'Mathematics', status: 'active' }
      ]
    }).populate('lecturer');
    
    // Get all venues
    const venues = await Venue.find({
      $or: [
        { department: timetable.group.department, capacity: { $gte: timetable.group.students.length } },
        { department: 'Mathematics', capacity: { $gte: timetable.group.students.length } }
      ]
    });
    
    // Get bookings from other timetables for the same month/year
    const otherTimetables = await Timetable.find({
      _id: { $ne: timetableId },
      month: timetable.month,
      year: timetable.year
    }).populate('timeSlots.venue').populate('timeSlots.lecturer');
    
    const globalBookings = [];
    otherTimetables.forEach(tt => {
      tt.timeSlots.forEach(slot => {
        globalBookings.push({
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          venue: slot.venue._id,
          lecturer: slot.lecturer._id
        });
      });
    });
    
    // Run the optimization
    const optimizedTimetable = await optimizeTimetableUtil(
      timetable,
      subjects,
      venues,
      globalBookings
    );
    
    // Save the optimized timetable
    await Timetable.findByIdAndUpdate(timetableId, {
      timeSlots: optimizedTimetable.timeSlots,
      optimizationScore: optimizedTimetable.optimizationScore,
      optimizationDetails: optimizedTimetable.optimizationDetails
    });
    
    return successResponse(
      res,
      'Timetable optimized successfully',
      HTTP_STATUS.OK,
      optimizedTimetable
    );
    
  } catch (error) {
    console.error('Error optimizing timetable:', error);
    return errorResponse(
      res,
      'Server error while optimizing timetable',
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
};

// Lock or unlock a time slot
export const lockTimeSlot = async (req, res) => {
  try {
    const { timetableId, slotId } = req.params;
    const { isLocked } = req.body;
    
    if (!timetableId || !slotId) {
      return errorResponse(
        res, 
        'Timetable ID and slot ID are required', 
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Find the timetable
    const timetable = await Timetable.findById(timetableId);
    
    if (!timetable) {
      return errorResponse(
        res, 
        'Timetable not found', 
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    // Find the slot
    const slotIndex = timetable.timeSlots.findIndex(slot => 
      slot._id.toString() === slotId
    );
    
    if (slotIndex === -1) {
      return errorResponse(
        res, 
        'Time slot not found', 
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    // Update the slot
    timetable.timeSlots[slotIndex].isLocked = !!isLocked;
    
    // Save the timetable
    await timetable.save();
    
    return successResponse(
      res,
      `Time slot ${isLocked ? 'locked' : 'unlocked'} successfully`,
      HTTP_STATUS.OK,
      timetable
    );
    
  } catch (error) {
    console.error('Error locking/unlocking time slot:', error);
    return errorResponse(
      res,
      'Server error while updating time slot',
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
};

// Manually assign a time slot
export const assignTimeSlot = async (req, res) => {
  try {
    const { timetableId } = req.params;
    const { 
      subjectId, venueId, day, startTime, endTime 
    } = req.body;
    
    if (!timetableId || !subjectId || !venueId || !day || !startTime || !endTime) {
      return errorResponse(
        res, 
        'All fields are required', 
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Find the timetable
    const timetable = await Timetable.findById(timetableId);
    
    if (!timetable) {
      return errorResponse(
        res, 
        'Timetable not found', 
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    // Find the subject
    const subject = await Subject.findById(subjectId);
    
    if (!subject) {
      return errorResponse(
        res, 
        'Subject not found', 
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    // Find the venue
    const venue = await Venue.findById(venueId);
    
    if (!venue) {
      return errorResponse(
        res, 
        'Venue not found', 
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    // Check for conflicts
    const hasConflict = timetable.timeSlots.some(slot =>
      slot.day === day &&
      ((startTime >= slot.startTime && startTime < slot.endTime) ||
       (endTime > slot.startTime && endTime <= slot.endTime) ||
       (startTime <= slot.startTime && endTime >= slot.endTime)) &&
      (slot.venue.toString() === venueId ||
       slot.lecturer.toString() === subject.lecturer.toString())
    );
    
    if (hasConflict) {
      return errorResponse(
        res, 
        'This assignment would create a conflict', 
        HTTP_STATUS.CONFLICT
      );
    }
    
    // Add the new slot
    const newSlot = {
      day,
      startTime,
      endTime,
      subject: subjectId,
      venue: venueId,
      lecturer: subject.lecturer,
      isLocked: true, // Lock it by default
      manuallyAssigned: true
    };
    
    timetable.timeSlots.push(newSlot);
    
    // Save the timetable
    await timetable.save();
    
    return successResponse(
      res,
      'Time slot assigned successfully',
      HTTP_STATUS.CREATED,
      timetable
    );
    
  } catch (error) {
    console.error('Error assigning time slot:', error);
    return errorResponse(
      res,
      'Server error while assigning time slot',
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
}; 