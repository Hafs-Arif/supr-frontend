// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const token = localStorage.getItem('accessToken');
      const cachedUser = localStorage.getItem('user');

      if (!token) {
        setLoading(false);
        return;
      }

      // Try fetch fresh profile from API
      try {
        const res = await api.get('/auth/profile');
        const profile = res?.data?.data;
        if (!cancelled && profile) {
          setUser(profile);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(profile));
        }
      } catch (err) {
        // fallback to cached user if API fails
        if (cachedUser) {
          try {
            const parsed = JSON.parse(cachedUser);
            if (!cancelled) {
              setUser(parsed);
              setIsAuthenticated(true);
            }
          } catch (e) {
            // ignore
          }
        } else {
          // clear tokens if profile fetch failed
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const login = (userData, tokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      // ignore server errors during logout
      console.warn('Logout request failed', err?.response?.data || err.message);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    // helper to refresh profile on demand
    refreshProfile: async () => {
      try {
        const res = await api.get('/auth/profile');
        const profile = res?.data?.data;
        if (profile) {
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        }
      } catch (err) {
        console.warn('Failed to refresh profile', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};