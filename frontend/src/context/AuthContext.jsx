import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { MOCK_USER } from '../constants/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data || response); // depends on backend format
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Failed to authenticate with token", error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Temporary fallback to mock data if backend isn't ready
      // const response = await api.post('/auth/login', { email, password });
      // const { token, user } = response.data;

      // MOCK LOGIN FOR NOW to prevent breaking the flow before backend DB is fully seeded
      const token = "mock_jwt_token_12345";
      const userData = MOCK_USER;

      localStorage.setItem('token', token);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Login failed", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout').catch(() => { });
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
