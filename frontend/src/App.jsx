import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { UploadModal } from './components/UploadModal';

// Route-level code splitting to make initial load instant
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const ParticipantDashboard = lazy(() =>
  import('./pages/ParticipantDashboard').then((m) => ({ default: m.ParticipantDashboard }))
);
const AdminLogin = lazy(() =>
  import('./pages/AdminLogin').then((m) => ({ default: m.AdminLogin }))
);
const AdminDashboard = lazy(() =>
  import('./pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const AdminParticipants = lazy(() =>
  import('./pages/AdminParticipants').then((m) => ({ default: m.AdminParticipants }))
);
const WinnerExhibition = lazy(() =>
  import('./pages/WinnerExhibition').then((m) => ({ default: m.WinnerExhibition }))
);

const ViewLoadingFallback = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#d4af37',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
          margin: '0 auto 12px auto',
        }}
      />
      <div style={{ fontSize: '13px', letterSpacing: '0.05em' }}>Loading...</div>
    </div>
  </div>
);

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

      <main style={{ flex: 1 }}>
        <Suspense fallback={<ViewLoadingFallback />}>
          {renderCurrentView()}
        </Suspense>
      </main>

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
