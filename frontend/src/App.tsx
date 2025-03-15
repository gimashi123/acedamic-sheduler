import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { RequestProvider } from './context/RequestContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RequestStatus from './pages/RequestStatus';
import Dashboard from './pages/Dashboard';
import ManageRequests from './pages/ManageRequests';
import Settings from './pages/Settings';
import Unauthorized from './pages/Unauthorized';
import { Role } from './types';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <RequestProvider>
          <Router>
            <Navbar />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/request-status" element={<RequestStatus />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>

              {/* Admin routes */}
              <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
                <Route path="/manage-requests" element={<ManageRequests />} />
                <Route path="/settings" element={<Settings />} />
                {/* Add other admin-specific routes here */}
              </Route>

              {/* Lecturer routes */}
              <Route element={<ProtectedRoute allowedRoles={[Role.LECTURER]} />}>
                {/* Add lecturer-specific routes here */}
              </Route>

              {/* Student routes */}
              <Route element={<ProtectedRoute allowedRoles={[Role.STUDENT]} />}>
                {/* Add student-specific routes here */}
              </Route>
            </Routes>
          </Router>
        </RequestProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
