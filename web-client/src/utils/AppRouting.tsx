import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from '../pages/Home.tsx';

import AdminDashboardPage from '@/pages/dashboard/AdminDashboard.tsx';
import { TimeTablePage } from '@/pages/timetable/TimeTablePage.tsx';

import { AddTimeTablePage } from '@/pages/timetable/AddTimeTablePage.tsx';
import { ViewTimeTablePage } from '@/pages/timetable/ViewTimeTablePage.tsx';
import { AddDetails } from '@/pages/timetable/AddDetails.tsx';
import GroupManagement from '@/pages/group/GroupManagement.tsx';
import VenueManagement from '@/pages/venue/VenueManagement.tsx';

import LoginPage from '@/pages/auth/login/LoginPage.tsx';
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/auth/auth-context.tsx';
import { SubjectDashboard } from '@/pages/subject/SubjectDashboard..tsx';
import { SubjectAdd } from '@/pages/subject/SubjectAdd.tsx';
import { SubjectProvider } from '@/context/subject/subject.context.tsx';
import { TimetableProvider } from '@/context/timetable/timetable-context.tsx';
import ProfilePage from '@/pages/profile/ProfilePage.tsx';
import UsersPage from '@/pages/users/Users.tsx';
import RegisterRequestForm from '@/pages/auth/RegisterRequestForm.tsx';
import Requests from '@/pages/requests/Requests.tsx';
import ChangePassword from '@/pages/auth/ChangePassword.tsx';

const AppRoutingContent = ({ children }: { children: ReactNode }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TimetableProvider>
          <SubjectProvider>{children}</SubjectProvider>
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
        <Route path={'/profile'} element={<ProfilePage />} />
        <Route path={'/login'} element={<LoginPage />} />
        <Route path={'/signup'} element={<RegisterRequestForm />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path={'/admin/dashboard/*'} element={<AdminDashboardPage />}>
          <Route path="groups" element={<GroupManagement />} />

          <Route path="requests" element={<Requests />} />
          <Route path={'timetable'}>
            <Route path={''} element={<TimeTablePage />} />
            <Route path={'add-details'} element={<AddDetails />} />
            <Route path={'add'} element={<AddTimeTablePage />} />
            <Route path={'view'} element={<ViewTimeTablePage />} />
          </Route>
          <Route path={'subject'}>
            <Route path={''} element={<SubjectDashboard />} />
            <Route path={'add'} element={<SubjectAdd />} />
          </Route>
          <Route path="venues" element={<VenueManagement />} />
          <Route path={'user'} element={<UsersPage />} />
        </Route>
      </Routes>
    </AppRoutingContent>
  );
};
