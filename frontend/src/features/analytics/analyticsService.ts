import api from '../../utils/api';
import axios from 'axios';
import { userService } from '../users/userService';
import { getSubjects, getLecturerSubjects } from '../subjects/subjectService';
import { getAllGroups } from '../../utils/api/groupApi';
import { User, Subject } from '../../types';

export interface AnalyticsData {
  totalStudents: number;
  totalLecturers: number;
  totalSubjects: number;
  totalGroups: number;
  subjectsWithLecturers: number;
  subjectsWithoutLecturers: number;
  averageStudentsPerGroup: number;
  groupsByFaculty: Record<string, number>;
  groupsByType: Record<string, number>;
  lectureLoads: {
    lecturerName: string;
    lecturerId: string;
    subjectCount: number;
    credits: number;
  }[];
  facultyDistribution: {
    faculty: string;
    students: number;
    groups: number;
    subjects: number;
  }[];
  groupSizes: {
    groupId: string;
    groupName: string;
    size: number;
    faculty: string;
  }[];
}

// Get comprehensive analytics data
export const getAnalyticsData = async (): Promise<AnalyticsData> => {
  try {
    // Fetch all the data we need for analytics
    const students = await userService.getUsersByRole('Student');
    const lecturers = await userService.getUsersByRole('Lecturer');
    const subjects = await getSubjects();
    const groups = await getAllGroups();

    // Calculate basic metrics
    const totalStudents = students.length;
    const totalLecturers = lecturers.length;
    const totalSubjects = subjects.length;
    const totalGroups = groups.length;

    // Calculate subjects with and without lecturers
    const subjectsWithLecturers = subjects.filter(subject => subject.lecturer).length;
    const subjectsWithoutLecturers = subjects.filter(subject => !subject.lecturer).length;

    // Calculate average students per group
    const totalStudentsInGroups = groups.reduce((sum, group) => sum + group.students.length, 0);
    const averageStudentsPerGroup = totalGroups > 0 ? totalStudentsInGroups / totalGroups : 0;

    // Count groups by faculty
    const groupsByFaculty: Record<string, number> = {};
    groups.forEach(group => {
      if (!groupsByFaculty[group.faculty]) {
        groupsByFaculty[group.faculty] = 0;
      }
      groupsByFaculty[group.faculty]++;
    });

    // Count groups by type
    const groupsByType: Record<string, number> = {
      weekday: 0,
      weekend: 0,
    };
    groups.forEach(group => {
      groupsByType[group.groupType]++;
    });

    // Calculate lecturer loads
    const lectureLoads = await Promise.all(
      lecturers.map(async (lecturer) => {
        const lecturerSubjects = await getLecturerSubjects(lecturer._id);
        const credits = lecturerSubjects.reduce((sum, subject) => sum + subject.credits, 0);
        return {
          lecturerName: `${lecturer.firstName} ${lecturer.lastName}`,
          lecturerId: lecturer._id,
          subjectCount: lecturerSubjects.length,
          credits,
        };
      })
    );

    // Calculate faculty distribution
    const faculties = [...new Set(groups.map(group => group.faculty))];
    const facultyDistribution = faculties.map(faculty => {
      const facultyGroups = groups.filter(group => group.faculty === faculty);
      const facultyGroupIds = facultyGroups.map(group => group._id);
      
      // Count students in faculty groups
      const studentsInFaculty = facultyGroups.reduce(
        (count, group) => count + group.students.length, 
        0
      );
      
      // Count subjects
      const subjectsInFaculty = subjects.filter(subject => {
        // For subjects, we'll just count by faculty name pattern matching since we don't have direct faculty assignment
        return subject.name.includes(faculty) || subject.code.includes(faculty);
      }).length;
      
      return {
        faculty,
        students: studentsInFaculty,
        groups: facultyGroups.length,
        subjects: subjectsInFaculty,
      };
    });

    // Calculate group sizes for scatter plot
    const groupSizes = groups.map(group => ({
      groupId: group._id,
      groupName: group.name,
      size: group.students.length,
      faculty: group.faculty,
    }));

    return {
      totalStudents,
      totalLecturers,
      totalSubjects,
      totalGroups,
      subjectsWithLecturers,
      subjectsWithoutLecturers,
      averageStudentsPerGroup,
      groupsByFaculty,
      groupsByType,
      lectureLoads,
      facultyDistribution,
      groupSizes,
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
}; 