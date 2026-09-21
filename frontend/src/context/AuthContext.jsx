import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!api.getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    const res = await api.get('/userAuth/Profile');
    if (res.success && res.data) {
      setUser(res.data);
    } else {
      api.clearTokens();
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email, password) => {
    const res = await api.post('/userAuth/loginUser', { email, password });
    if (res.success && res.data) {
      api.setTokens(res.data.accessToken, res.data.refreshToken);
      setUser(res.data.user);
    }
    return res;
  };

  const logout = async () => {
    await api.post('/userAuth/logoutUser', {});
    api.clearTokens();
    setUser(null);
  };

  const value = {
    user, loading, login, logout, fetchProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
