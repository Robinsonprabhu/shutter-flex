const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getAdminMe,
} = require('../controllers/authController');
const {
  getAdminStats,
  getAdminSubmissions,
  getAdminSubmissionById,
  updateSubmissionStatus,
  updateSubmissionScore,
  updateSubmissionComment,
  setSubmissionWinner,
  getAdminParticipants,
  createAdminParticipant,
  deleteSubmission,
} = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

// Public Admin Auth
router.post('/login', adminLogin);

// Protected Admin & Judging Routes
router.get('/me', requireAdmin, getAdminMe);
router.get('/stats', requireAdmin, getAdminStats);

// Submissions management
router.get('/submissions', requireAdmin, getAdminSubmissions);
router.get('/submissions/:id', requireAdmin, getAdminSubmissionById);
router.patch('/submissions/:id/status', requireAdmin, updateSubmissionStatus);
router.patch('/submissions/:id/score', requireAdmin, updateSubmissionScore);
router.patch('/submissions/:id/comment', requireAdmin, updateSubmissionComment);
router.patch('/submissions/:id/winner', requireAdmin, setSubmissionWinner);
router.delete('/submissions/:id', requireAdmin, deleteSubmission);

// Participants management
router.get('/participants', requireAdmin, getAdminParticipants);
router.post('/participants', requireAdmin, createAdminParticipant);

module.exports = router;
