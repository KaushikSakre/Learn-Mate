import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios interceptor for adding auth token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:8000/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout(); // Clear invalid token
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email });
      const response = await axios.post('http://localhost:8000/login', {
        username: email, // API expects 'username' field but can accept email
        password
      });

      console.log('Login response:', response.data);
      const { user, token } = response.data;
      console.log('Extracted user:', user);
      console.log('Extracted token:', token);
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      
      console.log('Login successful, user set:', user);
      console.log('Auth state after login - user:', user, 'token:', token);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      const message = error.response?.data?.detail || error.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (username, email, password, fullName = '') => {
    try {
      const response = await axios.post('http://localhost:8000/register', {
        username,
        email,
        password,
        full_name: fullName
      });

      const { user, token } = response.data;
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};