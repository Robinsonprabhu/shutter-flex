import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { UploadModal } from './components/UploadModal';

import { LandingPage } from './pages/LandingPage';
import { ParticipantDashboard } from './pages/ParticipantDashboard';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminParticipants } from './pages/AdminParticipants';
import { WinnerExhibition } from './pages/WinnerExhibition';

export const App = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('landing');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sync view based on auth changes
  useEffect(() => {
    if (!loading) {
      if (user?.role === 'admin' && (currentView === 'landing' || currentView === 'admin-login')) {
        setCurrentView('admin-dashboard');
      } else if (user?.role === 'participant' && currentView === 'landing') {
        setCurrentView('participant-dashboard');
      }
    }
  }, [user, loading]);

  const handleUploadSuccess = () => {
    setRefreshKey((k) => k + 1);
    setCurrentView('participant-dashboard');
  };

  const renderCurrentView = () => {
    if (loading) {
      return (
        <div style={{ padding: '160px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>SHUTTER FLEX</div>
          <div style={{ fontSize: '0.85rem' }}>Initializing competition registry...</div>
        </div>
      );
    }

    switch (currentView) {
      case 'participant-dashboard':
        if (!user || user.role !== 'participant') {
          return <LandingPage setCurrentView={setCurrentView} />;
        }
        return (
          <ParticipantDashboard
            key={refreshKey}
            openUploadModal={() => setIsUploadModalOpen(true)}
          />
        );

      case 'admin-login':
        if (user?.role === 'admin') {
          return <AdminDashboard key={refreshKey} />;
        }
        return <AdminLogin setCurrentView={setCurrentView} />;

      case 'admin-dashboard':
        if (!user || user.role !== 'admin') {
          return <AdminLogin setCurrentView={setCurrentView} />;
        }
        return <AdminDashboard key={refreshKey} />;

      case 'admin-participants':
        if (!user || user.role !== 'admin') {
          return <AdminLogin setCurrentView={setCurrentView} />;
        }
        return <AdminParticipants />;

      case 'exhibition':
        return <WinnerExhibition />;

      case 'landing':
      default:
        return <LandingPage setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openUploadModal={() => setIsUploadModalOpen(true)}
      />

      <main style={{ flex: 1 }}>{renderCurrentView()}</main>

      <Footer setCurrentView={setCurrentView} />

      <Toast />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};
