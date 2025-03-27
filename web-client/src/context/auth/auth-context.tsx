import { ILoginRequest, IUser } from '@/data-types/user.tp.ts';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import api, {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
  UserData,
} from '@/config/axios.config.ts';
import { useNavigate } from 'react-router-dom';

interface AuthContextProps {
  currentUser: IUser | null;
  accessToken: string | null;
  loading: boolean;
  login: (credentials: ILoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = getLocalStorage();
    if (userData) {
      setCurrentUser(userData.user);
      setAccessToken(userData.accessToken);
    }
  }, []);

  const login = async (credentials: ILoginRequest) => {
    try {
      setLoading(true);
      const response: any = await api.post('/auth/login', credentials);
      setLoading(false);

      if (response?.data?.success) {
        const valuesToSave: UserData = {
          user: response.data.result.user,
          accessToken: response.data.result.accessToken,
        };
        setCurrentUser(response.data?.result.user);
        setAccessToken(response.data?.result.accessToken);
        setLocalStorage(valuesToSave);

        navigate('/');
      }
    } catch (e) {
      console.log('Error occurred while login user', e);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAccessToken(null);
    setCurrentUser(null);
    removeLocalStorage();
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, accessToken, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
