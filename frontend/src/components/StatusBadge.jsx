import React from 'react';

export const StatusBadge = ({ status, isWinner }) => {
  const actualStatus = isWinner ? 'winner' : status || 'pending';

  switch (actualStatus) {
    case 'winner':
      return <span className="status-badge winner">Winner</span>;
    case 'shortlisted':
      return <span className="status-badge shortlisted">Shortlisted</span>;
    case 'rejected':
      return <span className="status-badge rejected">Rejected</span>;
    case 'pending':
    default:
      return <span className="status-badge pending">Pending Review</span>;
  }
};
