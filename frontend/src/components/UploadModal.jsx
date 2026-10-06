import React, { useState, useRef } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { X, UploadCloud, AlertCircle } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

export const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const validateAndSetFile = async (file) => {
    setErrorMsg('');
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      setErrorMsg('Image size exceeds 25MB limit.');
      return;
    }

    setIsOptimizing(true);
    try {
      const optimized = await compressImage(file);
      setSelectedFile(optimized);
      const objectUrl = URL.createObjectURL(optimized);
      setPreviewUrl(objectUrl);

      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    } catch (e) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select an image to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('photo', selectedFile);
    formData.append('title', title);
    formData.append('caption', caption);

    try {
      const res = await api.uploadSubmission(formData, (progress) => {
        setUploadProgress(progress);
      });

      showToast('Photograph uploaded successfully (1/1 Entry Recorded).', 'success');
      if (onSuccess) onSuccess(res.submission);
      onClose();
      handleReset();
      setTitle('');
      setCaption('');
    } catch (err) {
      setErrorMsg(err.message || 'Upload failed.');
      showToast(err.message || 'Upload error', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1150 }}>
      <div
        className="modal-container"
        style={{
          maxWidth: '540px',
          width: '100%',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', margin: 0 }}>Upload Photograph</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Strict limit: 1 entry per participant</span>
          </div>
          <button onClick={onClose} disabled={isUploading || isOptimizing} style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

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

        <form onSubmit={handleSubmit}>
          {!previewUrl ? (
            <div
              onClick={() => !isOptimizing && fileInputRef.current?.click()}
              style={{
                border: '1px dashed var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '6px',
                padding: '28px 16px',
                textAlign: 'center',
                cursor: isOptimizing ? 'not-allowed' : 'pointer',
                marginBottom: '18px',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInput}
                style={{ display: 'none' }}
                disabled={isOptimizing}
              />
              <UploadCloud size={24} color="#6366f1" style={{ margin: '0 auto 8px auto' }} />
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
                {isOptimizing ? 'Optimizing photo...' : 'Choose a photo to upload'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                JPG, JPEG, PNG, WEBP • Fast auto-compression enabled
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '18px' }}>
              <div
                style={{
                  position: 'relative',
                  backgroundColor: '#0f172a',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  maxHeight: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
                  {selectedFile?.name} ({(selectedFile?.size / 1024).toFixed(0)} KB optimized)
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{ fontSize: '12px', color: 'var(--status-rejected)', textDecoration: 'underline' }}
                >
                  Change file
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                Photo Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Morning Light on Concrete"
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                Camera details / Caption (Optional)
              </label>
              <textarea
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Camera settings, location, or notes..."
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
          </div>

          {isUploading && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--accent-dark)', transition: 'width 0.2s' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading || isOptimizing}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || isOptimizing || !selectedFile}
              className="btn-primary"
            >
              {isUploading ? 'Uploading...' : 'Submit Entry (1/1 Limit)'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .modal-container {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};
