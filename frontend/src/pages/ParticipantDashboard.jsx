import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PhotoCard } from '../components/PhotoCard';
import { StatusBadge } from '../components/StatusBadge';
import { Upload, X } from 'lucide-react';

export const ParticipantDashboard = ({ openUploadModal }) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.getMySubmissions();
      if (res.success) {
        setSubmissions(res.submissions);
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <div style={{ padding: '24px 0 60px 0' }}>
      <div className="app-container">
        {/* Main Card Container */}
        <div
          className="surface-card"
          style={{
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          {/* Header Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '16px',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '24px', margin: 0 }}>My Submissions</h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Contestant: <strong>{user?.profile?.name}</strong> {user?.profile?.college ? <span>• {user.profile.college}</span> : null} ({user?.profile?.participantId || 'Entrant'})
              </p>
            </div>

            <button
              onClick={openUploadModal}
              className="btn-primary"
              style={{ fontSize: '14px', padding: '10px 18px', width: 'auto' }}
            >
              <Upload size={16} /> Submit Photograph
            </button>
          </div>

          {/* Submissions List */}
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading your submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '40px 20px',
                textAlign: 'center',
              }}
            >
              <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>No photographs submitted yet</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Upload your photograph to enter into the competition judging.
              </p>
              <button onClick={openUploadModal} className="btn-primary">
                Choose Photo
              </button>
            </div>
          ) : (
            <div
              className="participant-gallery-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '18px',
              }}
            >
              {submissions.map((sub) => (
                <PhotoCard
                  key={sub.id || sub._id}
                  submission={sub}
                  onClick={() => setSelectedPhoto(sub)}
                  isJudgeView={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Lightbox Modal */}
      {selectedPhoto && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div
            className="modal-container"
            style={{
              maxWidth: '800px',
              width: '100%',
              padding: '18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '16px', margin: 0 }}>
                  {selectedPhoto.title || selectedPhoto.originalFileName}
                </h3>
                <StatusBadge status={selectedPhoto.status} isWinner={selectedPhoto.isWinner} />
              </div>
              <button onClick={() => setSelectedPhoto(null)} style={{ color: 'var(--text-muted)', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                backgroundColor: '#18181b',
                borderRadius: '6px',
                overflow: 'hidden',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: '56vh',
              }}
            >
              <img
                src={selectedPhoto.photoUrl || `/api/submissions/${selectedPhoto.id || selectedPhoto._id}/photo`}
                alt={selectedPhoto.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '56vh',
                  objectFit: 'contain',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', fontSize: '13px' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '4px' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', fontSize: '11px', fontWeight: 600 }}>File Details</div>
                <div><strong>File:</strong> {selectedPhoto.originalFileName}</div>
                {selectedPhoto.caption && <div style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>{selectedPhoto.caption}</div>}
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '4px' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', fontSize: '11px', fontWeight: 600 }}>Review Status</div>
                <div><strong>Score:</strong> {selectedPhoto.score !== null ? `${selectedPhoto.score} / 100 pts` : 'Pending Score'}</div>
                {selectedPhoto.judgeComment && (
                  <div style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>"{selectedPhoto.judgeComment}"</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Responsive Grid Override */}
      <style>{`
        @media (max-width: 600px) {
          .participant-gallery-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
