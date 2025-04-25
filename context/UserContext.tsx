import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserContextType {
  username: string | null;
  setUsername: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  username: null,
  setUsername: async () => {},
  logout: async () => {},
  isLoading: true
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [username, setUsernameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load username from AsyncStorage when the app starts
    const loadUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsernameState(storedUsername);
        }
      } catch (error) {
        console.error('Failed to load username:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsername();
  }, []);

  const setUsername = async (newUsername: string) => {
    try {
      await AsyncStorage.setItem('username', newUsername);
      setUsernameState(newUsername);
    } catch (error) {
      console.error('Failed to save username:', error);
    }
  };

  //logout function to clear username
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('username');
      setUsernameState(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <UserContext.Provider value={{ username, setUsername, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};
