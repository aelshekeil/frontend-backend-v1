import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser.user); // Assuming the user object is nested under 'user'
        setIsLoggedIn(true);
      } catch (e) {
        // console.error("Failed to parse user from localStorage", e);
        setUser(null);
        setIsLoggedIn(false);
      }
    }

    const handleAuthChange = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        try {
          const parsedUser = JSON.parse(updatedUser);
          // Explicitly update state to ensure re-render
          setUser((prevUser: any | null) => {
            // Only update if the user data has actually changed
            if (JSON.stringify(prevUser) !== JSON.stringify(parsedUser.user)) {
              return parsedUser.user;
            }
            return prevUser;
          });
          setIsLoggedIn(true);
        } catch (e) {
          // console.error("Failed to parse user from localStorage on authChange", e);
          setUser(null);
          setIsLoggedIn(false);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  return { isLoggedIn, user };
};
