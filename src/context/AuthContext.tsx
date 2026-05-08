import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../lib/api';
import { connectSocket } from '../lib/socket';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  role: 'client' | 'chef' | 'admin';
  profile_picture_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  is_pro?: boolean;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: 'client' | 'chef' | 'admin') => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  updateUser: (updatedUser: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Function to refresh user data from server
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      console.log('🔄 Refreshing user data...');
      const response = await api.get('/api/auth/me');
      console.log('✅ User refreshed:', response.data.user);
      setUser(response.data.user);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      console.log('🔍 Fetching user profile...');
      const response = await api.get('/api/auth/me');
      console.log('👤 User fetched:', {
        id: response.data.user?.id,
        email: response.data.user?.email,
        profile_picture_url: response.data.user?.profile_picture_url
      });
      
      setUser(response.data.user);
      connectSocket(token);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Login attempt for:', email);
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      console.log('✅ Login successful:', user);
      localStorage.setItem('token', token);
      setUser(user);
      connectSocket(token);
      
      // Test profile picture URL
      if (user.profile_picture_url) {
        console.log('📸 Profile picture URL:', user.profile_picture_url);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'client' | 'chef' | 'admin') => {
    try {
      console.log('📝 Signup attempt:', { email, fullName, role });
      
      const response = await api.post('/api/auth/signup', { 
        email, 
        password, 
        full_name: fullName, 
        role 
      });
      
      console.log('✅ Signup response:', response.data);
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      connectSocket(token);
      
      console.log('🎉 Signup successful!');
    } catch (error: any) {
      console.error('❌ Signup error details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    console.log('👤 User updated in context:', updatedUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      signIn, 
      signUp, 
      signOut, 
      loading,
      updateUser,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};