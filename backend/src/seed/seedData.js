import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connect_db } from '../config/db.config.js';

// Import models
import User, { ROLES } from '../models/user.model.js';
import Subject from '../models/subject.model.js';
import Group from '../models/group.model.js';
import Venue from '../models/venue.model.js';

dotenv.config();

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-scheduler';

// Helper function to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Sample data
const lecturers = [
  { firstName: 'John', lastName: 'Smith', email: 'john.smith@university.edu', password: 'password123' },
  { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@university.edu', password: 'password123' },
  { firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@university.edu', password: 'password123' },
  { firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@university.edu', password: 'password123' },
  { firstName: 'David', lastName: 'Wilson', email: 'david.wilson@university.edu', password: 'password123' },
  { firstName: 'Jessica', lastName: 'Taylor', email: 'jessica.taylor@university.edu', password: 'password123' },
  { firstName: 'Robert', lastName: 'Anderson', email: 'robert.anderson@university.edu', password: 'password123' },
  { firstName: 'Jennifer', lastName: 'Thomas', email: 'jennifer.thomas@university.edu', password: 'password123' },
  { firstName: 'Daniel', lastName: 'Jackson', email: 'daniel.jackson@university.edu', password: 'password123' },
  { firstName: 'Lisa', lastName: 'White', email: 'lisa.white@university.edu', password: 'password123' },
  { firstName: 'Kevin', lastName: 'Harris', email: 'kevin.harris@university.edu', password: 'password123' },
  { firstName: 'Michelle', lastName: 'Martin', email: 'michelle.martin@university.edu', password: 'password123' }
];

const subjects = [
  { name: 'Introduction to Computer Science', code: 'CS101', credits: 3 },
  { name: 'Data Structures and Algorithms', code: 'CS201', credits: 4 },
  { name: 'Database Systems', code: 'CS301', credits: 3 },
  { name: 'Software Engineering', code: 'SE401', credits: 4 },
  { name: 'Operating Systems', code: 'CS302', credits: 3 },
  { name: 'Web Development', code: 'WD201', credits: 3 },
  { name: 'Artificial Intelligence', code: 'AI401', credits: 4 },
  { name: 'Computer Networks', code: 'CN301', credits: 3 },
  { name: 'Mobile App Development', code: 'MAD301', credits: 3 },
  { name: 'IT Project Management', code: 'PM401', credits: 4 },
  { name: 'Cybersecurity', code: 'CS402', credits: 3 },
  { name: 'Cloud Computing', code: 'CC301', credits: 3 }
];

const groups = [
  { name: 'CSE-1-1', faculty: 'Engineering', department: 'Computer Engineering', year: 1, semester: 1, groupType: 'weekday' },
  { name: 'CSE-2-1', faculty: 'Engineering', department: 'Computer Engineering', year: 2, semester: 1, groupType: 'weekday' },
  { name: 'CS-1-1', faculty: 'Science', department: 'Computer Science', year: 1, semester: 1, groupType: 'weekday' },
  { name: 'CS-2-1', faculty: 'Science', department: 'Computer Science', year: 2, semester: 1, groupType: 'weekday' },
  { name: 'SE-1-1', faculty: 'Engineering', department: 'Computer Engineering', year: 1, semester: 1, groupType: 'weekend' },
  { name: 'SE-2-1', faculty: 'Engineering', department: 'Computer Engineering', year: 2, semester: 1, groupType: 'weekend' }
];

// Sample venue data
const venues = [
  // Engineering venues
  { faculty: 'Engineering', department: 'Computer Engineering', building: 'Engineering Building A', hallName: 'Lecture Hall E101', type: 'lecture', capacity: 120 },
  { faculty: 'Engineering', department: 'Computer Engineering', building: 'Engineering Building A', hallName: 'Lecture Hall E102', type: 'lecture', capacity: 80 },
  { faculty: 'Engineering', department: 'Computer Engineering', building: 'Engineering Building B', hallName: 'Tutorial Room T101', type: 'tutorial', capacity: 40 },
  { faculty: 'Engineering', department: 'Computer Engineering', building: 'Engineering Building B', hallName: 'Computer Lab CL01', type: 'lab', capacity: 30 },
  { faculty: 'Engineering', department: 'Computer Engineering', building: 'Engineering Building B', hallName: 'Computer Lab CL02', type: 'lab', capacity: 30 },

  // Science venues
  { faculty: 'Science', department: 'Computer Science', building: 'Science Building A', hallName: 'Lecture Hall S101', type: 'lecture', capacity: 100 },
  { faculty: 'Science', department: 'Computer Science', building: 'Science Building A', hallName: 'Lecture Hall S102', type: 'lecture', capacity: 60 },
  { faculty: 'Science', department: 'Computer Science', building: 'Science Building B', hallName: 'Tutorial Room ST01', type: 'tutorial', capacity: 35 },
  { faculty: 'Science', department: 'Computer Science', building: 'Science Building B', hallName: 'Computer Lab SL01', type: 'lab', capacity: 25 },
  { faculty: 'Science', department: 'Computer Science', building: 'Science Building B', hallName: 'Computer Lab SL02', type: 'lab', capacity: 25 },

  // Business venues
  { faculty: 'Business', department: 'Management', building: 'Business Building', hallName: 'Lecture Hall B101', type: 'lecture', capacity: 90 },
  { faculty: 'Business', department: 'Management', building: 'Business Building', hallName: 'Tutorial Room BT01', type: 'tutorial', capacity: 30 },

  // Arts venues
  { faculty: 'Arts', department: 'Languages', building: 'Arts Building', hallName: 'Lecture Hall A101', type: 'lecture', capacity: 70 },
  { faculty: 'Arts', department: 'Languages', building: 'Arts Building', hallName: 'Tutorial Room AT01', type: 'tutorial', capacity: 25 },
];

// Create students for each group
const createStudents = async (groupName, count) => {
  const students = [];
  const defaultPassword = await hashPassword('password123');
  
  for (let i = 1; i <= count; i++) {
    const student = new User({
      firstName: `Student${i}`,
      lastName: `${groupName}`,
      email: `student${i}.${groupName.toLowerCase()}@university.edu`,
      password: defaultPassword,
      role: ROLES.STUDENT,
      isFirstLogin: true,
      passwordChangeRequired: true,
      defaultPassword: 'password123'
    });
    
    await student.save();
    students.push(student._id);
  }
  
  return students;
};

// Seed data function
const seedData = async () => {
  try {
    // Set reference date to May 6, 2025
    const referenceDate = new Date('2025-05-06');
    
    // Connect to database
    await connect_db();
    console.log('Connected to the database for seeding');
    console.log(`Using reference date: ${referenceDate.toDateString()}`);

    // Clear existing data
    await User.deleteMany({ role: { $in: [ROLES.LECTURER, ROLES.STUDENT] } });
    await Subject.deleteMany({});
    await Group.deleteMany({});
    await Venue.deleteMany({});
    
    console.log('Cleared existing data');

    // Create lecturers
    const lecturerIds = [];
    const defaultPassword = await hashPassword('password123');
    
    for (const lecturerData of lecturers) {
      const lecturer = new User({
        ...lecturerData,
        password: defaultPassword,
        role: ROLES.LECTURER,
        isFirstLogin: true,
        passwordChangeRequired: true,
        defaultPassword: 'password123'
      });
      
      await lecturer.save();
      lecturerIds.push(lecturer._id);
    }
    
    console.log('Created lecturers');

    // Create subjects and assign lecturers
    const subjectIds = [];
    
    for (let i = 0; i < subjects.length; i++) {
      const subject = new Subject({
        ...subjects[i],
        lecturer: lecturerIds[i] // Each subject gets one lecturer
      });
      
      await subject.save();
      subjectIds.push(subject._id);
    }
    
    console.log('Created subjects and assigned lecturers');

    // Create groups with students
    for (const groupData of groups) {
      // Create students for this group (random number between 15-25)
      const studentCount = Math.floor(Math.random() * 11) + 15; // 15-25 students
      const studentIds = await createStudents(groupData.name, studentCount);
      
      const group = new Group({
        ...groupData,
        students: studentIds,
      });
      
      await group.save();
    }
    
    console.log('Created groups with students');

    // Create venues
    const venueIds = [];
    
    for (const venueData of venues) {
      const venue = new Venue({
        ...venueData,
        bookedSlots: [] // Initially no bookings
      });
      
      await venue.save();
      venueIds.push(venue._id);
    }
    
    console.log(`Created ${venueIds.length} venues`);

    console.log('Database seeded successfully!');
    console.log(`Created ${lecturerIds.length} lecturers`);
    console.log(`Created ${subjectIds.length} subjects`);
    console.log(`Created ${groups.length} groups`);
    console.log(`Created ${venueIds.length} venues`);
    
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData(); 