// Timetable Generation Script for Academic Scheduler

// Import required modules
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Setup path for .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

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

// Define complete schema for Group model
const groupSchema = new mongoose.Schema({
  name: String,
  faculty: String,
  department: String,
  year: Number,
  semester: Number,
  groupType: String,
  students: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }]
}, { collection: 'groups' });

// Define complete schema for Subject model
const subjectSchema = new mongoose.Schema({
  name: String,
  code: String,
  description: String,
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  credits: Number,
  department: String,
  status: String
}, { collection: 'subjects' });

// Define complete schema for Venue model
const venueSchema = new mongoose.Schema({
  faculty: String,
  department: String,
  building: String,
  hallName: String,
  type: String,
  capacity: Number,
  bookedSlots: [{
    date: Date,
    startTime: String,
    endTime: String
  }]
}, { collection: 'venues' });

const Group = mongoose.model('Group', groupSchema);
const Subject = mongoose.model('Subject', subjectSchema);
const Venue = mongoose.model('Venue', venueSchema);

// Define schema for User model
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  department: String,
  profilePicture: String,
  refreshToken: String,
  isFirstLogin: Boolean,
  passwordChangeRequired: Boolean,
  defaultPassword: String
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

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
    // Include both subjects from the group's department AND Mathematics subjects
    // since Mathematics is a supporting department for all technical subjects
    const subjects = await Subject.find({ 
      $or: [
        { department: group.department, status: 'active' },
        { department: 'Mathematics', status: 'active' }  // Include Math subjects for all departments
      ]
    }).populate('lecturer');
    
    if (subjects.length === 0) {
      throw new Error('No subjects found for this group');
    }
    
    console.log(`Found ${subjects.length} subjects for group ${group.name}`);
    
    // Get available venues
    // Include venues from both the group's department AND common venues
    const venues = await Venue.find({
      $or: [
        { department: group.department, capacity: { $gte: group.students.length } },
        { department: 'Mathematics', capacity: { $gte: group.students.length } }  // Include Math venues if any
      ]
    });
    
    if (venues.length === 0) {
      throw new Error('No suitable venues found for this group');
    }
    
    console.log(`Found ${venues.length} suitable venues for group ${group.name}`);
    
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
      console.log(`Trying to assign subject: ${subject.name} (${subject.department})`);
      
      // Debug lecturer information
      console.log(`Lecturer ID for ${subject.name}: ${subject.lecturer}`);
      
      // Try different days and times for better distribution
      let dayIndex = 0;
      let timeIndex = 0;
      
      // Try to find an available slot
      for (let attempt = 0; attempt < days.length * availableTimeSlots.length; attempt++) {
        if (slotAssigned) break;
        
        // Get next day and time slot in sequence
        const day = days[dayIndex];
        const timeSlot = availableTimeSlots[timeIndex];
        
        // Move to next time slot for next attempt
        timeIndex = (timeIndex + 1) % availableTimeSlots.length;
        if (timeIndex === 0) {
          dayIndex = (dayIndex + 1) % days.length;
        }
        
        // Find any suitable venue
        for (const venue of venues) {
          console.log(`Checking venue: ${venue.hallName || 'Unnamed'} (${venue.department || 'Unknown'}) for subject ${subject.name}`);
          
          // Check if this exact day/time/venue combination is already used
          const slotExists = existingSlots.some(s => 
            s.day === day && 
            s.startTime === timeSlot.start && 
            s.endTime === timeSlot.end && 
            s.venue.toString() === venue._id.toString()
          );
          
          if (!slotExists) {
            const newSlot = {
              day,
              startTime: timeSlot.start,
              endTime: timeSlot.end,
              subject: subject._id,
              venue: venue._id,
              lecturer: subject.lecturer
            };
            
            timeSlots.push(newSlot);
            existingSlots.push(newSlot);
            slotAssigned = true;
            console.log(`SUCCESS: Assigned ${subject.name} to ${group.name} on ${day} at ${timeSlot.start}-${timeSlot.end}`);
            break;
          }
        }
      }
      
      if (!slotAssigned) {
        console.log(`Could not find any available slot for ${subject.name}`);
      }
    }
    
    if (timeSlots.length === 0) {
      throw new Error('Could not generate any time slots for this group');
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
    console.log(`Time Slots: ${timetable.timeSlots.length}`);
    
    console.log('\n===== TIME SLOTS =====');
    
    // Group time slots by day
    const slotsByDay = {};
    for (const slot of timetable.timeSlots) {
      if (!slotsByDay[slot.day]) {
        slotsByDay[slot.day] = [];
      }
      slotsByDay[slot.day].push(slot);
    }
    
    // Sort days
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Display time slots by day
    for (const day of daysOrder) {
      if (slotsByDay[day]) {
        console.log(`\n${day}:`);
        
        // Sort time slots by start time
        slotsByDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        for (const slot of slotsByDay[day]) {
          console.log(`  ${slot.startTime} - ${slot.endTime}`);
          console.log(`  Subject: ${slot.subject.name} (${slot.subject.code})`);
          console.log(`  Venue: ${slot.venue.building} - ${slot.venue.hallName}`);
          console.log(`  Lecturer: ${slot.lecturer.firstName} ${slot.lecturer.lastName}`);
          console.log('');
        }
      }
    }
    
    console.log('======= END OF TIMETABLE =======\n');
  } catch (error) {
    console.error('Error displaying timetable:', error.message);
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
    
    // Use provided month and year, or default to current month and year
    const currentMonth = 1; // Use January (1)
    const currentYear = 2025; // Use 2025
    
    // Delete existing timetables for this month/year
    console.log(`Deleting existing timetables for ${currentMonth}/${currentYear}...`);
    const deleteResult = await Timetable.deleteMany({ month: currentMonth, year: currentYear });
    console.log(`Deleted ${deleteResult.deletedCount} existing timetables.`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const group of groups) {
      console.log(`Generating timetable for group: ${group.name}`);
      
      try {
        const timetable = await generateTimetable(group._id, currentMonth, currentYear);
        await displayTimetable(timetable._id);
        successCount++;
      } catch (error) {
        console.error(`Error generating timetable for group ${group.name}:`, error.message);
        failCount++;
        // Continue with next group
      }
    }
    
    console.log(`Timetable generation completed! Success: ${successCount}, Failed: ${failCount}`);
    
  } catch (error) {
    console.error('Script error:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
main(); 