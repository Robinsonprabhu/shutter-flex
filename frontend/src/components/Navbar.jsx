import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Upload } from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView, openUploadModal }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="app-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '62px',
        }}
      >
        {/* Left: Event Branding */}
        <div
          onClick={() => handleNav('landing')}
          style={{
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '17px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>Shutter Flex</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '13px', display: 'inline-block' }}>
            • Photography Salon
          </span>
        </div>

        {/* Desktop Nav Items */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
          className="desktop-nav"
        >
          <button
            onClick={() => handleNav('landing')}
            style={{
              fontSize: '14px',
              color: currentView === 'landing' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: currentView === 'landing' ? 600 : 500,
            }}
          >
            Register / Login
          </button>

          <button
            onClick={() => handleNav('exhibition')}
            style={{
              fontSize: '14px',
              color: currentView === 'exhibition' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: currentView === 'exhibition' ? 600 : 500,
            }}
          >
            Winners
          </button>

          {user?.role === 'participant' && (
            <>
              <button
                onClick={() => handleNav('participant-dashboard')}
                style={{
                  fontSize: '14px',
                  color: currentView === 'participant-dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: currentView === 'participant-dashboard' ? 600 : 500,
                }}
              >
                My Submission
              </button>

              <button
                onClick={() => {
                  openUploadModal();
                  setMobileMenuOpen(false);
                }}
                className="btn-primary"
                style={{
                  padding: '6px 14px',
                  fontSize: '13px',
                  minHeight: '34px',
                }}
              >
                <Upload size={14} /> Submit Photo
              </button>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => handleNav('admin-dashboard')}
                style={{
                  fontSize: '14px',
                  color: currentView === 'admin-dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: currentView === 'admin-dashboard' ? 600 : 500,
                }}
              >
                Dashboard
              </button>

              <button
                onClick={() => handleNav('admin-participants')}
                style={{
                  fontSize: '14px',
                  color: currentView === 'admin-participants' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: currentView === 'admin-participants' ? 600 : 500,
                }}
              >
                Participants
              </button>
            </>
          )}
        </nav>

        {/* Right User / Auth Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="desktop-user">
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {user.profile.name}
              </span>
              <button
                onClick={logout}
                style={{
                  fontSize: '13px',
                  color: 'var(--status-rejected)',
                  textDecoration: 'underline',
                }}
              >
                Log out
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNav('admin-login')}
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}
              className="desktop-admin-link"
            >
              Judge Access
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            style={{
              padding: '8px',
              color: 'var(--text-primary)',
              display: 'none',
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--border-color)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
          className="mobile-nav-panel"
        >
          <button
            onClick={() => handleNav('landing')}
            style={{
              textAlign: 'left',
              padding: '10px 12px',
              borderRadius: '4px',
              fontSize: '15px',
              backgroundColor: currentView === 'landing' ? 'var(--bg-secondary)' : 'transparent',
              fontWeight: currentView === 'landing' ? 600 : 500,
            }}
          >
            Registration & Sign In
          </button>

          <button
            onClick={() => handleNav('exhibition')}
            style={{
              textAlign: 'left',
              padding: '10px 12px',
              borderRadius: '4px',
              fontSize: '15px',
              backgroundColor: currentView === 'exhibition' ? 'var(--bg-secondary)' : 'transparent',
              fontWeight: currentView === 'exhibition' ? 600 : 500,
            }}
          >
            Winners Gallery
          </button>

          {user?.role === 'participant' && (
            <>
              <button
                onClick={() => handleNav('participant-dashboard')}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  fontSize: '15px',
                  backgroundColor: currentView === 'participant-dashboard' ? 'var(--bg-secondary)' : 'transparent',
                  fontWeight: currentView === 'participant-dashboard' ? 600 : 500,
                }}
              >
                My Submissions
              </button>

              <button
                onClick={() => {
                  openUploadModal();
                  setMobileMenuOpen(false);
                }}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                }}
              >
                <Upload size={16} /> Submit Photograph
              </button>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => handleNav('admin-dashboard')}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  fontSize: '15px',
                  backgroundColor: currentView === 'admin-dashboard' ? 'var(--bg-secondary)' : 'transparent',
                  fontWeight: currentView === 'admin-dashboard' ? 600 : 500,
                }}
              >
                Judging Dashboard
              </button>

              <button
                onClick={() => handleNav('admin-participants')}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  fontSize: '15px',
                  backgroundColor: currentView === 'admin-participants' ? 'var(--bg-secondary)' : 'transparent',
                  fontWeight: currentView === 'admin-participants' ? 600 : 500,
                }}
              >
                Manage Participants
              </button>
            </>
          )}

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
            {user ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.profile.name}</span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  style={{ fontSize: '14px', color: 'var(--status-rejected)', textDecoration: 'underline' }}
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('admin-login')}
                style={{
                  textAlign: 'left',
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                }}
              >
                Curator & Judge Login
              </button>
            )}
          </div>
        </div>
      )}

      {/* Embedded CSS for mobile nav toggle */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav, .desktop-user, .desktop-admin-link {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};
