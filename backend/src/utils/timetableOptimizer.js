/**
 * Timetable Optimizer Utility
 * Contains algorithms for optimizing timetables using backtracking and scoring
 */

/**
 * Calculate a score for a timetable based on various optimization criteria
 * @param {Array} timeSlots - Array of time slots in the timetable
 * @param {Object} group - The student group
 * @param {Array} subjects - Array of subjects with preferences
 * @return {Object} Score details including total and component scores
 */
export const calculateTimetableScore = (timeSlots, group, subjects) => {
  // Initialize score components
  const scoreDetails = {
    gapScore: 0,
    distributionScore: 0,
    preferenceScore: 0,
    total: 0
  };
  
  if (!timeSlots.length) return scoreDetails;
  
  // 1. Gap Score: Minimize gaps in student schedules
  scoreDetails.gapScore = calculateGapScore(timeSlots, group);
  
  // 2. Distribution Score: Balance classes across days
  scoreDetails.distributionScore = calculateDistributionScore(timeSlots);
  
  // 3. Preference Score: How well the schedule matches preferences
  scoreDetails.preferenceScore = calculatePreferenceScore(timeSlots, subjects);
  
  // Calculate total weighted score
  scoreDetails.total = (
    (scoreDetails.gapScore * 0.4) + 
    (scoreDetails.distributionScore * 0.3) + 
    (scoreDetails.preferenceScore * 0.3)
  );
  
  return scoreDetails;
};

/**
 * Calculate score based on gaps in student schedules
 * @param {Array} timeSlots - Array of time slots
 * @return {Number} Score from 0-10, higher is better
 */
const calculateGapScore = (timeSlots) => {
  // Group slots by day
  const slotsByDay = {};
  timeSlots.forEach(slot => {
    if (!slotsByDay[slot.day]) {
      slotsByDay[slot.day] = [];
    }
    slotsByDay[slot.day].push({
      start: slot.startTime,
      end: slot.endTime
    });
  });
  
  // For each day, calculate gaps between classes
  let totalGapMins = 0;
  let totalDaysWithClasses = 0;
  
  Object.keys(slotsByDay).forEach(day => {
    const daySlots = slotsByDay[day];
    if (daySlots.length <= 1) return; // No gaps if only one or zero classes
    
    // Sort slots by start time
    daySlots.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
    
    // Calculate gaps
    let dayGapMins = 0;
    for (let i = 0; i < daySlots.length - 1; i++) {
      const gapMins = timeToMinutes(daySlots[i+1].start) - timeToMinutes(daySlots[i].end);
      if (gapMins > 0 && gapMins < 120) { // Only count gaps less than 2 hours
        dayGapMins += gapMins;
      }
    }
    
    totalGapMins += dayGapMins;
    totalDaysWithClasses++;
  });
  
  // Lower total gap minutes = higher score
  // No gaps = 10, Many gaps = 0
  const averageGapMins = totalDaysWithClasses > 0 ? (totalGapMins / totalDaysWithClasses) : 0;
  return Math.max(0, 10 - (averageGapMins / 30)); // Lose 1 point for every 30 mins of average gap
};

/**
 * Calculate score based on distribution of classes across days
 * @param {Array} timeSlots - Array of time slots
 * @return {Number} Score from 0-10, higher is better
 */
const calculateDistributionScore = (timeSlots) => {
  // Count classes per day
  const classesByDay = {};
  const totalDays = 5; // Monday-Friday
  
  timeSlots.forEach(slot => {
    classesByDay[slot.day] = (classesByDay[slot.day] || 0) + 1;
  });
  
  // Calculate standard deviation of class counts
  const counts = Array(totalDays).fill(0).map((_, i) => {
    const day = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][i];
    return classesByDay[day] || 0;
  });
  
  const avg = counts.reduce((sum, c) => sum + c, 0) / totalDays;
  const variance = counts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / totalDays;
  const stdDev = Math.sqrt(variance);
  
  // Lower standard deviation = better distribution = higher score
  // Perfect distribution = 10, Poor distribution = 0
  return Math.max(0, 10 - (stdDev * 2)); 
};

/**
 * Calculate score based on how well the schedule matches preferences
 * @param {Array} timeSlots - Array of time slots
 * @param {Array} subjects - Array of subjects with preferences
 * @return {Number} Score from 0-10, higher is better
 */
const calculatePreferenceScore = (timeSlots, subjects) => {
  if (!subjects || !subjects.length) return 5; // Neutral score if no subjects with preferences
  
  let totalPreferenceScore = 0;
  let matchCount = 0;
  
  // For each time slot, check if it aligns with subject preferences
  timeSlots.forEach(slot => {
    const subject = subjects.find(s => s._id.toString() === slot.subject.toString());
    if (!subject) return;
    
    let slotScore = 0;
    
    // Check day preference
    if (subject.preferredDays && subject.preferredDays.includes(slot.day)) {
      slotScore += 5;
    }
    
    // Check time preference
    if (subject.preferredTimeRanges && subject.preferredTimeRanges.length) {
      const slotStartMins = timeToMinutes(slot.startTime);
      const inPreferredTime = subject.preferredTimeRanges.some(range => {
        const rangeStartMins = timeToMinutes(range.startTime);
        const rangeEndMins = timeToMinutes(range.endTime);
        return slotStartMins >= rangeStartMins && slotStartMins < rangeEndMins;
      });
      
      if (inPreferredTime) {
        slotScore += 5;
      }
    }
    
    totalPreferenceScore += slotScore;
    matchCount++;
  });
  
  // Normalize to 0-10 scale
  return matchCount > 0 ? (totalPreferenceScore / matchCount) : 5;
};

/**
 * Convert time string (HH:MM) to minutes since midnight
 * @param {String} timeStr - Time string in HH:MM format
 * @return {Number} Minutes since midnight
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours * 60) + minutes;
};

/**
 * Generate all possible time slots based on the configuration
 * @param {Boolean} includeWeekends - Whether to include weekend days
 * @param {Number} slotDuration - Duration of each slot in minutes
 * @param {Number} startHour - Starting hour of the day (24h format)
 * @param {Number} endHour - Ending hour of the day (24h format)
 * @return {Array} Array of possible time slots
 */
export const generatePossibleTimeSlots = (
  includeWeekends = false, 
  slotDuration = 120, 
  startHour = 8, 
  endHour = 18
) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  if (includeWeekends) {
    days.push('Saturday', 'Sunday');
  }
  
  const timeSlots = [];
  const totalMinsInDay = (endHour - startHour) * 60;
  const totalSlots = Math.floor(totalMinsInDay / slotDuration);
  
  for (const day of days) {
    for (let slotIndex = 0; slotIndex < totalSlots; slotIndex++) {
      const startMins = (startHour * 60) + (slotIndex * slotDuration);
      const endMins = startMins + slotDuration;
      
      const startTime = `${Math.floor(startMins / 60).toString().padStart(2, '0')}:${(startMins % 60).toString().padStart(2, '0')}`;
      const endTime = `${Math.floor(endMins / 60).toString().padStart(2, '0')}:${(endMins % 60).toString().padStart(2, '0')}`;
      
      timeSlots.push({
        day,
        startTime,
        endTime
      });
    }
  }
  
  return timeSlots;
};

/**
 * Backtracking algorithm to optimize timetable
 * @param {Array} subjects - Subjects to be scheduled
 * @param {Array} venues - Available venues
 * @param {Array} possibleTimeSlots - All possible time slots
 * @param {Array} lockedAssignments - Slots that should not be changed
 * @param {Array} globalBookings - Bookings from other timetables to avoid conflicts
 * @param {Number} maxBacktracks - Maximum number of backtracking attempts
 * @return {Array|null} Optimized time slots or null if no solution
 */
export const optimizeWithBacktracking = (
  subjects,
  venues,
  possibleTimeSlots,
  lockedAssignments = [],
  globalBookings = [],
  maxBacktracks = 1000
) => {
  // Track the number of backtracking attempts
  let backtracks = 0;
  
  // Clone the locked assignments so we don't modify the original
  const assignments = [...lockedAssignments];
  
  // Sort subjects by priority, highest first
  const sortedSubjects = [...subjects].sort((a, b) => b.priority - a.priority);
  
  // Skip already assigned subjects (those in locked assignments)
  const unassignedSubjects = sortedSubjects.filter(subject => 
    !assignments.some(a => a.subject.toString() === subject._id.toString())
  );
  
  // Recursive backtracking function
  const assignSubjects = (index) => {
    // Base case: all subjects are assigned
    if (index >= unassignedSubjects.length) {
      return true;
    }
    
    // Track if we need to backtrack
    backtracks++;
    if (backtracks > maxBacktracks) {
      console.log(`Maximum backtracking limit (${maxBacktracks}) reached. Returning partial solution.`);
      return false;
    }
    
    const subject = unassignedSubjects[index];
    
    // Try each possible time slot for this subject
    for (const timeSlot of possibleTimeSlots) {
      // Skip if the session duration doesn't match
      const slotDuration = timeToMinutes(timeSlot.endTime) - timeToMinutes(timeSlot.startTime);
      if (subject.sessionDuration && subject.sessionDuration !== slotDuration) {
        continue;
      }
      
      // Skip if not a preferred day (if preferences are specified)
      if (subject.preferredDays && subject.preferredDays.length && 
          !subject.preferredDays.includes(timeSlot.day)) {
        continue;
      }
      
      // Try each possible venue
      for (const venue of venues) {
        // Skip if venue type doesn't match requirements
        if (subject.requiredVenueTypes && 
            subject.requiredVenueTypes.length && 
            subject.requiredVenueTypes[0] !== 'any' && 
            !subject.requiredVenueTypes.includes(venue.type)) {
          continue;
        }
        
        // Check for conflicts with existing assignments
        const hasConflict = assignments.some(assignment => 
          // Same day and time
          (assignment.day === timeSlot.day && 
           assignment.startTime === timeSlot.startTime &&
           assignment.endTime === timeSlot.endTime) && 
          // Same venue OR lecturer
          (assignment.venue.toString() === venue._id.toString() || 
           assignment.lecturer.toString() === subject.lecturer.toString())
        );
        
        if (hasConflict) continue;
        
        // Check for conflicts with global bookings
        const hasGlobalConflict = globalBookings.some(booking => 
          // Same day and time
          (booking.day === timeSlot.day && 
           booking.startTime === timeSlot.startTime &&
           booking.endTime === timeSlot.endTime) && 
          // Same venue OR lecturer
          (booking.venue.toString() === venue._id.toString() || 
           booking.lecturer.toString() === subject.lecturer.toString())
        );
        
        if (hasGlobalConflict) continue;
        
        // This assignment works! Add it and try the next subject
        const newAssignment = {
          day: timeSlot.day,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          subject: subject._id,
          venue: venue._id,
          lecturer: subject.lecturer,
          isLocked: false,
          manuallyAssigned: false
        };
        
        assignments.push(newAssignment);
        
        // Try to assign the next subject
        if (assignSubjects(index + 1)) {
          return true;
        }
        
        // If we get here, this assignment didn't work out
        // Remove it and try another
        assignments.pop();
      }
    }
    
    // If we've tried all possibilities and none worked, return false
    // This will trigger backtracking
    return false;
  };
  
  // Start the backtracking
  const success = assignSubjects(0);
  
  // Even if we didn't find a complete solution, return what we have
  return assignments;
};

/**
 * Apply the backtracking algorithm to a timetable with locked slots
 * @param {Object} timetable - The timetable object
 * @param {Array} subjects - All subjects that need to be scheduled
 * @param {Array} venues - All available venues
 * @param {Array} globalBookings - Bookings from other timetables
 * @return {Object} Updated timetable object with optimized time slots
 */
export const optimizeTimetable = async (
  timetable, 
  subjects, 
  venues, 
  globalBookings = []
) => {
  try {
    // Filter subjects for this group's department
    const relevantSubjects = subjects.filter(subject => 
      subject.department === timetable.group.department || 
      subject.department === 'Mathematics'
    );
    
    // Get currently locked time slots
    const lockedSlots = timetable.timeSlots.filter(slot => slot.isLocked);
    
    // Generate possible time slots based on timetable configuration
    const possibleTimeSlots = generatePossibleTimeSlots(
      timetable.includeWeekends, // Use timetable setting for weekends
      120, // Default session duration
      8,  // Start at 8 AM
      18  // End at 6 PM
    );
    
    // Run the backtracking algorithm
    const optimizedSlots = optimizeWithBacktracking(
      relevantSubjects,
      venues,
      possibleTimeSlots,
      lockedSlots,
      globalBookings
    );
    
    // If optimization succeeds, update the timetable
    if (optimizedSlots) {
      // Calculate the score for the optimized timetable
      const scoreDetails = calculateTimetableScore(
        optimizedSlots, 
        timetable.group, 
        relevantSubjects
      );
      
      // Return updated timetable with new slots and score
      return {
        ...timetable,
        timeSlots: optimizedSlots,
        optimizationScore: scoreDetails.total,
        optimizationDetails: {
          gapScore: scoreDetails.gapScore,
          distributionScore: scoreDetails.distributionScore,
          preferenceScore: scoreDetails.preferenceScore
        }
      };
    }
    
    // If optimization fails, return the timetable unchanged
    return timetable;
  } catch (error) {
    console.error('Error optimizing timetable:', error);
    // Return the original timetable if there's an error
    return timetable;
  }
}; 