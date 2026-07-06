import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUser } from '../api/auth-session';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [dataSaver, setDataSaver] = useState(false);
  const [streak, setStreak] = useState(12);
  const [user, setUser] = useState(getStoredUser);
  const [userRole, setUserRole] = useState(() => {
    const storedUser = getStoredUser();
    return storedUser?.role?.toLowerCase() ?? 'learner';
  });

  const isAuthenticated = user !== null;

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleDataSaver = () => {
    setDataSaver(prev => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        dataSaver,
        toggleDataSaver,
        streak,
        user,
        setUser,
        userRole,
        setUserRole,
        isAuthenticated,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
