import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { MOCK_USER } from '../constants/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          // Extract user from response. If api.js already unwrapped, it's response.user
          const payload = response.data || response;
          const userData = payload.user || response.user || payload;
          setUser(userData);
          setBusiness(payload.business || null);
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
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData, business: businessData } = response.data || response;

      localStorage.setItem('token', access_token);
      setUser(userData);
      setBusiness(businessData || null);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Login failed", error);
      return { success: false, error: error.message };
    }
  };

  const register = async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      const { access_token, user: userData, business: businessData } = response.data || response;

      localStorage.setItem('token', access_token);
      setUser(userData);
      setBusiness(businessData || null);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout').catch(() => { });
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setBusiness(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, business, setBusiness, updateBusiness: setBusiness, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
