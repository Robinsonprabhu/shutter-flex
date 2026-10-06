import React, { useState, memo } from 'react';
import { StatusBadge } from './StatusBadge';

export const PhotoCard = memo(({ submission, onClick, isJudgeView = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const formattedDate = submission.createdAt
    ? new Date(submission.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const photoSrc = submission.photoUrl || `/api/submissions/${submission.id || submission._id}/photo`;

  return (
    <div
      onClick={() => onClick(submission)}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        willChange: 'transform',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Photo Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '66.6%', // 3:2 standard photo ratio
          backgroundColor: '#EBEBE6',
          overflow: 'hidden',
        }}
      >
        {/* Shimmer Placeholder when loading */}
        {!imageLoaded && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, #f0f0ee 25%, #e4e4e0 50%, #f0f0ee 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        )}

        <img
          src={photoSrc}
          alt={submission.title || submission.originalFileName}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.25s ease-out',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: 2,
          }}
        >
          <StatusBadge status={submission.status} isWinner={submission.isWinner} />
        </div>
      </div>

      {/* Metadata Section */}
      <div
        style={{
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: '14px',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '180px',
            }}
          >
            {submission.title || submission.originalFileName}
          </div>

          {submission.score !== null && submission.score !== undefined && (
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {submission.score} pts
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <span>{submission.participantName}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
});
