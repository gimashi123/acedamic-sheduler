import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from '../pages/Home.tsx';

import AdminDashboardPage from "@/pages/dashboard/AdminDashboard.tsx";
import {TimeTablePage} from "@/pages/timetable/TimeTablePage.tsx";
import {UserPage} from "@/pages/user/UserPage.tsx";
import {AddTimeTablePage} from "@/pages/timetable/AddTimeTablePage.tsx";
import {ViewTimeTablePage} from "@/pages/timetable/ViewTimeTablePage.tsx";
import {AddDetails} from "@/pages/timetable/AddDetails.tsx";
import GroupManagement from "@/pages/group/GroupManagement.tsx";
import VenueManagement from "@/pages/venue/VenueManagement.tsx";

import StudentManagement from "@/pages/student/StudentManagement.tsx";
import StudentDetails from "@/pages/student/StudentDetails.tsx";
import StudentAdd from "@/pages/student/StudentAdd";
import StudentEdit from "@/pages/student/StudentEdit";

import SingUp from '@/pages/useraccess/SingUp.tsx';
import LoginPage from '@/pages/auth/login/LoginPage.tsx';
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/auth/auth-context.tsx';
import { SubjectDashboard } from '@/pages/subject/SubjectDashboard..tsx';
import { SubjectAdd } from '@/pages/subject/SubjectAdd.tsx';
import { SubjectProvider } from '@/context/subject/subject.context.tsx';
import {TimetableProvider} from "@/context/timetable/timetable-context.tsx";



const AppRoutingContent = ({ children }: { children: ReactNode }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TimetableProvider>
            <SubjectProvider>
          {children}
                </SubjectProvider>
        </TimetableProvider>
        </AuthProvider>
    </BrowserRouter>
  );
};

export const AppRouting = () => {
  return (
    <AppRoutingContent>
      <Routes>
        <Route path={'/'} element={<HomePage />} />
        
        
        <Route path={'/login'} element={<LoginPage />} />
        <Route path={'/signup'} element={<SingUp />} />
        <Route path={'/admin/dashboard/*'} element={<AdminDashboardPage />}>
          <Route path='groups' element={<GroupManagement/>}/> 
          <Route path='venues' element={<VenueManagement/>}/>
          <Route path={'timetable'}>
            <Route path={''} element={<TimeTablePage />} />
            <Route path={'add-details'} element={<AddDetails />} />
            <Route path={'add'} element={<AddTimeTablePage />} />
            <Route path={'view'} element={<ViewTimeTablePage />} />
          </Route>
          <Route path={"student"}>
            <Route path={""} element={<StudentManagement />} />
            <Route path={"add"} element={<StudentAdd />} />
            <Route path={"edit/:id"} element={<StudentEdit />} />
            <Route path={":id"} element={<StudentDetails />} />
          </Route>
          <Route path={'subject'}>
            <Route path={''} element={<SubjectDashboard />} />
            <Route path={'add'} element={<SubjectAdd />} />
          </Route>
          <Route path={'user'} element={<UserPage />} />
        </Route>
      </Routes>
    </AppRoutingContent>
  );
};
