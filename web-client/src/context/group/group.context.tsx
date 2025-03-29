import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import api from '@/config/axios.config.ts';
import { toast } from 'sonner';

// Define the group interface
interface IGroup {
  _id: string;
  name: string;
  faculty: string;
  department: string;
  year: number;
  semester: number;
  groupType: string;
  students: string[];
}

interface GroupContextProps {
  groups: IGroup[] | null;
  loading: boolean;
  getGroups: () => Promise<void>;
}

const GroupContext = createContext<GroupContextProps | undefined>(undefined);

export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const [groups, setGroups] = useState<IGroup[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/group');
      setLoading(false);

      // Check if data is available and is an array
      if (response?.data && Array.isArray(response.data)) {
        setGroups(response.data);
      } else {
        console.warn('Invalid group data format received from API', response.data);
        setGroups([]);
      }
    } catch (e) {
      console.error('Error occurred while fetching groups', e);
      toast.error('Failed to load groups. Please try again later.');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGroups();
  }, []);

  return (
    <GroupContext.Provider value={{ groups, loading, getGroups }}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
}; 