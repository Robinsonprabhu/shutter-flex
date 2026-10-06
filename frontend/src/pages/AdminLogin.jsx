import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, ShieldCheck } from 'lucide-react';

export const AdminLogin = ({ setCurrentView }) => {
  const { loginAdmin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both administrator username and passkey.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = await loginAdmin(username.trim(), password);
    setIsSubmitting(false);

    if (res.success) {
      setCurrentView('admin-dashboard');
    } else {
      setErrorMsg(res.message || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div
      style={{
        padding: '50px 0 70px 0',
        minHeight: '85vh',
        background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="app-container" style={{ maxWidth: '420px', width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
            }}
          >
            <ShieldCheck size={26} color="#d4af37" />
          </div>
          <h1
            style={{
              fontSize: '24px',
              marginBottom: '6px',
              color: '#FFFFFF',
              fontWeight: 800,
              letterSpacing: '-0.01em',
            }}
          >
            Jury &amp; Admin Access
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Sign in to review submissions, assign scores, and award winners.
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.4)',
            padding: '28px 24px',
          }}
        >
          {errorMsg && (
            <div
              style={{
                backgroundColor: 'var(--status-rejected-bg)',
                border: '1px solid var(--status-rejected-border)',
                color: 'var(--status-rejected)',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                marginBottom: '16px',
                lineHeight: 1.4,
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#1e293b' }}>
                Admin Username or Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username or email"
                autoComplete="username"
                required
                style={{ width: '100%' }}
                disabled={isSubmitting}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#1e293b' }}>
                Passkey
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter passkey"
                autoComplete="current-password"
                required
                style={{ width: '100%' }}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 700 }}
            >
              {isSubmitting ? 'Verifying credentials...' : 'Sign In as Judge'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
