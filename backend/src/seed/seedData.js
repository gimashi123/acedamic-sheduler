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
  // Computer Science Department
  { firstName: 'John', lastName: 'Smith', email: 'john.smith@university.edu', password: 'password123', department: 'Computer Science' },
  { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@university.edu', password: 'password123', department: 'Computer Science' },
  { firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@university.edu', password: 'password123', department: 'Computer Science' },
  { firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@university.edu', password: 'password123', department: 'Computer Science' },
  { firstName: 'David', lastName: 'Wilson', email: 'david.wilson@university.edu', password: 'password123', department: 'Computer Science' },
  
  // Computer Engineering Department
  { firstName: 'Jessica', lastName: 'Taylor', email: 'jessica.taylor@university.edu', password: 'password123', department: 'Computer Engineering' },
  { firstName: 'Robert', lastName: 'Anderson', email: 'robert.anderson@university.edu', password: 'password123', department: 'Computer Engineering' },
  { firstName: 'Jennifer', lastName: 'Thomas', email: 'jennifer.thomas@university.edu', password: 'password123', department: 'Computer Engineering' },
  { firstName: 'Daniel', lastName: 'Jackson', email: 'daniel.jackson@university.edu', password: 'password123', department: 'Computer Engineering' },
  { firstName: 'Lisa', lastName: 'White', email: 'lisa.white@university.edu', password: 'password123', department: 'Computer Engineering' },
  
  // Mathematics Department
  { firstName: 'Kevin', lastName: 'Harris', email: 'kevin.harris@university.edu', password: 'password123', department: 'Mathematics' },
  { firstName: 'Michelle', lastName: 'Martin', email: 'michelle.martin@university.edu', password: 'password123', department: 'Mathematics' },
  { firstName: 'Paul', lastName: 'Robinson', email: 'paul.robinson@university.edu', password: 'password123', department: 'Mathematics' },
  
  // Physics Department
  { firstName: 'Laura', lastName: 'Clark', email: 'laura.clark@university.edu', password: 'password123', department: 'Physics' },
  { firstName: 'Steven', lastName: 'Rodriguez', email: 'steven.rodriguez@university.edu', password: 'password123', department: 'Physics' },
  
  // Business Department
  { firstName: 'Melissa', lastName: 'Garcia', email: 'melissa.garcia@university.edu', password: 'password123', department: 'Business' },
  { firstName: 'Thomas', lastName: 'Moore', email: 'thomas.moore@university.edu', password: 'password123', department: 'Business' },
  
  // English Department
  { firstName: 'Rebecca', lastName: 'Lee', email: 'rebecca.lee@university.edu', password: 'password123', department: 'English' }
];

// Subjects organized by year and department
const subjects = [
  // First Year - Computer Science
  { name: 'Introduction to Computer Science', code: 'CS101', credits: 3, department: 'Computer Science', year: 1 },
  { name: 'Programming Fundamentals', code: 'CS102', credits: 4, department: 'Computer Science', year: 1 },
  { name: 'Discrete Mathematics', code: 'CS103', credits: 3, department: 'Computer Science', year: 1 },
  { name: 'Introduction to Web Development', code: 'CS104', credits: 3, department: 'Computer Science', year: 1 },
  { name: 'Computer Organization', code: 'CS105', credits: 3, department: 'Computer Science', year: 1 },
  
  // Second Year - Computer Science
  { name: 'Data Structures and Algorithms', code: 'CS201', credits: 4, department: 'Computer Science', year: 2 },
  { name: 'Database Systems', code: 'CS202', credits: 3, department: 'Computer Science', year: 2 },
  { name: 'Operating Systems', code: 'CS203', credits: 3, department: 'Computer Science', year: 2 },
  { name: 'Computer Networks', code: 'CS204', credits: 3, department: 'Computer Science', year: 2 },
  { name: 'Software Engineering Principles', code: 'CS205', credits: 3, department: 'Computer Science', year: 2 },
  
  // First Year - Computer Engineering
  { name: 'Introduction to Engineering', code: 'CE101', credits: 3, department: 'Computer Engineering', year: 1 },
  { name: 'Digital Logic Design', code: 'CE102', credits: 4, department: 'Computer Engineering', year: 1 },
  { name: 'Electronics Fundamentals', code: 'CE103', credits: 3, department: 'Computer Engineering', year: 1 },
  { name: 'Engineering Mathematics I', code: 'CE104', credits: 3, department: 'Computer Engineering', year: 1 },
  { name: 'Computer Programming for Engineers', code: 'CE105', credits: 3, department: 'Computer Engineering', year: 1 },
  
  // Second Year - Computer Engineering
  { name: 'Microprocessor Systems', code: 'CE201', credits: 4, department: 'Computer Engineering', year: 2 },
  { name: 'Circuit Analysis', code: 'CE202', credits: 3, department: 'Computer Engineering', year: 2 },
  { name: 'Signal Processing', code: 'CE203', credits: 3, department: 'Computer Engineering', year: 2 },
  { name: 'Engineering Mathematics II', code: 'CE204', credits: 3, department: 'Computer Engineering', year: 2 },
  { name: 'Embedded Systems', code: 'CE205', credits: 3, department: 'Computer Engineering', year: 2 },
  
  // Common subjects for all departments
  { name: 'English Communication Skills', code: 'ENG101', credits: 2, department: 'English', year: 1 },
  { name: 'Professional Ethics', code: 'ETH201', credits: 2, department: 'Business', year: 2 },
  { name: 'Calculus I', code: 'MTH101', credits: 3, department: 'Mathematics', year: 1 },
  { name: 'Calculus II', code: 'MTH102', credits: 3, department: 'Mathematics', year: 1 },
  { name: 'Statistics and Probability', code: 'MTH201', credits: 3, department: 'Mathematics', year: 2 },
  { name: 'Linear Algebra', code: 'MTH202', credits: 3, department: 'Mathematics', year: 2 },
  { name: 'Physics I: Mechanics', code: 'PHY101', credits: 3, department: 'Physics', year: 1 },
  { name: 'Physics II: Electricity and Magnetism', code: 'PHY201', credits: 3, department: 'Physics', year: 2 }
];

// Updated groups with clear labeling
const groups = [
  // Computer Science Department
  { name: 'CS-Y1-S1', faculty: 'Science', department: 'Computer Science', year: 1, semester: 1, groupType: 'weekday' },
  { name: 'CS-Y1-S2', faculty: 'Science', department: 'Computer Science', year: 1, semester: 2, groupType: 'weekday' },
  { name: 'CS-Y2-S1', faculty: 'Science', department: 'Computer Science', year: 2, semester: 1, groupType: 'weekday' },
  { name: 'CS-Y2-S2', faculty: 'Science', department: 'Computer Science', year: 2, semester: 2, groupType: 'weekday' },
  
  // Computer Engineering Department
  { name: 'CE-Y1-S1', faculty: 'Engineering', department: 'Computer Engineering', year: 1, semester: 1, groupType: 'weekday' },
  { name: 'CE-Y1-S2', faculty: 'Engineering', department: 'Computer Engineering', year: 1, semester: 2, groupType: 'weekday' },
  { name: 'CE-Y2-S1', faculty: 'Engineering', department: 'Computer Engineering', year: 2, semester: 1, groupType: 'weekday' },
  { name: 'CE-Y2-S2', faculty: 'Engineering', department: 'Computer Engineering', year: 2, semester: 2, groupType: 'weekday' },
  
  // Weekend programs (Part-time)
  { name: 'CS-PT-Y1-S1', faculty: 'Science', department: 'Computer Science', year: 1, semester: 1, groupType: 'weekend' },
  { name: 'CE-PT-Y1-S1', faculty: 'Engineering', department: 'Computer Engineering', year: 1, semester: 1, groupType: 'weekend' }
];

// Sample venue data with more variety
const venues = [
  // Engineering venues - Lecture Halls
  { faculty: 'Engineering', department: 'Computer Engineering', building: 'Engineering Building A', hallName: 'Lecture Hall E101', type: 'lecture', capacity: 120 },
  { faculty: 'Engineering', department: 'Computer Engineering', building: 'Engineering Building A', hallName: 'Lecture Hall E102', type: 'lecture', capacity: 80 },
  { faculty: 'Engineering', department: 'Computer Engineering', building: 'Engineering Building A', hallName: 'Lecture Hall E103', type: 'lecture', capacity: 100 },
  { faculty: 'Engineering', department: 'Computer Engineering', building: 'Engineering Building A', hallName: 'Lecture Hall E104', type: 'lecture', capacity: 90 },
  
  // Engineering venues - Labs
  { faculty: 'Engineering', department: 'Computer Engineering', building: 'Engineering Building B', hallName: 'Computer Lab CL01', type: 'lab', capacity: 30 },
  { faculty: 'Engineering', department: 'Computer Engineering', building: 'Engineering Building B', hallName: 'Computer Lab CL02', type: 'lab', capacity: 30 },
  { faculty: 'Engineering', department: 'Computer Engineering', building: 'Engineering Building B', hallName: 'Electronics Lab EL01', type: 'lab', capacity: 25 },
  { faculty: 'Engineering', department: 'Computer Engineering', building: 'Engineering Building B', hallName: 'Digital Systems Lab DSL01', type: 'lab', capacity: 25 },
  
  // Engineering venues - Tutorial Rooms
  { faculty: 'Engineering', department: 'Computer Engineering', building: 'Engineering Building B', hallName: 'Tutorial Room ET01', type: 'tutorial', capacity: 40 },
  { faculty: 'Engineering', department: 'Computer Engineering', building: 'Engineering Building B', hallName: 'Tutorial Room ET02', type: 'tutorial', capacity: 35 },

  // Science venues - Lecture Halls
  { faculty: 'Science', department: 'Computer Science', building: 'Science Building A', hallName: 'Lecture Hall S101', type: 'lecture', capacity: 100 },
  { faculty: 'Science', department: 'Computer Science', building: 'Science Building A', hallName: 'Lecture Hall S102', type: 'lecture', capacity: 60 },
  { faculty: 'Science', department: 'Computer Science', building: 'Science Building A', hallName: 'Lecture Hall S103', type: 'lecture', capacity: 80 },
  { faculty: 'Science', department: 'Computer Science', building: 'Science Building A', hallName: 'Lecture Hall S104', type: 'lecture', capacity: 70 },
  
  // Science venues - Labs
  { faculty: 'Science', department: 'Computer Science', building: 'Science Building B', hallName: 'Computer Lab SL01', type: 'lab', capacity: 25 },
  { faculty: 'Science', department: 'Computer Science', building: 'Science Building B', hallName: 'Computer Lab SL02', type: 'lab', capacity: 25 },
  { faculty: 'Science', department: 'Computer Science', building: 'Science Building B', hallName: 'Programming Lab PL01', type: 'lab', capacity: 30 },
  { faculty: 'Science', department: 'Computer Science', building: 'Science Building B', hallName: 'Database Lab DL01', type: 'lab', capacity: 20 },
  
  // Science venues - Tutorial Rooms
  { faculty: 'Science', department: 'Computer Science', building: 'Science Building B', hallName: 'Tutorial Room ST01', type: 'tutorial', capacity: 35 },
  { faculty: 'Science', department: 'Computer Science', building: 'Science Building B', hallName: 'Tutorial Room ST02', type: 'tutorial', capacity: 30 },

  // Common venues - Lecture Halls
  { faculty: 'Common', department: 'Common', building: 'Central Building', hallName: 'Main Auditorium', type: 'lecture', capacity: 200 },
  { faculty: 'Common', department: 'Common', building: 'Central Building', hallName: 'Lecture Hall C101', type: 'lecture', capacity: 120 },
  { faculty: 'Common', department: 'Common', building: 'Central Building', hallName: 'Lecture Hall C102', type: 'lecture', capacity: 100 },
  
  // Mathematics Department
  { faculty: 'Science', department: 'Mathematics', building: 'Mathematics Building', hallName: 'Math Lab ML01', type: 'lab', capacity: 30 },
  { faculty: 'Science', department: 'Mathematics', building: 'Mathematics Building', hallName: 'Lecture Hall M101', type: 'lecture', capacity: 80 },
  
  // Physics Department
  { faculty: 'Science', department: 'Physics', building: 'Physics Building', hallName: 'Physics Lab PHL01', type: 'lab', capacity: 25 },
  { faculty: 'Science', department: 'Physics', building: 'Physics Building', hallName: 'Lecture Hall P101', type: 'lecture', capacity: 70 },
  
  // Business venues
  { faculty: 'Business', department: 'Management', building: 'Business Building', hallName: 'Lecture Hall B101', type: 'lecture', capacity: 90 },
  { faculty: 'Business', department: 'Management', building: 'Business Building', hallName: 'Tutorial Room BT01', type: 'tutorial', capacity: 30 },

  // Arts venues
  { faculty: 'Arts', department: 'Languages', building: 'Arts Building', hallName: 'Lecture Hall A101', type: 'lecture', capacity: 70 },
  { faculty: 'Arts', department: 'Languages', building: 'Arts Building', hallName: 'Tutorial Room AT01', type: 'tutorial', capacity: 25 },
];

// Function to assign subjects to lecturers by department
const assignSubjectsToLecturers = (subjects, lecturers) => {
  const lecturersByDept = {};
  
  // Group lecturers by department
  lecturers.forEach(lecturer => {
    if (!lecturersByDept[lecturer.department]) {
      lecturersByDept[lecturer.department] = [];
    }
    lecturersByDept[lecturer.department].push(lecturer);
  });
  
  // Assign subjects to lecturers
  return subjects.map(subject => {
    const departmentLecturers = lecturersByDept[subject.department] || [];
    
    if (departmentLecturers.length === 0) {
      console.warn(`No lecturers found for department: ${subject.department}, subject: ${subject.name}`);
      return subject;
    }
    
    // Randomly select a lecturer from the department
    const randomIndex = Math.floor(Math.random() * departmentLecturers.length);
    const selectedLecturer = departmentLecturers[randomIndex];
    
    return {
      ...subject,
      lecturerName: `${selectedLecturer.firstName} ${selectedLecturer.lastName}`,
    };
  });
};

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
    const lecturerMap = {}; // Map department+name to lecturer ID
    const defaultPassword = await hashPassword('password123');
    
    for (const lecturerData of lecturers) {
      const lecturer = new User({
        firstName: lecturerData.firstName,
        lastName: lecturerData.lastName,
        email: lecturerData.email,
        password: defaultPassword,
        role: ROLES.LECTURER,
        isFirstLogin: true,
        passwordChangeRequired: true,
        defaultPassword: 'password123'
      });
      
      await lecturer.save();
      lecturerIds.push(lecturer._id);
      
      // Store in map for easy lookup
      const key = `${lecturerData.department}|${lecturerData.firstName} ${lecturerData.lastName}`;
      lecturerMap[key] = lecturer._id;
    }
    
    console.log('Created lecturers');

    // Assign subjects to lecturers
    const subjectsWithLecturers = assignSubjectsToLecturers(subjects, lecturers);
    
    // Create subjects and assign lecturers
    const subjectIds = [];
    const subjectsByYearDept = {}; // Organize subjects by year and department
    
    for (const subjectData of subjectsWithLecturers) {
      const key = `${subjectData.department}|${subjectData.lecturerName}`;
      const lecturerId = lecturerMap[key];
      
      if (!lecturerId) {
        console.warn(`Lecturer not found for subject ${subjectData.name}`);
        continue;
      }
      
      const subject = new Subject({
        name: subjectData.name,
        code: subjectData.code,
        credits: subjectData.credits,
        lecturer: lecturerId
      });
      
      await subject.save();
      subjectIds.push(subject._id);
      
      // Organize by year and department for easy assignment to groups
      const yearDeptKey = `${subjectData.year}|${subjectData.department}`;
      if (!subjectsByYearDept[yearDeptKey]) {
        subjectsByYearDept[yearDeptKey] = [];
      }
      subjectsByYearDept[yearDeptKey].push(subject._id);
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