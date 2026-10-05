import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, UserPlus, Camera, Building, Mail, Phone } from 'lucide-react';

export const LandingPage = ({ setCurrentView }) => {
  const { registerParticipant, loginParticipant } = useAuth();
  const [activeTab, setActiveTab] = useState('register'); // 'register' or 'login'

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regCollege, setRegCollege] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Login Form State
  const [loginName, setLoginName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sampleNames = ['Elena Rostova', 'Marcus Vance', 'Aria Chen', 'David Kim', 'Sophia Alvarez'];

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!regCollege.trim()) {
      setErrorMsg('Please enter your college or institution name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = await registerParticipant({
      name: regName.trim(),
      college: regCollege.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
    });

    setIsSubmitting(false);

    if (res.success) {
      setCurrentView('participant-dashboard');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginName.trim()) {
      setErrorMsg('Please enter your registered participant name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = await loginParticipant(loginName.trim());
    setIsSubmitting(false);

    if (res.success) {
      setCurrentView('participant-dashboard');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '85vh',
        padding: '50px 0 80px 0',
        backgroundImage: 'linear-gradient(180deg, rgba(15, 23, 42, 0.55) 0%, rgba(15, 23, 42, 0.72) 100%), url("https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=2560&q=85")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="app-container" style={{ maxWidth: '580px', position: 'relative', zIndex: 1 }}>
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: '12px',
              fontWeight: 700,
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '10px',
              padding: '4px 14px',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              borderRadius: '20px',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            Shutter Flex 2026 • Annual Photography Salon
          </div>
          <h1
            style={{
              fontSize: '32px',
              marginBottom: '10px',
              color: '#FFFFFF',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            Photography Competition
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.92)',
              margin: 0,
              textShadow: '0 1px 6px rgba(0,0,0,0.4)',
            }}
          >
            On-spot contestant registration & photograph submission portal
          </p>
        </div>

        {/* Tab Switcher: On-Spot Registration vs Existing Login */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '16px',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: activeTab === 'register' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'register' ? '#0F172A' : '#FFFFFF',
              boxShadow: activeTab === 'register' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <UserPlus size={15} /> On-Spot Registration
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: activeTab === 'login' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'login' ? '#0F172A' : '#FFFFFF',
              boxShadow: activeTab === 'login' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <UserCheck size={15} /> Already Registered? Sign In
          </button>
        </div>

        {/* Main Card Container */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.3)',
            padding: '28px',
            marginBottom: '24px',
          }}
        >
          {errorMsg && (
            <div
              style={{
                backgroundColor: 'var(--status-rejected-bg)',
                border: '1px solid var(--status-rejected-border)',
                color: 'var(--status-rejected)',
                padding: '10px 14px',
                borderRadius: '4px',
                fontSize: '13px',
                marginBottom: '18px',
                lineHeight: 1.4,
              }}
            >
              {errorMsg}
            </div>
          )}

          {activeTab === 'register' ? (
            /* On-Spot Registration Form */
            <form onSubmit={handleRegister}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '5px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter your complete name"
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '5px' }}>
                    College / Institution Name *
                  </label>
                  <input
                    type="text"
                    value={regCollege}
                    onChange={(e) => setRegCollege(e.target.value)}
                    placeholder="e.g. St. Xavier College / MIT / Arts Academy"
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '5px' }}>
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '5px' }}>
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="you@example.com"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ width: '100%', padding: '11px', fontSize: '14px' }}
              >
                {isSubmitting ? 'Registering Contestant...' : 'Register & Proceed to Submit Photos'}
              </button>
            </form>
          ) : (
            /* Sign In Form */
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Registered Name
                </label>
                <input
                  type="text"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="e.g. Elena Rostova or David Kim"
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ width: '100%', padding: '11px', fontSize: '14px', marginBottom: '18px' }}
              >
                {isSubmitting ? 'Validating Registration...' : 'Sign In to Dashboard'}
              </button>

              <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Or click sample contestant to fill:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {sampleNames.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setLoginName(name)}
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Quick Guidelines */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
            padding: '20px 24px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', fontSize: '14px' }}>
            Contestant Instructions
          </div>
          <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>No limit on participant count — all registered participants can submit entries.</li>
            <li>Make sure your full name is unique to prevent duplicate records.</li>
            <li>Supported formats: JPG, JPEG, PNG, WEBP (Max 15MB).</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
