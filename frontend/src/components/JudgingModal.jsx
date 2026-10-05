import React, { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from './StatusBadge';
import { WinnerConfirmationModal } from './WinnerConfirmationModal';
import { X, Trash2 } from 'lucide-react';

export const JudgingModal = ({ submission, onClose, onUpdate }) => {
  const { showToast } = useAuth();
  const [currentScore, setCurrentScore] = useState(submission.score !== null ? submission.score : '');
  const [judgeComment, setJudgeComment] = useState(submission.judgeComment || '');
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showWinnerConfirm, setShowWinnerConfirm] = useState(false);

  if (!submission) return null;

  const photoSrc = submission.photoUrl || `/api/submissions/${submission.id || submission._id}/photo`;

  const handleSaveScore = async () => {
    try {
      setIsSavingScore(true);
      const res = await api.updateSubmissionScore(submission.id || submission._id, currentScore);
      if (res.success) {
        showToast('Score saved.', 'success');
        onUpdate({ ...submission, score: res.score });
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSavingScore(false);
    }
  };

  const handleSaveComment = async () => {
    try {
      setIsSavingComment(true);
      const res = await api.updateSubmissionComment(submission.id || submission._id, judgeComment);
      if (res.success) {
        showToast('Comments saved.', 'success');
        onUpdate({ ...submission, judgeComment: res.judgeComment });
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSavingComment(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdatingStatus(true);
      const res = await api.updateSubmissionStatus(submission.id || submission._id, newStatus);
      if (res.success) {
        showToast(`Status updated to ${newStatus}.`, 'success');
        onUpdate({ ...submission, status: res.submission.status, isWinner: res.submission.isWinner });
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmWinner = async () => {
    try {
      const isCurrentlyWinner = submission.isWinner;
      const res = await api.setSubmissionWinner(submission.id || submission._id, !isCurrentlyWinner);
      if (res.success) {
        showToast(res.message, 'success');
        setShowWinnerConfirm(false);
        onUpdate({ ...submission, isWinner: res.submission.isWinner, status: res.submission.status });
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this submission?')) {
      return;
    }
    try {
      const res = await api.deleteSubmission(submission.id || submission._id);
      if (res.success) {
        showToast('Submission removed.', 'info');
        onClose();
        if (onUpdate) onUpdate(null, true);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <div className="modal-overlay" style={{ zIndex: 1100 }}>
        <div
          className="modal-container judging-modal-container"
          style={{
            maxWidth: '1050px',
            width: '100%',
            maxHeight: '94vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 18px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '17px', margin: 0 }}>Review Entry</h2>
              <StatusBadge status={submission.status} isWinner={submission.isWinner} />
            </div>
            <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '4px' }}>
              <X size={20} />
            </button>
          </div>

          {/* Body: Responsive Stack on Mobile */}
          <div
            className="judging-modal-body"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.35fr) minmax(320px, 1fr)',
              flex: 1,
              overflowY: 'auto',
            }}
          >
            {/* Left Photo */}
            <div
              className="judging-photo-col"
              style={{
                backgroundColor: '#18181b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                borderRight: '1px solid var(--border-color)',
              }}
            >
              <img
                src={photoSrc}
                alt={submission.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '68vh',
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* Right Information Panel */}
            <div
              style={{
                padding: '18px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Artwork Title
                </div>
                <div style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {submission.title || submission.originalFileName}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Photographer
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>
                    {submission.participantName}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Submitted Date
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {submission.createdAt ? new Date(submission.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              {submission.caption && (
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Caption / Equipment
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {submission.caption}
                  </div>
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

              {/* Score Control */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Jury Score (0 - 100)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={currentScore}
                    placeholder="Points"
                    onChange={(e) => setCurrentScore(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{ width: '90px' }}
                  />
                  <button
                    onClick={handleSaveScore}
                    disabled={isSavingScore}
                    className="btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '13px', flex: 1 }}
                  >
                    {isSavingScore ? 'Saving...' : 'Save Score'}
                  </button>
                </div>
              </div>

              {/* Judge Comment */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Curator Critique Notes
                </label>
                <textarea
                  rows={2}
                  value={judgeComment}
                  onChange={(e) => setJudgeComment(e.target.value)}
                  placeholder="Feedback on composition, lighting, style..."
                  style={{ width: '100%', resize: 'vertical', fontSize: '13px', marginBottom: '8px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleSaveComment}
                    disabled={isSavingComment}
                    className="btn-secondary"
                    style={{ padding: '7px 14px', fontSize: '13px', width: '100%' }}
                  >
                    {isSavingComment ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

              {/* Status Decision Actions */}
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Judicial Action
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
                  <button
                    onClick={() => handleStatusChange('shortlisted')}
                    disabled={isUpdatingStatus}
                    className="btn-secondary"
                    style={{
                      padding: '8px 4px',
                      fontSize: '12px',
                      fontWeight: submission.status === 'shortlisted' ? 700 : 500,
                      backgroundColor: submission.status === 'shortlisted' ? 'var(--status-shortlisted-bg)' : '#FFFFFF',
                      borderColor: submission.status === 'shortlisted' ? 'var(--status-shortlisted-border)' : 'var(--border-color)',
                      color: submission.status === 'shortlisted' ? 'var(--status-shortlisted)' : 'var(--text-primary)',
                      textAlign: 'center',
                    }}
                  >
                    Shortlist
                  </button>

                  <button
                    onClick={() => handleStatusChange('rejected')}
                    disabled={isUpdatingStatus}
                    className="btn-secondary"
                    style={{
                      padding: '8px 4px',
                      fontSize: '12px',
                      fontWeight: submission.status === 'rejected' ? 700 : 500,
                      backgroundColor: submission.status === 'rejected' ? 'var(--status-rejected-bg)' : '#FFFFFF',
                      borderColor: submission.status === 'rejected' ? 'var(--status-rejected-border)' : 'var(--border-color)',
                      color: submission.status === 'rejected' ? 'var(--status-rejected)' : 'var(--text-primary)',
                      textAlign: 'center',
                    }}
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => handleStatusChange('pending')}
                    disabled={isUpdatingStatus}
                    className="btn-secondary"
                    style={{
                      padding: '8px 4px',
                      fontSize: '12px',
                      fontWeight: submission.status === 'pending' ? 700 : 500,
                      backgroundColor: submission.status === 'pending' ? 'var(--status-pending-bg)' : '#FFFFFF',
                      borderColor: submission.status === 'pending' ? 'var(--status-pending-border)' : 'var(--border-color)',
                      color: submission.status === 'pending' ? 'var(--status-pending)' : 'var(--text-primary)',
                      textAlign: 'center',
                    }}
                  >
                    Pending
                  </button>
                </div>

                <button
                  onClick={() => setShowWinnerConfirm(true)}
                  className="btn-winner"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '10px',
                    fontSize: '14px',
                  }}
                >
                  {submission.isWinner ? 'Revoke Grand Winner Award' : 'Crown as Grand Winner'}
                </button>
              </div>

              {/* Delete Submission */}
              <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
                <button
                  onClick={handleDelete}
                  style={{
                    color: 'var(--status-rejected)',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Trash2 size={13} /> Delete submission
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showWinnerConfirm && (
        <WinnerConfirmationModal
          submission={submission}
          isSettingWinner={!submission.isWinner}
          onConfirm={handleConfirmWinner}
          onCancel={() => setShowWinnerConfirm(false)}
        />
      )}

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .judging-modal-body {
            grid-template-columns: 1fr !important;
          }
          .judging-photo-col {
            border-right: none !important;
            border-bottom: 1px solid var(--border-color) !important;
            padding: 12px !important;
          }
          .judging-photo-col img {
            max-height: 40vh !important;
          }
        }
      `}</style>
    </>
  );
};
