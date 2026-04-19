import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authAPI, setAccessToken, clearAccessToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking existing session

  // On mount, try to restore session via refresh token cookie
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const refreshRes = await fetch('https://edicto.onrender.com/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setAccessToken(refreshData.data.accessToken);
        const meRes = await authAPI.getMe();
        setUser(meRes.data.user);
      }
    } catch {
      // No valid session — that's fine
    } finally {
      setLoading(false);
    }
  };

  const register = useCallback(async ({ name, email, password }) => {
    const res = await authAPI.register({ name, email, password });
    // After register, auto-login
    return login({ email, password });
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res = await authAPI.login({ email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore
    }
    clearAccessToken();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const res = await authAPI.updateProfile(data);
    setUser(res.data.user);
    return res;
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
