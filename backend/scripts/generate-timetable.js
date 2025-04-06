// Timetable Generation Script for Academic Scheduler

// Import required modules
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-scheduler')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define Timetable Schema
const timeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const timetableSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  timeSlots: [timeSlotSchema],
  generatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  }
}, { timestamps: true });

// Define models
const Timetable = mongoose.model('Timetable', timetableSchema);
const Group = mongoose.model('Group', {}, 'groups');
const Subject = mongoose.model('Subject', {}, 'subjects');
const Venue = mongoose.model('Venue', {}, 'venues');
const User = mongoose.model('User', {}, 'users');

// Helper functions
function isVenueAvailable(venueId, day, startTime, endTime, existingSlots) {
  for (const slot of existingSlots) {
    if (
      slot.venue.toString() === venueId.toString() &&
      slot.day === day &&
      ((startTime >= slot.startTime && startTime < slot.endTime) ||
        (endTime > slot.startTime && endTime <= slot.endTime) ||
        (startTime <= slot.startTime && endTime >= slot.endTime))
    ) {
      return false;
    }
  }
  return true;
}

function isLecturerAvailable(lecturerId, day, startTime, endTime, existingSlots) {
  for (const slot of existingSlots) {
    if (
      slot.lecturer.toString() === lecturerId.toString() &&
      slot.day === day &&
      ((startTime >= slot.startTime && startTime < slot.endTime) ||
        (endTime > slot.startTime && endTime <= slot.endTime) ||
        (startTime <= slot.startTime && endTime >= slot.endTime))
    ) {
      return false;
    }
  }
  return true;
}

// Function to generate timetable for a group
async function generateTimetable(groupId, month, year) {
  try {
    // Check if group exists
    const group = await Group.findById(groupId).populate('students');
    if (!group) {
      throw new Error('Group not found');
    }
    
    // Check if timetable already exists for this group/month/year
    let timetable = await Timetable.findOne({ group: groupId, month, year });
    if (timetable) {
      throw new Error('Timetable already exists for this group in the specified month and year');
    }
    
    // Get subjects that should be assigned to this group
    const subjects = await Subject.find({ 
      department: group.department,
      status: 'active'
    }).populate('lecturer');
    
    if (subjects.length === 0) {
      throw new Error('No subjects found for this group');
    }
    
    // Get available venues
    const venues = await Venue.find({
      department: group.department,
      capacity: { $gte: group.students.length }
    });
    
    if (venues.length === 0) {
      throw new Error('No suitable venues found for this group');
    }
    
    // Generate time slots
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
    console.log(`Timetable generated successfully for group ${group.name}`);
    return timetable;
  } catch (error) {
    console.error('Error generating timetable:', error.message);
    throw error;
  }
}

// Display timetable (for debugging purposes)
async function displayTimetable(timetableId) {
  try {
    const timetable = await Timetable.findById(timetableId)
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
        model: 'User',
        select: 'firstName lastName'
      });
    
    if (!timetable) {
      throw new Error('Timetable not found');
    }
    
    console.log('\n======= TIMETABLE DETAILS =======');
    console.log(`Group: ${timetable.group.name}`);
    console.log(`Month/Year: ${timetable.month}/${timetable.year}`);
    console.log(`Status: ${timetable.status}`);
    console.log('Generated at:', timetable.generatedAt);
    console.log('\n');
    
    // Organize slots by day
    const slotsByDay = {};
    for (const slot of timetable.timeSlots) {
      if (!slotsByDay[slot.day]) {
        slotsByDay[slot.day] = [];
      }
      slotsByDay[slot.day].push(slot);
    }
    
    // Sort days in order
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Display timetable
    for (const day of days) {
      if (slotsByDay[day]) {
        console.log(`== ${day} ==`);
        
        // Sort slots by start time
        slotsByDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        for (const slot of slotsByDay[day]) {
          console.log(`${slot.startTime} - ${slot.endTime}: ${slot.subject.name} (${slot.subject.code})`);
          console.log(`  Venue: ${slot.venue.building} - ${slot.venue.hallName}`);
          console.log(`  Lecturer: ${slot.lecturer.firstName} ${slot.lecturer.lastName}`);
          console.log('');
        }
        console.log('');
      }
    }
    
    console.log('======= END OF TIMETABLE =======\n');
    
  } catch (error) {
    console.error('Error displaying timetable:', error.message);
    throw error;
  }
}

// Main function to execute the script
async function main() {
  try {
    console.log('Getting groups from database...');
    const groups = await Group.find();
    
    if (groups.length === 0) {
      console.log('No groups found. Please run sample-data.js first to populate the database.');
      return;
    }
    
    // Generate timetables for all groups
    console.log(`Found ${groups.length} groups. Generating timetables...`);
    
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const currentYear = new Date().getFullYear();
    
    for (const group of groups) {
      console.log(`Generating timetable for group: ${group.name}`);
      
      try {
        const timetable = await generateTimetable(group._id, currentMonth, currentYear);
        await displayTimetable(timetable._id);
      } catch (error) {
        console.error(`Error generating timetable for group ${group.name}:`, error.message);
        // Continue with next group
      }
    }
    
    console.log('Timetable generation completed!');
    
  } catch (error) {
    console.error('Script error:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
main(); 