const express = require('express');
const router = express.Router();
const {
  participantLogin,
  participantRegister,
  getParticipantMe,
} = require('../controllers/authController');
const { requireParticipant } = require('../middleware/auth');

router.post('/register', participantRegister);
router.post('/login', participantLogin);
router.get('/me', requireParticipant, getParticipantMe);

module.exports = router;
