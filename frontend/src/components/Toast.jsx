import React from 'react';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

export const Toast = () => {
  const { toast, hideToast } = useAuth();

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: isError ? '#FEF2F2' : isSuccess ? '#F0FDF4' : '#FFFFFF',
        color: isError ? '#991B1B' : isSuccess ? '#166534' : '#171717',
        border: `1px solid ${isError ? '#FCA5A5' : isSuccess ? '#BBF7D0' : '#D8D8D3'}`,
        borderRadius: '4px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        fontSize: '14px',
        maxWidth: '380px',
      }}
    >
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={hideToast}
        style={{
          color: 'inherit',
          opacity: 0.6,
          display: 'flex',
          padding: '2px',
        }}
        aria-label="Close notification"
      >
        <X size={15} />
      </button>
    </div>
  );
};
