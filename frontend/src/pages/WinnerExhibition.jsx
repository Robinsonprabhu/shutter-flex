import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { X, Trophy } from 'lucide-react';

export const WinnerExhibition = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchExhibition = async () => {
      try {
        setLoading(true);
        const res = await api.getPublicExhibition();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load winners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibition();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: '#FFFFFF' }}>
        Loading exhibition results...
      </div>
    );
  }

  const winner = data?.winner;
  const shortlisted = data?.shortlisted || [];

  return (
    <div style={{ padding: '24px 0 60px 0' }}>
      <div className="app-container">
        <div className="surface-card" style={{ padding: '24px', marginBottom: '24px' }}>
          {/* Page Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--status-winner)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
              Official Salon Results
            </div>
            <h1 style={{ fontSize: '26px', margin: 0 }}>Award Winner & Shortlisted Works</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Shutter Flex 2026 Annual Photography Exhibition
            </p>
          </div>

          {/* Winner Spotlight */}
          {winner ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '40px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--status-winner)', textTransform: 'uppercase', marginBottom: '14px' }}>
                <Trophy size={16} /> First Place • Grand Winner
              </div>

              <div
                className="winner-hero-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px',
                  alignItems: 'center',
                }}
              >
                {/* Photo */}
                <div
                  onClick={() => setSelectedPhoto(winner)}
                  style={{
                    backgroundColor: '#18181b',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                  }}
                >
                  <img
                    src={winner.photoUrl}
                    alt={winner.title}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '400px',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </div>

                {/* Winner Information */}
                <div>
                  <h2 style={{ fontSize: '22px', marginBottom: '4px' }}>
                    {winner.title || winner.originalFileName}
                  </h2>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                    Photographer: {winner.participantName}
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    Score: <strong>{winner.score ? `${winner.score}/100 pts` : 'Top Award'}</strong>
                  </div>

                  {winner.caption && (
                    <p style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '14px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      "{winner.caption}"
                    </p>
                  )}

                  {winner.judgeComment && (
                    <div
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderLeft: '3px solid var(--text-primary)',
                        padding: '12px 14px',
                        borderRadius: '0 4px 4px 0',
                        fontSize: '13px',
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: '2px' }}>Curator Citation</div>
                      <div style={{ color: 'var(--text-secondary)' }}>"{winner.judgeComment}"</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '40px 20px',
                textAlign: 'center',
                marginBottom: '40px',
              }}
            >
              <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>Jury Deliberation in Progress</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                The official competition winner has not yet been announced.
              </p>
            </div>
          )}

          {/* Shortlisted Finalists */}
          <div>
            <h2 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '18px' }}>
              Shortlisted Works
            </h2>

            {shortlisted.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                No additional shortlisted works to display.
              </p>
            ) : (
              <div
                className="exhibition-gallery-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '18px',
                }}
              >
                {shortlisted.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPhoto(item)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ position: 'relative', width: '100%', paddingTop: '66.6%', backgroundColor: '#18181b' }}>
                      <img
                        src={item.photoUrl}
                        alt={item.title}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>

                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {item.participantName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div
            className="modal-container"
            style={{
              maxWidth: '850px',
              width: '100%',
              padding: '18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', margin: 0 }}>{selectedPhoto.title}</h3>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {selectedPhoto.participantName}
                </div>
              </div>
              <button onClick={() => setSelectedPhoto(null)} style={{ color: 'var(--text-muted)', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                backgroundColor: '#18181b',
                borderRadius: '6px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: '62vh',
              }}
            >
              <img
                src={selectedPhoto.photoUrl}
                alt={selectedPhoto.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '60vh',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Responsive Grid Override */}
      <style>{`
        @media (max-width: 600px) {
          .winner-hero-grid,
          .exhibition-gallery-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
