import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Camera, UploadCloud, CheckCircle, X, RefreshCw } from 'lucide-react';

/* ─── Step constants ────────────────────────────────── */
const STEP_FORM = 'form';
const STEP_SUCCESS = 'success';

export const LandingPage = ({ setCurrentView }) => {
  const { registerAndUpload } = useAuth();

  /* register form */
  const [regName, setRegName] = useState('');
  const [regCollege, setRegCollege] = useState('');

  /* photo */
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  /* ui state */
  const [step, setStep] = useState(STEP_FORM);
  const [successData, setSuccessData] = useState(null); // { name, participantId, college, photoName }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  /* ── photo validation ─────────────────────────────── */
  const validateAndSetFile = (file) => {
    setErrorMsg('');
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg('Image size exceeds the 15 MB limit.');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) validateAndSetFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      validateAndSetFile(e.dataTransfer.files[0]);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ── Register + Upload ────────────────────────────── */
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim()) { setErrorMsg('Please enter your full name.'); return; }
    if (!regCollege.trim()) { setErrorMsg('Please enter your college / institution name.'); return; }
    if (!selectedFile) { setErrorMsg('Please select a photograph to upload.'); return; }

    setIsSubmitting(true);
    setErrorMsg('');
    setUploadProgress(0);

    const res = await registerAndUpload(
      { name: regName.trim(), college: regCollege.trim() },
      selectedFile,
      (pct) => setUploadProgress(pct),
    );

    setIsSubmitting(false);

    if (res.success) {
      setSuccessData(res.data);
      setStep(STEP_SUCCESS);
    } else {
      setErrorMsg(res.message);
    }
  };

  /* ── Success Screen ───────────────────────────────── */
  if (step === STEP_SUCCESS && successData) {
    return (
      <div
        style={{
          position: 'relative',
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 16px',
          backgroundImage:
            'linear-gradient(180deg, rgba(15,23,42,0.6) 0%, rgba(15,23,42,0.75) 100%), url("https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1280&q=65")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div style={{ maxWidth: '500px', width: '100%', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.97)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.5)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
              padding: '36px 32px',
              textAlign: 'center',
            }}
          >
            {/* Green check */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto',
                boxShadow: '0 8px 24px rgba(22,163,74,0.35)',
              }}
            >
              <CheckCircle size={32} color="#fff" strokeWidth={2.5} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>
              You're In! 🎉
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
              Your entry has been successfully submitted for judging.
            </p>

            {/* Photo preview thumbnail */}
            {previewUrl && (
              <div
                style={{
                  width: '100%',
                  maxHeight: '200px',
                  overflow: 'hidden',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  backgroundColor: '#1e1e2e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={previewUrl}
                  alt="Submitted"
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                />
              </div>
            )}

            {/* Details */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'left',
                marginBottom: '22px',
              }}
            >
              {[
                { label: 'Participant', value: successData.name },
                { label: 'College', value: successData.college || '—' },
                { label: 'Entry ID', value: successData.participantId },
                { label: 'Photo', value: successData.photoName },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '6px 0',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '13px',
                    gap: '8px',
                  }}
                >
                  <span style={{ color: '#94a3b8', fontWeight: 600, minWidth: 90 }}>{label}</span>
                  <span
                    style={{
                      color: '#1e293b',
                      fontWeight: 500,
                      textAlign: 'right',
                      wordBreak: 'break-all',
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6 }}>
              Your photograph is now under review by our judges.
              Results will be announced during the closing ceremony.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main Form ────────────────────────────────────── */
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '85vh',
        padding: '50px 0 80px 0',
        backgroundImage:
          'linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.72) 100%), url("https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1280&q=65")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="app-container" style={{ maxWidth: '580px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
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
              backgroundColor: 'rgba(255,255,255,0.18)',
              borderRadius: '20px',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)',
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
              color: 'rgba(255,255,255,0.92)',
              margin: 0,
              textShadow: '0 1px 6px rgba(0,0,0,0.4)',
            }}
          >
            On-spot registration &amp; photograph submission portal
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
            padding: '28px',
            marginBottom: '24px',
          }}
        >
          {/* Error banner */}
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

          {/* ── SUBMISSION FORM ── */}
          <form onSubmit={handleRegister}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>

              {/* Name */}
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
                  disabled={isSubmitting}
                />
              </div>

              {/* College */}
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
                  disabled={isSubmitting}
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '5px' }}>
                  Upload Your Photograph *
                </label>

                {!previewUrl ? (
                  /* Drop zone */
                  <div
                    onClick={() => !isSubmitting && fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                      border: '2px dashed #cbd5e1',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '28px 16px',
                      textAlign: 'center',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      transition: 'border-color 0.2s, background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.borderColor = '#6366f1';
                        e.currentTarget.style.backgroundColor = '#eef2ff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileInput}
                      style={{ display: 'none' }}
                      disabled={isSubmitting}
                    />
                    <UploadCloud
                      size={30}
                      color="#94a3b8"
                      style={{ margin: '0 auto 10px auto', display: 'block' }}
                    />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Click or drag &amp; drop your photo here
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      JPG, JPEG, PNG, WEBP — Max 15 MB — Only 1 photo per participant
                    </div>
                  </div>
                ) : (
                  /* Preview */
                  <div
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#1e1e2e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        maxHeight: '200px',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: '#f8fafc',
                        borderTop: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    >
                      <span style={{ color: '#475569', fontWeight: 500 }}>
                        {selectedFile?.name} &nbsp;
                        <span style={{ color: '#94a3b8' }}>
                          ({(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </span>
                      {!isSubmitting && (
                        <button
                          type="button"
                          onClick={clearFile}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#ef4444',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          <RefreshCw size={12} /> Change
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload progress bar */}
            {isSubmitting && uploadProgress > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#64748b',
                    marginBottom: '4px',
                  }}
                >
                  <span>Uploading photograph…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '5px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 700 }}
            >
              {isSubmitting
                ? uploadProgress > 0
                  ? `Uploading… ${uploadProgress}%`
                  : 'Submitting…'
                : '🎯 Submit Photograph'}
            </button>
          </form>
        </div>

        {/* Quick Guidelines */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
            padding: '18px 22px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', fontSize: '14px' }}>
            Contestant Instructions
          </div>
          <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>Each participant may submit <strong>only one photograph</strong> for judging.</li>
            <li>Enter your <strong>name</strong> and <strong>college</strong>, then upload your photo — all in one step.</li>
            <li>Supported formats: JPG, JPEG, PNG, WEBP (Max 15 MB).</li>
            <li>Make sure your full name is unique to avoid duplicate records.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
