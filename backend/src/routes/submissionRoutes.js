const express = require('express');
const router = express.Router();
const {
  createSubmission,
  getMySubmissions,
  getSubmissionPhoto,
  getExhibitionSubmissions,
} = require('../controllers/submissionController');
const { requireParticipant } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// Participant submission routes
router.post(
  '/',
  requireParticipant,
  upload.single('photo'),
  handleUploadError,
  createSubmission
);

router.get('/my', requireParticipant, getMySubmissions);

// Public photo streaming and exhibition routes
router.get('/:id/photo', getSubmissionPhoto);
router.get('/exhibition/public', getExhibitionSubmissions);

module.exports = router;
