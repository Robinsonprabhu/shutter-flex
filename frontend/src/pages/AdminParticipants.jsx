import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { X } from 'lucide-react';

export const AdminParticipants = () => {
  const { showToast } = useAuth();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Participant Form State
  const [newName, setNewName] = useState('');
  const [newCollege, setNewCollege] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newId, setNewId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminParticipants();
      if (res.success) {
        setParticipants(res.participants);
      }
    } catch (err) {
      console.error('Failed to load participants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('Participant name is required.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createAdminParticipant({
        name: newName,
        college: newCollege,
        email: newEmail,
        phone: newPhone,
        participantId: newId,
      });

      if (res.success) {
        showToast(res.message, 'success');
        setShowAddModal(false);
        setNewName('');
        setNewCollege('');
        setNewEmail('');
        setNewPhone('');
        setNewId('');
        fetchParticipants();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredParticipants = participants.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.participantId.toLowerCase().includes(q) ||
      (p.college && p.college.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ padding: '24px 0 60px 0' }}>
      <div className="app-container">
        <div className="surface-card" style={{ padding: '24px', marginBottom: '24px' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '16px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '24px', margin: 0 }}>Registered Contestants</h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Directory of all on-spot and advance registered participants
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              Add Participant
            </button>
          </div>

          {/* Search */}
          <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <input
              type="text"
              placeholder="Search by name, college, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: '320px', fontSize: '13px' }}
            />

            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Showing {filteredParticipants.length} of {participants.length} contestants
            </span>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading participants...
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                overflowX: 'auto',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '13px' }}>Contestant Name</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '13px' }}>ID Code</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '13px' }}>College / Institution</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '13px' }}>Contact</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '13px', textAlign: 'center' }}>Submissions</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '13px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{p.participantId}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>{p.college || '—'}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {p.email || p.phone || '—'}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600 }}>{p.submissionCount}</td>
                      <td style={{ padding: '12px 14px' }}>
                        {p.hasWinner ? (
                          <StatusBadge status="winner" isWinner={true} />
                        ) : p.submissionCount > 0 ? (
                          <span style={{ fontSize: '13px', color: 'var(--status-shortlisted)', fontWeight: 500 }}>Active</span>
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Registered</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div
            className="modal-container"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', margin: 0 }}>Register New Participant</h3>
              <button onClick={() => setShowAddModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddParticipant}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Julian Thorne"
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                    College / Institution *
                  </label>
                  <input
                    type="text"
                    value={newCollege}
                    onChange={(e) => setNewCollege(e.target.value)}
                    placeholder="e.g. St. Xavier College"
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                    Custom ID Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    placeholder="Leave empty for auto SF-XXXX"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="9876543210"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="you@email.com"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? 'Registering...' : 'Register Contestant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
