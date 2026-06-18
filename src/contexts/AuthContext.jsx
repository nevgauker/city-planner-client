import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, fetchMe } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('city_planner_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem('city_planner_token') || null
  );

  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshQuota = async () => {
    if (!token) return;
    try {
      const data = await fetchMe();
      setQuota({
        monthlyGenerations: data.monthlyGenerations,
        monthlyGenerationsLimit: data.monthlyGenerationsLimit,
        monthlyRegenerations: data.monthlyRegenerations,
        monthlyRegenerationsLimit: data.monthlyRegenerationsLimit,
        daysUntilReset: data.daysUntilReset,
        planTier: data.planTier,
      });
    } catch (err) {
      console.error('Failed to refresh quota:', err);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUser(email, password);
      const { token: newToken, user: newUser } = response;

      localStorage.setItem('city_planner_token', newToken);
      localStorage.setItem('city_planner_user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);

      await refreshQuota();
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerUser(email, password);
      const { token: newToken, user: newUser } = response;

      localStorage.setItem('city_planner_token', newToken);
      localStorage.setItem('city_planner_user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);

      await refreshQuota();
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('city_planner_token');
    localStorage.removeItem('city_planner_user');
    setToken(null);
    setUser(null);
    setQuota(null);
    setError(null);
  };

  useEffect(() => {
    if (token && !quota) {
      refreshQuota();
    }
  }, [token]);

  useEffect(() => {
    const handleLogout = () => {
      logout();
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        quota,
        loading,
        error,
        login,
        register,
        logout,
        refreshQuota,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
