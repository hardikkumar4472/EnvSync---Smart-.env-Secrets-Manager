import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

/**
 * Hardcoded Dark Theme Provider
 * All other themes have been deprecated for maximum security aesthetics.
 */
export const ThemeProvider = ({ children }) => {
  // Always default to dark for all users
  const [isDarkMode] = useState(true);

  useEffect(() => {
    // Force dark mode class on the document
    document.documentElement.classList.add('dark');
    localStorage.setItem('darkMode', 'true');
  }, []);

  // No-op toggle to prevent UI errors if called
  const toggleDarkMode = () => {
    console.log("Manual override detected: Theme is locked by policy.");
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
