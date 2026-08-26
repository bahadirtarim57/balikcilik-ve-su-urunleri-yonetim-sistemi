import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [originalAdminUser, setOriginalAdminUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('appUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
    }
    const savedAdmin = localStorage.getItem('originalAdminUser');
    if (savedAdmin) {
      try {
        setOriginalAdminUser(JSON.parse(savedAdmin));
      } catch (e) {
        setOriginalAdminUser(null);
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('appUser', JSON.stringify(userData));
  };

  const impersonate = (targetUser) => {
    if (!originalAdminUser) {
      setOriginalAdminUser(user);
      localStorage.setItem('originalAdminUser', JSON.stringify(user));
    }
    setUser(targetUser);
    localStorage.setItem('appUser', JSON.stringify(targetUser));
  };

  const stopImpersonating = () => {
    if (originalAdminUser) {
      setUser(originalAdminUser);
      localStorage.setItem('appUser', JSON.stringify(originalAdminUser));
      setOriginalAdminUser(null);
      localStorage.removeItem('originalAdminUser');
    }
  };

  const updateRole = (newRole) => {
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    localStorage.setItem('appUser', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    setOriginalAdminUser(null);
    localStorage.removeItem('appUser');
    localStorage.removeItem('originalAdminUser');
  };

  return (
    <AuthContext.Provider value={{ user, originalAdminUser, setUser, login, impersonate, stopImpersonating, logout, updateRole }}>
      {children}
    </AuthContext.Provider>
  );
};
