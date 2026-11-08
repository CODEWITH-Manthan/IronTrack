import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AdvancedProfile } from '../types';
import { api, getStoredToken } from '../utils/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; name: string; profile?: Partial<AdvancedProfile> }) => Promise<void>;
  updateProfile: (profile: Partial<AdvancedProfile>, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from token on mount
  useEffect(() => {
    async function loadUser() {
      const stored = getStoredToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        setUser(res.user);
        setToken(stored);
      } catch (err) {
        console.warn('Failed to restore session:', err);
        api.logout();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (payload: {
    email: string;
    password: string;
    name: string;
    profile?: Partial<AdvancedProfile>;
  }) => {
    const res = await api.register(payload);
    setToken(res.token);
    setUser(res.user);
  };

  const updateProfile = async (profile: Partial<AdvancedProfile>, name?: string) => {
    const res = await api.updateProfile({ profile, name });
    setUser(res.user);
  };

  const logout = () => {
    api.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
