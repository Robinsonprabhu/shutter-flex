const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Participant = require('../models/Participant');

const JWT_SECRET = process.env.JWT_SECRET || 'shutter_flex_super_secret_jwt_key_2026_photo_event';

const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

const verifyToken = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token is missing.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session.',
    });
  }
};

const requireAdmin = async (req, res, next) => {
  await verifyToken(req, res, async () => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'judge')) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Administrator credentials required.',
      });
    }

    try {
      const admin = await Admin.findById(req.user.id).select('-password');
      if (!admin) {
        return res.status(403).json({
          success: false,
          message: 'Admin account not found.',
        });
      }
      req.admin = admin;
      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Authentication verification error.',
      });
    }
  });
};

const requireParticipant = async (req, res, next) => {
  await verifyToken(req, res, async () => {
    if (!req.user || req.user.role !== 'participant') {
      return res.status(403).json({
        success: false,
        message: 'Participant access token required.',
      });
    }

    try {
      const participant = await Participant.findById(req.user.id);
      if (!participant || !participant.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Participant account is inactive or was not found.',
        });
      }
      req.participant = participant;
      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Participant verification error.',
      });
    }
  });
};

module.exports = {
  generateToken,
  verifyToken,
  requireAdmin,
  requireParticipant,
};
