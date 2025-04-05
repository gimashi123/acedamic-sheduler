// MongoDB Shell Script to Insert Sample Data
// Run this script with: mongosh mongodb://localhost:27017/academic-scheduler mongodb-sample-data.js
// NOTE: This is a MongoDB shell script (not Node.js), so you don't need to change require/import

// Hash function for passwords (simple implementation for demo purposes)
function hashPassword(password) {
  // In a real app, use bcrypt or similar. This is just for demo.
  return password + '_hashed';
}

// Connect to the database
const dbName = 'academic-scheduler';
const conn = new Mongo();
const db = conn.getDB(dbName);

// Clear existing data
db.subjects.drop();
db.venues.drop();
db.groups.drop();

print('Cleared existing collections');

// Create Lecturers
const lecturerIds = [];
const lecturers = [
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@university.edu',
    department: 'Computer Science'
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@university.edu',
    department: 'Computer Science'
  },
  {
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@university.edu',
    department: 'Mathematics'
  },
  {
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@university.edu',
    department: 'Computer Engineering'
  },
  {
    firstName: 'Robert',
    lastName: 'Wilson',
    email: 'robert.wilson@university.edu',
    department: 'Computer Engineering'
  }
];

lecturers.forEach(lecturer => {
  const lecturerId = ObjectId();
  lecturerIds.push({ id: lecturerId, department: lecturer.department });
  
  db.users.insertOne({
    _id: lecturerId,
    firstName: lecturer.firstName,
    lastName: lecturer.lastName,
    email: lecturer.email,
    password: hashPassword('password123'),
    role: 'Lecturer',
    profilePicture: 'default-profile.jpg',
    refreshToken: '',
    isFirstLogin: true,
    passwordChangeRequired: true,
    defaultPassword: 'password123',
    createdAt: new Date(),
    updatedAt: new Date()
  });
});

print(`Created ${lecturers.length} Lecturers`);

// Create Students
const studentIds = [];
for (let i = 1; i <= 60; i++) {
  const studentId = ObjectId();
  studentIds.push(studentId);
  
  db.users.insertOne({
    _id: studentId,
    firstName: `Student${i}`,
    lastName: `LastName${i}`,
    email: `student${i}@university.edu`,
    password: hashPassword('password123'),
    role: 'Student',
    profilePicture: 'default-profile.jpg',
    refreshToken: '',
    isFirstLogin: true,
    passwordChangeRequired: true,
    defaultPassword: 'password123',
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

print(`Created ${studentIds.length} Students`);

// Create Venues
const venueIds = [];
const venues = [
  {
    faculty: 'Science',
    department: 'Computer Science',
    building: 'Science Building',
    hallName: 'Room 101',
    type: 'lecture',
    capacity: 50
  },
  {
    faculty: 'Science',
    department: 'Computer Science',
    building: 'Science Building',
    hallName: 'Room 102',
    type: 'tutorial',
    capacity: 30
  },
  {
    faculty: 'Science',
    department: 'Computer Science',
    building: 'Computing Center',
    hallName: 'Lab 1',
    type: 'lab',
    capacity: 25
  },
  {
    faculty: 'Engineering',
    department: 'Computer Engineering',
    building: 'Engineering Building',
    hallName: 'Room 201',
    type: 'lecture',
    capacity: 60
  },
  {
    faculty: 'Engineering',
    department: 'Computer Engineering',
    building: 'Engineering Building',
    hallName: 'Room 202',
    type: 'tutorial',
    capacity: 40
  },
  {
    faculty: 'Engineering',
    department: 'Computer Engineering',
    building: 'Engineering Building',
    hallName: 'Lab 2',
    type: 'lab',
    capacity: 30
  }
];

venues.forEach(venue => {
  const venueId = ObjectId();
  venueIds.push({ id: venueId, department: venue.department });
  
  db.venues.insertOne({
    _id: venueId,
    faculty: venue.faculty,
    department: venue.department,
    building: venue.building,
    hallName: venue.hallName,
    type: venue.type,
    capacity: venue.capacity,
    bookedSlots: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
});

print(`Created ${venues.length} Venues`);

// Create Groups
const groupIds = [];
const csStudents = studentIds.slice(0, 30);
const ceStudents = studentIds.slice(30, 60);

const groups = [
  {
    name: 'CS-2023-1A',
    faculty: 'Science',
    department: 'Computer Science',
    year: 2,
    semester: 1,
    groupType: 'weekday',
    students: csStudents.slice(0, 15)
  },
  {
    name: 'CS-2023-1B',
    faculty: 'Science',
    department: 'Computer Science',
    year: 2,
    semester: 1,
    groupType: 'weekday',
    students: csStudents.slice(15, 30)
  },
  {
    name: 'CE-2023-1A',
    faculty: 'Engineering',
    department: 'Computer Engineering',
    year: 2,
    semester: 1,
    groupType: 'weekday',
    students: ceStudents.slice(0, 15)
  },
  {
    name: 'CE-2023-1B',
    faculty: 'Engineering',
    department: 'Computer Engineering',
    year: 2,
    semester: 1,
    groupType: 'weekend',
    students: ceStudents.slice(15, 30)
  }
];

groups.forEach(group => {
  const groupId = ObjectId();
  groupIds.push({ id: groupId, department: group.department });
  
  db.groups.insertOne({
    _id: groupId,
    name: group.name,
    faculty: group.faculty,
    department: group.department,
    year: group.year,
    semester: group.semester,
    groupType: group.groupType,
    students: group.students,
    createdAt: new Date(),
    updatedAt: new Date()
  });
});

print(`Created ${groups.length} Groups`);

// Create Subjects
const subjectIds = [];
const csLecturers = lecturerIds.filter(l => l.department === 'Computer Science');
const ceLecturers = lecturerIds.filter(l => l.department === 'Computer Engineering');
const mathLecturers = lecturerIds.filter(l => l.department === 'Mathematics');

const subjects = [
  {
    name: 'Introduction to Programming',
    code: 'CS101',
    description: 'Basic programming concepts using Python',
    lecturer: csLecturers[0].id,
    credits: 3,
    department: 'Computer Science',
    status: 'active'
  },
  {
    name: 'Data Structures and Algorithms',
    code: 'CS201',
    description: 'Study of data structures and algorithm analysis',
    lecturer: csLecturers[1].id,
    credits: 4,
    department: 'Computer Science',
    status: 'active'
  },
  {
    name: 'Discrete Mathematics',
    code: 'MATH204',
    description: 'Mathematics for computer science',
    lecturer: mathLecturers[0].id,
    credits: 3,
    department: 'Mathematics',
    status: 'active'
  },
  {
    name: 'Computer Architecture',
    code: 'CE101',
    description: 'Introduction to computer hardware and architecture',
    lecturer: ceLecturers[0].id,
    credits: 3,
    department: 'Computer Engineering',
    status: 'active'
  },
  {
    name: 'Digital Systems Design',
    code: 'CE201',
    description: 'Design of digital systems and circuits',
    lecturer: ceLecturers[1].id,
    credits: 4,
    department: 'Computer Engineering',
    status: 'active'
  }
];

subjects.forEach(subject => {
  const subjectId = ObjectId();
  subjectIds.push({ id: subjectId, department: subject.department });
  
  db.subjects.insertOne({
    _id: subjectId,
    name: subject.name,
    code: subject.code,
    description: subject.description,
    lecturer: subject.lecturer,
    credits: subject.credits,
    department: subject.department,
    status: subject.status,
    createdAt: new Date(),
    updatedAt: new Date()
  });
});

print(`Created ${subjects.length} Subjects`);

print('\nSample data insertion completed!');
print('\nNote: Admin account and timetables should be created separately through the application.'); 