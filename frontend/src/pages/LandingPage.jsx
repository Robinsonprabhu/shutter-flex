import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, UploadCloud, CheckCircle, RefreshCw, Lock, Sparkles } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

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
  const [isOptimizing, setIsOptimizing] = useState(false);
  const fileInputRef = useRef(null);

  /* ui state */
  const [step, setStep] = useState(STEP_FORM);
  const [successData, setSuccessData] = useState(null); // { name, participantId, college, photoName }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  /* ── photo validation & instant client-side compression ── */
  const validateAndSetFile = async (file) => {
    setErrorMsg('');
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    const maxSize = 25 * 1024 * 1024; // Allow up to 25MB raw file because we compress client-side
    if (file.size > maxSize) {
      setErrorMsg('Image size exceeds 25 MB.');
      return;
    }

    setIsOptimizing(true);
    try {
      // Instant client-side compression: 10MB -> 300KB in ~50ms
      const optimizedFile = await compressImage(file);
      setSelectedFile(optimizedFile);
      setPreviewUrl(URL.createObjectURL(optimizedFile));
    } catch (err) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } finally {
      setIsOptimizing(false);
    }
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
          background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
        }}
      >
        <div style={{ maxWidth: '500px', width: '100%', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
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
              Entry Registered! 🎉
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
              Your official competition entry has been received and locked for judging.
            </p>

            {/* Strict 1 photo badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '20px',
                color: '#92400e',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '20px',
              }}
            >
              <Lock size={14} /> Maximum Limit Reached (1/1 Entry)
            </div>

            {/* Photo preview thumbnail */}
            {previewUrl && (
              <div
                style={{
                  width: '100%',
                  maxHeight: '190px',
                  overflow: 'hidden',
                  borderRadius: '10px',
                  marginBottom: '18px',
                  backgroundColor: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={previewUrl}
                  alt="Submitted"
                  style={{ maxWidth: '100%', maxHeight: '190px', objectFit: 'contain' }}
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
                { label: 'File', value: successData.photoName },
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
                      fontWeight: 600,
                      textAlign: 'right',
                      wordBreak: 'break-all',
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
              Each participant is strictly limited to 1 photograph entry. Good luck!
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
        padding: '40px 0 70px 0',
        background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
      }}
    >
      <div className="app-container" style={{ maxWidth: '580px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#d4af37',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '10px',
              padding: '4px 14px',
              backgroundColor: 'rgba(212, 175, 55, 0.12)',
              borderRadius: '20px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
            }}
          >
            <Sparkles size={13} /> Shutter Flex 2026 • Official Salon
          </div>
          <h1
            style={{
              fontSize: '30px',
              marginBottom: '8px',
              color: '#FFFFFF',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            Photography Competition
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#94a3b8',
              margin: 0,
            }}
          >
            Quick 1-step registration &amp; instant photo submission
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
            padding: '28px',
            marginBottom: '20px',
          }}
        >
          {/* Strict 1-photo Notice */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 13px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#1e40af',
              marginBottom: '18px',
              fontWeight: 500,
            }}
          >
            <Lock size={15} color="#2563eb" style={{ flexShrink: 0 }} />
            <span>
              <strong>1 Photo Limit:</strong> Each participant is allowed only 1 entry.
            </span>
          </div>

          {/* Error banner */}
          {errorMsg && (
            <div
              style={{
                backgroundColor: 'var(--status-rejected-bg)',
                border: '1px solid var(--status-rejected-border)',
                color: 'var(--status-rejected)',
                padding: '10px 14px',
                borderRadius: '6px',
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '5px', color: '#1e293b' }}>
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '5px', color: '#1e293b' }}>
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '5px', color: '#1e293b' }}>
                  Upload Photograph (Only 1 entry) *
                </label>

                {!previewUrl ? (
                  /* Drop zone */
                  <div
                    onClick={() => !isSubmitting && !isOptimizing && fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                      border: '2px dashed #cbd5e1',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '24px 16px',
                      textAlign: 'center',
                      cursor: isSubmitting || isOptimizing ? 'not-allowed' : 'pointer',
                      transition: 'border-color 0.15s, background-color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.borderColor = '#6366f1';
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
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
                      disabled={isSubmitting || isOptimizing}
                    />
                    <UploadCloud
                      size={28}
                      color="#6366f1"
                      style={{ margin: '0 auto 8px auto', display: 'block' }}
                    />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '2px' }}>
                      {isOptimizing ? 'Optimizing image...' : 'Click or drop photo here'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Fast auto-optimization enabled • 1 entry limit
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
                        backgroundColor: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        maxHeight: '190px',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '190px', objectFit: 'contain' }}
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
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>
                          ({(selectedFile?.size / 1024).toFixed(0)} KB ready)
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
                            fontWeight: 600,
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
                  <span>Submitting photograph…</span>
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
                      background: 'linear-gradient(90deg, #6366f1, #22c55e)',
                      borderRadius: '3px',
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isOptimizing}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 700 }}
            >
              {isSubmitting
                ? uploadProgress > 0
                  ? `Uploading… ${uploadProgress}%`
                  : 'Submitting…'
                : '🚀 Submit Entry (1/1 Photo)'}
            </button>
          </form>
        </div>

        {/* Quick Guidelines */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(12px)',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '16px 20px',
            fontSize: '13px',
            color: '#94a3b8',
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '6px', fontSize: '13px' }}>
            Rules &amp; Limits
          </div>
          <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <li><strong>Strict Limit:</strong> Only 1 photograph per participant is permitted.</li>
            <li>Photos are automatically optimized for instant judging.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
