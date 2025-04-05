// Sample data generation script for Academic Scheduler
// This version doesn't create admin accounts

// Import required modules
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
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

// Define schema for User model
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['Lecturer', 'Student', 'Admin'],
      required: true,
    },
    department: {
      type: String,
      default: '',
    },
    profilePicture: {
      type: String,
      default: 'default-profile.jpg'
    },
    refreshToken: {
      type: String,
      default: '',
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
    passwordChangeRequired: {
      type: Boolean,
      default: true,
    },
    defaultPassword: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

// Define schema for Subject model
const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    credits: {
      type: Number,
      default: 3,
    },
    department: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    }
  },
  {
    timestamps: true,
  }
);

// Define schema for Venue model
const venueSchema = new mongoose.Schema({
    faculty: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    building: {
        type: String,
        required: true
    },
    hallName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['lecture', 'tutorial', 'lab'],
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
    },
    bookedSlots: [
        {
            date: {
                type: Date,
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
        }
    ],
}, {timestamps: true});

// Define schema for Group model
const FACULTIES = [
  'Engineering', 
  'Science', 
  'Business', 
  'Arts', 
  'Medicine', 
  'Law',
  'Education'
];

const DEPARTMENTS = {
  'Engineering': ['Computer Engineering', 'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering'],
  'Science': ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology'],
  'Business': ['Accounting', 'Management', 'Marketing', 'Finance', 'Economics'],
  'Arts': ['English', 'History', 'Philosophy', 'Languages', 'Fine Arts'],
  'Medicine': ['General Medicine', 'Surgery', 'Pediatrics', 'Psychiatry'],
  'Law': ['Criminal Law', 'Civil Law', 'International Law', 'Corporate Law'],
  'Education': ['Early Childhood', 'Elementary Education', 'Secondary Education', 'Special Education']
};

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    faculty: {
        type: String,
        required: true,
        enum: FACULTIES,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 2
    },
    groupType: {
        type: String,
        required: true,
        enum: ['weekday', 'weekend'],
        default: 'weekday'
    },
    students: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        default: []
    },
}, { timestamps: true });

// Define models
const User = mongoose.model('User', userSchema);
const Subject = mongoose.model('Subject', subjectSchema);
const Venue = mongoose.model('Venue', venueSchema);
const Group = mongoose.model('Group', groupSchema);

// Clear existing data
async function clearData() {
  try {
    // We don't delete admin accounts here
    await User.deleteMany({ role: { $in: ['Lecturer', 'Student'] } });
    await Subject.deleteMany({});
    await Venue.deleteMany({});
    await Group.deleteMany({});
    console.log('Existing data cleared successfully (admin accounts preserved)');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

// Generate sample data
async function generateSampleData() {
  try {
    // First, clear existing data
    await clearData();

    // Hash password for users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create lecturers
    const lecturers = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@university.edu',
        password: hashedPassword,
        role: 'Lecturer',
        department: 'Computer Science'
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@university.edu',
        password: hashedPassword,
        role: 'Lecturer',
        department: 'Computer Science'
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@university.edu',
        password: hashedPassword,
        role: 'Lecturer',
        department: 'Mathematics'
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@university.edu',
        password: hashedPassword,
        role: 'Lecturer',
        department: 'Computer Engineering'
      },
      {
        firstName: 'Robert',
        lastName: 'Wilson',
        email: 'robert.wilson@university.edu',
        password: hashedPassword,
        role: 'Lecturer',
        department: 'Computer Engineering'
      }
    ];

    const createdLecturers = await User.insertMany(lecturers);
    console.log(`${createdLecturers.length} lecturers created`);

    // Create students
    const students = [];
    for (let i = 1; i <= 60; i++) {
      students.push({
        firstName: `Student${i}`,
        lastName: `LastName${i}`,
        email: `student${i}@university.edu`,
        password: hashedPassword,
        role: 'Student'
      });
    }

    const createdStudents = await User.insertMany(students);
    console.log(`${createdStudents.length} students created`);

    // Create venues
    const venues = [
      {
        faculty: 'Science',
        department: 'Computer Science',
        building: 'Science Building',
        hallName: 'Room 101',
        type: 'lecture',
        capacity: 50,
        bookedSlots: []
      },
      {
        faculty: 'Science',
        department: 'Computer Science',
        building: 'Science Building',
        hallName: 'Room 102',
        type: 'tutorial',
        capacity: 30,
        bookedSlots: []
      },
      {
        faculty: 'Science',
        department: 'Computer Science',
        building: 'Computing Center',
        hallName: 'Lab 1',
        type: 'lab',
        capacity: 25,
        bookedSlots: []
      },
      {
        faculty: 'Engineering',
        department: 'Computer Engineering',
        building: 'Engineering Building',
        hallName: 'Room 201',
        type: 'lecture',
        capacity: 60,
        bookedSlots: []
      },
      {
        faculty: 'Engineering',
        department: 'Computer Engineering',
        building: 'Engineering Building',
        hallName: 'Room 202',
        type: 'tutorial',
        capacity: 40,
        bookedSlots: []
      },
      {
        faculty: 'Engineering',
        department: 'Computer Engineering',
        building: 'Engineering Building',
        hallName: 'Lab 2',
        type: 'lab',
        capacity: 30,
        bookedSlots: []
      }
    ];

    const createdVenues = await Venue.insertMany(venues);
    console.log(`${createdVenues.length} venues created`);

    // Split computer science students and computer engineering students
    const csStudents = createdStudents.slice(0, 30);
    const ceStudents = createdStudents.slice(30, 60);

    // Create groups
    const groups = [
      {
        name: 'CS-2023-1A',
        faculty: 'Science',
        department: 'Computer Science',
        year: 2,
        semester: 1,
        groupType: 'weekday',
        students: csStudents.slice(0, 15).map(student => student._id)
      },
      {
        name: 'CS-2023-1B',
        faculty: 'Science',
        department: 'Computer Science',
        year: 2,
        semester: 1,
        groupType: 'weekday',
        students: csStudents.slice(15, 30).map(student => student._id)
      },
      {
        name: 'CE-2023-1A',
        faculty: 'Engineering',
        department: 'Computer Engineering',
        year: 2,
        semester: 1,
        groupType: 'weekday',
        students: ceStudents.slice(0, 15).map(student => student._id)
      },
      {
        name: 'CE-2023-1B',
        faculty: 'Engineering',
        department: 'Computer Engineering',
        year: 2,
        semester: 1,
        groupType: 'weekend',
        students: ceStudents.slice(15, 30).map(student => student._id)
      }
    ];

    const createdGroups = await Group.insertMany(groups);
    console.log(`${createdGroups.length} groups created`);

    // Create subjects
    // First, verify that we have lecturers for each department
    const csLecturers = createdLecturers.filter(l => l.department === 'Computer Science');
    const ceLecturers = createdLecturers.filter(l => l.department === 'Computer Engineering');
    const mathLecturers = createdLecturers.filter(l => l.department === 'Mathematics');
    
    console.log(`Found ${csLecturers.length} CS lecturers, ${ceLecturers.length} CE lecturers, and ${mathLecturers.length} Math lecturers`);
    
    // In case we don't have enough lecturers, use a fallback approach
    const getValidLecturer = (departmentLecturers, index) => {
      if (departmentLecturers.length > 0) {
        return departmentLecturers[index % departmentLecturers.length]._id;
      }
      // Fallback to any lecturer if none for this department
      return createdLecturers[0]._id;
    };

    const subjects = [
      {
        name: 'Introduction to Programming',
        code: 'CS101',
        description: 'Basic programming concepts using Python',
        lecturer: getValidLecturer(csLecturers, 0),
        credits: 3,
        department: 'Computer Science',
        status: 'active'
      },
      {
        name: 'Data Structures and Algorithms',
        code: 'CS201',
        description: 'Study of data structures and algorithm analysis',
        lecturer: getValidLecturer(csLecturers, 1),
        credits: 4,
        department: 'Computer Science',
        status: 'active'
      },
      {
        name: 'Discrete Mathematics',
        code: 'MATH204',
        description: 'Mathematics for computer science',
        lecturer: getValidLecturer(mathLecturers, 0),
        credits: 3,
        department: 'Mathematics',
        status: 'active'
      },
      {
        name: 'Computer Architecture',
        code: 'CE101',
        description: 'Introduction to computer hardware and architecture',
        lecturer: getValidLecturer(ceLecturers, 0),
        credits: 3,
        department: 'Computer Engineering',
        status: 'active'
      },
      {
        name: 'Digital Systems Design',
        code: 'CE201',
        description: 'Design of digital systems and circuits',
        lecturer: getValidLecturer(ceLecturers, 1),
        credits: 4,
        department: 'Computer Engineering',
        status: 'active'
      }
    ];

    const createdSubjects = await Subject.insertMany(subjects);
    console.log(`${createdSubjects.length} subjects created`);

    console.log('Sample data generated successfully!');
    console.log('\nNote: Admin accounts and timetables should be created separately through the application.');
    console.log('\nUser Credentials for Testing:');
    console.log('Lecturer: john.smith@university.edu / password123');
    console.log('Student: student1@university.edu / password123');
    
  } catch (error) {
    console.error('Error generating sample data:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the data generation
generateSampleData(); 