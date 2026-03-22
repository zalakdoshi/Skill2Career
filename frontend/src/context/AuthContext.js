import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, profileService, companyAuthService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Try as regular user first
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData.user);
          setIsAuthenticated(true);
          
          if (userData.user.role !== 'company') {
            const profileData = await profileService.getProfile();
            setProfile(profileData.profile);
          }
        } catch (userError) {
          // Try as company
          try {
            const companyData = await companyAuthService.getCurrentCompany();
            setUser(companyData.user);
            setIsAuthenticated(true);
          } catch (companyError) {
            console.error('Auth check failed:', companyError);
            localStorage.removeItem('token');
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('token', data.access_token);
    setUser(data.user);
    setIsAuthenticated(true);
    
    const profileData = await profileService.getProfile();
    setProfile(profileData.profile);
    
    return data;
  };

  const register = async (email, password, name) => {
    const data = await authService.register(email, password, name);
    localStorage.setItem('token', data.access_token);
    setUser(data.user);
    setIsAuthenticated(true);
    
    const profileData = await profileService.getProfile();
    setProfile(profileData.profile);
    
    return data;
  };

  const companyLogin = async (email, password) => {
    const data = await companyAuthService.login(email, password);
    localStorage.setItem('token', data.access_token);
    setUser(data.user);
    setIsAuthenticated(true);
    setProfile(null);
    return data;
  };

  const companyRegister = async (formData) => {
    const data = await companyAuthService.register(formData);
    localStorage.setItem('token', data.access_token);
    setUser(data.user);
    setIsAuthenticated(true);
    setProfile(null);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (data) => {
    const result = await profileService.updateProfile(data);
    setProfile(result.profile);
    return result;
  };

  const isAdmin = user?.role === 'admin';
  const isCompany = user?.role === 'company';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAuthenticated,
      isAdmin,
      isCompany,
      login,
      register,
      companyLogin,
      companyRegister,
      logout,
      updateProfile,
      refreshProfile: checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
