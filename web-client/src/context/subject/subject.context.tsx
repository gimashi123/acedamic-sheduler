import { ISubject } from '@/data-types/subject.tp.ts';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import api from '@/config/axios.config.ts';

interface SubjectContextProps {
  subjects: ISubject[] | null;
  loading: boolean;
  getSubjects: () => Promise<void>;
}

const SubjectContext = createContext<SubjectContextProps | undefined>(
  undefined,
);

export const SubjectProvider = ({ children }: { children: ReactNode }) => {
  const [subjects, setSubjects] = useState<ISubject[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subject/get/all');
      setLoading(false);

      if (response?.data?.success) {
        setSubjects(response.data.result);
      }
    } catch (e) {
      console.log('Error occurred while fetching subjects', e);
    }
  };

  useEffect(() => {
    getSubjects();
  }, []);

  return (
    <SubjectContext.Provider value={{ subjects, loading, getSubjects }}>
      {children}
    </SubjectContext.Provider>
  );
};

export const useSubject = () => {
  const context = useContext(SubjectContext);
  if (!context) {
    throw new Error('useSubject must be used within a SubjectProvider');
  }
  return context;
};
