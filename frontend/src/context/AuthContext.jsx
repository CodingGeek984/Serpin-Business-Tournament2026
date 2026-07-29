import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [isReady, setIsReady] = useState(false);

  const applySession = (session) => {
    localStorage.setItem('access_token', session.access_token);
    setToken(session.access_token);
    setUser(session.user);
  };

  useEffect(() => {
    if (!token) {
      setIsReady(true);
      return;
    }

    api('/auth/me', { token })
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => {
        localStorage.removeItem('access_token');
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsReady(true));
  }, [token]);

  const login = async (email, password) => {
    const session = await api('/auth/login', { method: 'POST', body: { email, password } });
    applySession(session);
    return session;
  };

  const register = async (data) => {
    const session = await api('/auth/register', { method: 'POST', body: data });
    applySession(session);
    return session;
  };

  const logout = async () => {
    if (token) {
      try {
        await api('/auth/logout', { method: 'POST', token });
      } catch {
        // The local session must still be cleared if the server is unavailable.
      }
    }
    localStorage.removeItem('access_token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isReady, isAuthenticated: Boolean(token && user), login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
