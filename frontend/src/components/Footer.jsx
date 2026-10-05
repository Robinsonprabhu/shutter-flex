import React from 'react';

export const Footer = ({ setCurrentView }) => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-color)',
        backgroundColor: '#FFFFFF',
        padding: '30px 0',
        marginTop: '60px',
        fontSize: '13px',
        color: 'var(--text-secondary)',
      }}
    >
      <div
        className="app-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <strong>Shutter Flex 2026</strong> • Annual Student & Creator Photography Competition
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <button
            onClick={() => setCurrentView('landing')}
            style={{ color: 'var(--text-secondary)', fontSize: '13px' }}
          >
            Rules & Overview
          </button>
          <button
            onClick={() => setCurrentView('exhibition')}
            style={{ color: 'var(--text-secondary)', fontSize: '13px' }}
          >
            Winners
          </button>
          <button
            onClick={() => setCurrentView('admin-login')}
            style={{ color: 'var(--text-secondary)', fontSize: '13px' }}
          >
            Judge Login
          </button>
        </div>
      </div>
    </footer>
  );
};
