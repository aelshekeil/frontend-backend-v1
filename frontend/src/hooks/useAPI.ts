import { useState, useEffect } from 'react';
import strapiAPI from '../lib/api';

// Authentication Hook
export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('jwt');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      strapiAPI.setToken(storedToken);
    }

    setLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const response = await strapiAPI.login(identifier, password);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('jwt', response.jwt);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await strapiAPI.register(username, email, password);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('jwt', response.jwt);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    strapiAPI.removeToken();
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};

// Generic API Data Fetching Hook
export const useAPI = <T>(endpoint: string) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await strapiAPI.get<T>(endpoint);
        setData(response);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};

// Form Submission Hook
export const useFormSubmission = <T>(endpoint: string) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<T | null>(null);

  const submit = async (formData: any) => {
    setSubmitting(true);
    try {
      // strapiAPI.post() returns data directly, not wrapped in .data
      const result = await strapiAPI.post<T>(endpoint, formData);
      setResponse(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, error, response };
};
