# Academic Scheduler Sample Data

This folder contains scripts to help you generate sample data for your Academic Scheduler application. These scripts will create sample users (lecturers, students), subjects, venues, and groups. Admin accounts and timetables are not created by default.

## Prerequisites

Before running these scripts, make sure your backend and frontend applications are working correctly. You should have MongoDB installed and properly configured in your `.env` file.

## Important Note About ES Modules

These scripts use ES modules (import/export) syntax instead of CommonJS (require) because your backend project is configured with `"type": "module"` in package.json. If you encounter any issues related to module syntax, make sure you're using Node.js version 14 or later.

## Scripts Overview

1. `sample-data.js` - Generates the basic sample data (lecturers, students, subjects, venues, groups)
2. `generate-timetable.js` - Generates timetables for all groups using the sample data (optional)
3. `mongodb-sample-data.js` - Direct MongoDB shell script (alternative method)
4. `setup-academic-scheduler.js` - Runs the sample data script in sequence

## How to Use

### Step 1: Install Dependencies

If you haven't already, install the required dependencies:

```bash
cd backend
npm install
```

### Step 2: Generate Sample Data

Run the sample data generation script to create the basic entities:

```bash
cd backend/scripts
node setup-academic-scheduler.js
```

This will create:
- 5 lecturers
- 60 students
- 6 venues
- 4 student groups
- 5 subjects

**Note:** Admin accounts are NOT created by this script. You should create them through the application.

### Step 3 (Optional): Generate Timetables

If you wish to generate timetables for the groups:

```bash
cd backend/scripts
node generate-timetable.js
```

This will create timetables for each group for the current month and year.

### Alternative: Using MongoDB Shell Script

If you prefer to directly insert data via MongoDB shell:

```bash
cd backend/scripts
mongosh mongodb://localhost:27017/academic-scheduler mongodb-sample-data.js
```

Note that the MongoDB shell script is different from the Node.js scripts and runs directly in the mongosh environment.

## Sample Data Details

### Users

#### Lecturers
- John Smith (Computer Science)
  - Email: john.smith@university.edu
  - Password: password123
- Sarah Johnson (Computer Science)
  - Email: sarah.johnson@university.edu
  - Password: password123
- Michael Brown (Mathematics)
  - Email: michael.brown@university.edu
  - Password: password123
- Emily Davis (Computer Engineering)
  - Email: emily.davis@university.edu
  - Password: password123
- Robert Wilson (Computer Engineering)
  - Email: robert.wilson@university.edu
  - Password: password123

#### Students
- 60 students with emails: student1@university.edu through student60@university.edu
- All students have the password: password123

### Groups

- CS-2023-1A (Computer Science, Year 2, Semester 1, Weekday)
- CS-2023-1B (Computer Science, Year 2, Semester 1, Weekday)
- CE-2023-1A (Computer Engineering, Year 2, Semester 1, Weekday)
- CE-2023-1B (Computer Engineering, Year 2, Semester 1, Weekend)

### Subjects

- CS101: Introduction to Programming (Computer Science)
- CS201: Data Structures and Algorithms (Computer Science)
- MATH204: Discrete Mathematics (Mathematics)
- CE101: Computer Architecture (Computer Engineering)
- CE201: Digital Systems Design (Computer Engineering)

### Venues

- Science Building - Room 101 (lecture hall)
- Science Building - Room 102 (tutorial room)
- Computing Center - Lab 1 (computer lab)
- Engineering Building - Room 201 (lecture hall)
- Engineering Building - Room 202 (tutorial room)
- Engineering Building - Lab 2 (computer lab)

## How to Access the Application

After running the scripts, you can access the application:

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend server:
```bash
cd frontend
npm run dev
```

3. Open your browser and go to http://localhost:3000
4. Create an admin account through the application or signup process

## Creating an Admin Account

Since the scripts don't create an admin account by default, you'll need to create one through:

1. The user registration/signup process in your application
2. Using the API directly to create a user with admin role
3. Creating it manually in the MongoDB database

## Creating Timetables in Admin Dashboard

Once you have an admin account:

1. Log in as an admin
2. Navigate to the "Timetable Management" section
3. Click on "Generate Timetable"
4. Select a group, month, and year
5. Submit the form to generate the timetable
6. The system will automatically:
   - Find all subjects for the selected group's department
   - Find suitable venues
   - Assign time slots based on availability
   - Create a draft timetable

## Modifying Sample Data

You can modify the sample data scripts to create different sets of data that better match your specific requirements. The scripts are well-commented and should be easy to customize.

## Troubleshooting

If you encounter any issues:

1. Make sure MongoDB is running
2. Check that your .env file has the correct MONGODB_URI
3. Ensure all dependencies are installed
4. Check for any errors in the console output
5. If you get module errors, make sure you're using ES modules (import/export) syntax

If the scripts run successfully, you should see confirmation messages in the console. 