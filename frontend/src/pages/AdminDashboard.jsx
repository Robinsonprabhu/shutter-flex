import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { PhotoCard } from '../components/PhotoCard';
import { JudgingModal } from '../components/JudgingModal';
import { RefreshCw, Search } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Filter tabs
  const [activeTab, setActiveTab] = useState('all'); // all, pending, shortlisted, winner, rejected
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, subsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminSubmissions({
          status: activeTab,
          search: searchQuery,
          sortBy: sortBy,
          order: sortOrder,
        }),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (subsRes.success) setSubmissions(subsRes.submissions);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleSubmissionUpdate = (updatedSub, isDeleted = false) => {
    if (isDeleted) {
      setSubmissions((prev) => prev.filter((s) => (s.id || s._id) !== (selectedSubmission?.id || selectedSubmission?._id)));
      setSelectedSubmission(null);
    } else if (updatedSub) {
      setSubmissions((prev) =>
        prev.map((s) => ((s.id || s._id) === (updatedSub.id || updatedSub._id) ? updatedSub : s))
      );
      setSelectedSubmission(updatedSub);
    }
    api.getAdminStats().then((res) => {
      if (res.success) setStats(res.stats);
    });
  };

  return (
    <div style={{ padding: '24px 0 60px 0' }}>
      <div className="app-container">
        {/* Main Card Container */}
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
              <h1 style={{ fontSize: '24px', margin: 0 }}>Jury & Admin Dashboard</h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Curate, evaluate, and award competition entries
              </p>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '6px 14px' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Statistics Grid - Responsive for mobile */}
          <div
            className="admin-stats-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '10px',
              marginBottom: '24px',
            }}
          >
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Entrants
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '2px' }}>
                {stats?.totalParticipants ?? '-'}
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Submissions
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '2px' }}>
                {stats?.totalSubmissions ?? '-'}
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--status-pending)', textTransform: 'uppercase', fontWeight: 600 }}>
                Pending Review
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--status-pending)', marginTop: '2px' }}>
                {stats?.pendingSubmissions ?? '-'}
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--status-shortlisted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Shortlisted
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--status-shortlisted)', marginTop: '2px' }}>
                {stats?.shortlistedSubmissions ?? '-'}
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--status-winner)', textTransform: 'uppercase', fontWeight: 600 }}>
                Champion Winner
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: stats?.hasWinner ? 'var(--status-winner)' : 'var(--text-muted)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {stats?.hasWinner ? stats.winnerDetails?.participantName : 'Not Chosen'}
              </div>
            </div>
          </div>

          {/* Filters, Search & Sort Bar */}
          <div
            className="admin-filter-bar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            {/* Filter Tabs */}
            <div
              className="admin-tab-scroll"
              style={{
                display: 'flex',
                gap: '4px',
                overflowX: 'auto',
                paddingBottom: '2px',
                maxWidth: '100%',
              }}
            >
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'shortlisted', label: 'Shortlist' },
                { id: 'winner', label: 'Winner' },
                { id: 'rejected', label: 'Rejected' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    backgroundColor: activeTab === tab.id ? 'var(--accent-dark)' : '#FFFFFF',
                    color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search & Sort */}
            <div
              className="admin-search-group"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <form onSubmit={handleSearchSubmit} style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                <input
                  type="text"
                  placeholder="Search contestant / title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '32px', fontSize: '13px', padding: '8px 10px' }}
                />
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </form>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sb, so] = e.target.value.split('-');
                  setSortBy(sb);
                  setSortOrder(so);
                }}
                style={{ fontSize: '13px', padding: '8px 10px', width: 'auto' }}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="score-desc">Highest Score</option>
              </select>
            </div>
          </div>

          {/* Submissions Grid */}
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading competition submissions...
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
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No entries match this filter.</p>
            </div>
          ) : (
            <div
              className="admin-gallery-grid"
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
                  onClick={() => setSelectedSubmission(sub)}
                  isJudgeView={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Judging Lightbox Modal */}
      {selectedSubmission && (
        <JudgingModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onUpdate={handleSubmissionUpdate}
        />
      )}

      {/* Mobile Responsive Style Overrides */}
      <style>{`
        @media (max-width: 600px) {
          .admin-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .admin-stats-grid > div:last-child {
            grid-column: span 2;
          }
          .admin-filter-bar {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .admin-search-group {
            width: 100% !important;
          }
          .admin-search-group form {
            width: 100% !important;
          }
          .admin-gallery-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
