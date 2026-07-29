import React, { createContext, useState, useContext } from 'react';
import { MOCK_USER } from '../constants/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(MOCK_USER); // Logged in by default for MVP
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = (email, password) => {
    // Mock login
    setUser(MOCK_USER);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
