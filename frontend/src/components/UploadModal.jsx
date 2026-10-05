import React, { useState, useRef } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { X, UploadCloud, AlertCircle } from 'lucide-react';

export const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const validateAndSetFile = (file) => {
    setErrorMsg('');
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      setErrorMsg('Image size exceeds the 15MB limit.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
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

      showToast('Photograph uploaded successfully.', 'success');
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
          <h3 style={{ fontSize: '18px', margin: 0 }}>Upload Photograph</h3>
          <button onClick={onClose} disabled={isUploading} style={{ color: 'var(--text-muted)' }}>
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
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '1px dashed var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '6px',
                padding: '30px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '18px',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              <UploadCloud size={24} color="var(--text-secondary)" style={{ margin: '0 auto 8px auto' }} />
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Choose a photo to upload
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Accepted formats: JPG, JPEG, PNG, WEBP (Max 15MB)
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '18px' }}>
              <div
                style={{
                  position: 'relative',
                  backgroundColor: '#EBEBE6',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  maxHeight: '220px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '220px', objectFit: 'contain' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {selectedFile?.name} ({(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB)
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
                <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--accent-dark)' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="btn-primary"
            >
              {isUploading ? 'Uploading...' : 'Submit Photograph'}
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
