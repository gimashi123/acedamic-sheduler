// src/context/AuthContext.tsx
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import api, {
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
  UserData,
} from '@/config/axios.config.ts';
import { ILoginRequest, IUser } from '@/data-types/user.tp.ts';
import { useNavigate } from 'react-router-dom';

interface AuthContextProps {
  currentUser: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  passwordChangeRequired: boolean;

  setUser: (user: IUser | null) => void;
  login: (credentials: ILoginRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setPasswordChangeRequired: (required: boolean) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<IUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false);
  const navigate = useNavigate();

  // Bootstrap from localStorage
  useEffect(() => {
    const stored = getLocalStorage();
    if (stored) {
      setUserState(stored.user);
      setIsAuthenticated(true);
      api.defaults.headers.common.Authorization = `Bearer ${stored.accessToken}`;
    }
  }, []);

  // Action: setUser
  const setUser = useCallback((u: IUser | null) => {
    setUserState(u);
    setIsAuthenticated(!!u);
    if (!u) {
      setPasswordChangeRequired(false);
    }
  }, []);

  // Action: login
  const login = useCallback(
    async (credentials: ILoginRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const resp = await api.post('/auth/login', credentials);
        if (resp.data.success) {
          const { user: u, accessToken } = resp.data.result as {
            user: IUser;
            accessToken: string;
          };

          // persist
          const toSave: UserData = { user: u, accessToken };
          setLocalStorage(toSave);

          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          setUserState(u);
          setIsAuthenticated(true);
          setPasswordChangeRequired(false);
          navigate('/');
        } else {
          throw new Error(resp.data.message || 'Login failed');
        }
      } catch (e: any) {
        setError(e.message || 'Login failed');
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate],
  );

  // Action: logout
  const logout = useCallback(() => {
    removeLocalStorage();
    delete api.defaults.headers.common.Authorization;
    setUserState(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    setPasswordChangeRequired(false);
    setError(null);
  }, []);

  // Action: checkAuth (e.g. on app resume)
  const checkAuth = useCallback(async () => {
    const stored = getLocalStorage();
    if (!stored) return;

    setIsLoading(true);
    setError(null);

    try {
      const resp = await api.get('/auth/check-token');
      const u = resp.data.user as IUser;
      setUserState(u);
      setIsAuthenticated(true);
      setPasswordChangeRequired(false);
    } catch (e: any) {
      logout();
      setError(e.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  // Action: clearError
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser: user,
        isAuthenticated,
        isLoading,
        error,
        passwordChangeRequired,
        setUser,
        login,
        logout,
        checkAuth,
        setPasswordChangeRequired,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
