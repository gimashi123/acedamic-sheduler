import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ITimetable } from '../types/timetable';
import { getTimetables } from '../features/timetables/timetableService';
import { toast } from 'react-hot-toast';

interface TimetableContextType {
  timetables: ITimetable[];
  loading: boolean;
  error: string | null;
  refetchTimetables: () => Promise<void>;
}

const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

interface TimetableProviderProps {
  children: ReactNode;
}

export const TimetableProvider: React.FC<TimetableProviderProps> = ({ children }) => {
  const [timetables, setTimetables] = useState<ITimetable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTimetables();
      setTimetables(data);
    } catch (err) {
      console.error('Error fetching timetables:', err);
      setError('Failed to fetch timetables. Please try again later.');
      toast.error('Failed to load timetables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetables();
  }, []);

  const refetchTimetables = async () => {
    await fetchTimetables();
  };

  return (
    <TimetableContext.Provider
      value={{
        timetables,
        loading,
        error,
        refetchTimetables
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