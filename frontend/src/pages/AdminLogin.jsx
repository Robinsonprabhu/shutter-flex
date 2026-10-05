import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const AdminLogin = ({ setCurrentView }) => {
  const { loginAdmin } = useAuth();
  const [username, setUsername] = useState('shutterflex');
  const [password, setPassword] = useState('aidex26');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!username || !password) {
      setErrorMsg('Please enter both administrator username/email and passkey.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = await loginAdmin(username, password);
    setIsSubmitting(false);

    if (res.success) {
      setCurrentView('admin-dashboard');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleFillDemo = () => {
    setUsername('shutterflex');
    setPassword('aidex26');
  };

  return (
    <div
      style={{
        padding: '60px 0 80px 0',
        minHeight: '85vh',
        backgroundImage: 'linear-gradient(rgba(250, 250, 248, 0.92), rgba(250, 250, 248, 0.95)), url("https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="app-container" style={{ maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '6px' }}>Jury & Admin Portal</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Sign in to curate entries, score photographs, and select winners.
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '26px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          {errorMsg && (
            <div
              style={{
                backgroundColor: 'var(--status-rejected-bg)',
                border: '1px solid var(--status-rejected-border)',
                color: 'var(--status-rejected)',
                padding: '10px 12px',
                borderRadius: '4px',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Admin Username or Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="shutterflex"
                required
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Passkey
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="aidex26"
                required
                style={{ width: '100%' }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ width: '100%', padding: '10px' }}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In as Admin'}
            </button>
          </form>

          <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleFillDemo}
              style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'underline' }}
            >
              Reset to credentials (shutterflex / aidex26)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
