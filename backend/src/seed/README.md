# Seed Data for Academic Scheduler

This directory contains scripts to seed the database with dummy data for development and testing.

## Seed Data Details

The seed script creates:
- 12 lecturers
- 12 subjects (each with an assigned lecturer)
- 6 student groups (with 15-25 students per group)
- 14 venues (lecture halls, tutorial rooms, and labs)

The date used is aligned with May 6, 2025, as requested.

## How to Run the Seed Script

To seed your database with dummy data, follow these steps:

1. Make sure MongoDB is running
2. From the root of the backend directory, run:

```bash
npm run seed
```

## Notes

- The seed script will delete existing lecturers, students, subjects, groups, and venues before creating new ones
- Admin users will not be affected
- The timetable model is not included in the seed data as specified
- All users created have the default password: 'password123'
- Each subject is assigned to one lecturer
- Student groups have random numbers of students (15-25 per group)
- Venues are spread across different faculties and departments

## Sample Data Generated

- **Lecturers**: 12 lecturers with professional names and credentials
- **Subjects**: 12 computer science and related subjects with appropriate course codes
- **Groups**: 6 groups in Computer Engineering and Computer Science departments
  - 4 weekday groups
  - 2 weekend groups
- **Venues**: 14 venues including:
  - 6 lecture halls
  - 4 tutorial rooms
  - 4 computer labs

This data can be modified as needed by editing the arrays in the seedData.js file. 