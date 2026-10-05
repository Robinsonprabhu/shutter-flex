import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { role: 'participant' | 'admin', profile: {...} }
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.id === toast?.id ? null : prev));
    }, 4500);
  };

  const hideToast = () => setToast(null);

  // Check stored credentials on initialization
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('shutter_token');
      const role = localStorage.getItem('shutter_role');

      if (!token || !role) {
        setLoading(false);
        return;
      }

      try {
        if (role === 'admin') {
          const res = await api.getAdminMe();
          if (res.success) {
            setUser({ role: 'admin', profile: res.admin });
          } else {
            logout();
          }
        } else if (role === 'participant') {
          const res = await api.getParticipantMe();
          if (res.success) {
            setUser({ role: 'participant', profile: res.participant });
          } else {
            logout();
          }
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const registerParticipant = async (formData) => {
    try {
      const res = await api.participantRegister(formData);
      if (res.success) {
        localStorage.setItem('shutter_token', res.token);
        localStorage.setItem('shutter_role', 'participant');
        setUser({ role: 'participant', profile: res.participant });
        showToast(`Registration successful! Welcome, ${res.participant.name}`, 'success');
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const loginParticipant = async (name) => {
    try {
      const res = await api.participantLogin(name);
      if (res.success) {
        localStorage.setItem('shutter_token', res.token);
        localStorage.setItem('shutter_role', 'participant');
        setUser({ role: 'participant', profile: res.participant });
        showToast(`Welcome to Shutter Flex, ${res.participant.name}!`, 'success');
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const loginAdmin = async (email, password) => {
    try {
      const res = await api.adminLogin(email, password);
      if (res.success) {
        localStorage.setItem('shutter_token', res.token);
        localStorage.setItem('shutter_role', 'admin');
        setUser({ role: 'admin', profile: res.admin });
        showToast('Curator & Judge portal authenticated.', 'success');
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('shutter_token');
    localStorage.removeItem('shutter_role');
    setUser(null);
    showToast('You have been logged out.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        registerParticipant,
        loginParticipant,
        loginAdmin,
        logout,
        toast,
        showToast,
        hideToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
