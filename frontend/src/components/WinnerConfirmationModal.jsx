import React from 'react';
import { X } from 'lucide-react';

export const WinnerConfirmationModal = ({ submission, onConfirm, onCancel, isSettingWinner = true }) => {
  if (!submission) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div
        className="modal-container"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '17px', margin: 0 }}>
            {isSettingWinner ? 'Confirm Competition Winner' : 'Revoke Winner Status'}
          </h3>
          <button onClick={onCancel} style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '20px', color: 'var(--text-secondary)' }}>
          {isSettingWinner ? (
            <>
              Select <strong>"{submission.title || submission.originalFileName}"</strong> by <strong>{submission.participantName}</strong> as the official winner of this competition?
            </>
          ) : (
            <>
              Remove winner status for <strong>{submission.participantName}</strong>'s entry? It will revert to shortlisted status.
            </>
          )}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onCancel} className="btn-secondary" style={{ padding: '7px 14px' }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn-primary"
            style={{ padding: '7px 16px' }}
          >
            {isSettingWinner ? 'Confirm Winner' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
