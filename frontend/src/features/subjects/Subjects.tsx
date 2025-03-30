import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Container
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { getAllSubjects, Subject } from '../../utils/api/subjectApi';
import SubjectList from './SubjectList';
import SubjectForm from './SubjectForm.tsx';
import useAuthStore from '../../store/authStore';

const Subjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await getAllSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (subject: Subject | null = null) => {
    setCurrentSubject(subject);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setCurrentSubject(null);
    setOpenForm(false);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    fetchSubjects();
  };

  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" align="center">
            You don't have permission to access this page
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Subject Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Add Subject
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <SubjectList
            subjects={subjects}
            onEdit={handleOpenForm}
            onRefresh={fetchSubjects}
          />
        )}
      </Paper>

      <SubjectForm
        open={openForm}
        onClose={handleCloseForm}
        subject={currentSubject}
        onSuccess={handleFormSuccess}
      />
    </Container>
  );
};

export default Subjects; 