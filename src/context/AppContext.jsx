import React, { useState, useEffect, createContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AppContent = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'day');

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'day' ? 'night' : 'day';
      localStorage.setItem('theme', newTheme);
      if (newTheme === 'night') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newTheme;
    });
  };

  const getUserData = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        setLoadingUser(true);
        setFetchError(null);
        const response = await axios.get(`${backendUrl}/api/user/data`, {
          withCredentials: true,
        });
        
        if (response.data.success) {
          setUserData({
            ...response.data.user,
            profilePicture: response.data.user.profilePicture || null
          });
          setIsLoggedin(true);
          sessionStorage.setItem('isActiveSession', 'true');
          return true;
        } else {
          setFetchError(response.data.message);
          return false;
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to fetch user data';
        setFetchError(message);
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        return false;
      } finally {
        setLoadingUser(false);
      }
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedin(false);
    setUserData(null);
    setFetchError(null);
    sessionStorage.removeItem('isActiveSession');
    axios.post(`${backendUrl}/api/auth/logout`, {}, { withCredentials: true })
      .catch((error) => console.error('Logout failed:', error));
  };

  useEffect(() => {
    const checkSession = async () => {
      const hasActiveSession = sessionStorage.getItem('isActiveSession');
      if (hasActiveSession) {
        const success = await getUserData();
        if (!success) {
          setIsLoggedin(false);
          sessionStorage.removeItem('isActiveSession');
        }
      } else {
        setLoadingUser(false);
      }
    };

    if (theme === 'night') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    checkSession();
  }, []);

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
    loadingUser,
    fetchError,
    handleLogout,
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <AppContent.Provider value={value}>{props.children}</AppContent.Provider>
  );
};