import React, { useContext } from 'react';
import { AppContent } from '../context/AppContext';

const ThemeToggle = () => {
  const { theme, setTheme } = useContext(AppContent);

  const toggleTheme = () => {
    setTheme(theme === 'day' ? 'night' : 'day');
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-10 h-5 rounded-full p-1 flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#45B7D1] hover:scale-105 ${
        theme === 'day' ? 'bg-gray-200' : 'bg-gray-800'
      }`}
      aria-label={theme === 'day' ? 'Switch to night mode' : 'Switch to day mode'}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          theme === 'day' ? 'translate-x-0' : 'translate-x-5'
        }`}
      >
        <span className="text-[10px]">
          {theme === 'day' ? '☀️' : '🌙'}
        </span>
      </div>
    </button>
  );
};

export default ThemeToggle;