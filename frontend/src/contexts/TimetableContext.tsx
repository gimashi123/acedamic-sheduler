import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { ITimetable } from '../types/timetable';
import { getTimetables } from '../features/timetables/timetableService';
import { 
  fetchAllSubjects, 
  Subject,
  ScheduleEntry,
  fetchTimetableContent,
  TimetableContent
} from '../features/timetables/services/timetableContentService';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

interface TimetableContextType {
  timetables: ITimetable[];
  subjects: Subject[];
  loading: boolean;
  contentLoading: boolean;
  error: string | null;
  refetchTimetables: () => Promise<void>;
  refetchSubjects: () => Promise<void>;
  currentTimetableContent: TimetableContent | null;
  fetchTimetableContentById: (timetableId: string) => Promise<TimetableContent | null>;
}

const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

interface TimetableProviderProps {
  children: ReactNode;
}

export const TimetableProvider: React.FC<TimetableProviderProps> = ({ children }) => {
  const [timetables, setTimetables] = useState<ITimetable[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [contentLoading, setContentLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTimetableContent, setCurrentTimetableContent] = useState<TimetableContent | null>(null);
  const { isAuthenticated } = useAuthStore();
  
  // Add retry tracking
  const subjectsRetryCount = useRef(0);
  const fetchInProgress = useRef(false);

  const fetchTimetables = async () => {
    // Only fetch timetables if user is authenticated
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await getTimetables();
      setTimetables(data);
    } catch (err) {
      console.error('Error fetching timetables:', err);
      setError('Failed to fetch timetables. Please try again later.');
      
      // Only show toast when on a relevant page (not login)
      if (window.location.pathname !== '/login') {
        toast.error('Failed to load timetables');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch all available subjects
  const fetchSubjects = async () => {
    if (!isAuthenticated || fetchInProgress.current) {
      return;
    }
    
    // Prevent excessive retries
    if (subjectsRetryCount.current >= 3) {
      console.log('Maximum retry attempts reached for subjects fetch');
      return;
    }

    try {
      fetchInProgress.current = true;
      const subjectsData = await fetchAllSubjects();
      setSubjects(subjectsData);
      
      // Reset retry count on success
      subjectsRetryCount.current = 0;
    } catch (err) {
      console.error('Error fetching subjects:', err);
      subjectsRetryCount.current += 1;
      
      if (subjectsRetryCount.current === 3) {
        toast.error('Unable to load subjects. Please check your connection and try again later.');
      }
    } finally {
      fetchInProgress.current = false;
    }
  };

  // Fetch content for a specific timetable
  const fetchTimetableContentById = async (timetableId: string): Promise<TimetableContent | null> => {
    try {
      setContentLoading(true);
      const content = await fetchTimetableContent(timetableId);
      setCurrentTimetableContent(content);
      return content;
    } catch (err) {
      console.error('Error fetching timetable content:', err);
      toast.error('Failed to load timetable content');
      return null;
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data when authenticated
    if (isAuthenticated) {
      fetchTimetables();
      fetchSubjects();
    }
  }, [isAuthenticated]);

  const refetchTimetables = async () => {
    await fetchTimetables();
  };
  
  const refetchSubjects = async () => {
    await fetchSubjects();
  };

  return (
    <TimetableContext.Provider
      value={{
        timetables,
        subjects,
        loading,
        contentLoading,
        error,
        refetchTimetables,
        refetchSubjects,
        currentTimetableContent,
        fetchTimetableContentById
      }}
    >
      {children}
    </TimetableContext.Provider>
  );
};

export const useTimetable = (): TimetableContextType => {
  const context = useContext(TimetableContext);
  if (context === undefined) {
    throw new Error('useTimetable must be used within a TimetableProvider');
  }
  return context;
};