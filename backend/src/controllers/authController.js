const Participant = require('../models/Participant');
const Admin = require('../models/Admin');
const { generateToken } = require('../middleware/auth');

// @desc    On-spot participant self-registration
// @route   POST /api/participants/register
// @access  Public
const participantRegister = async (req, res) => {
  try {
    const { name, college, email, phone } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Participant full name is required.',
      });
    }

    const cleanName = name.trim();
    const normalizedName = cleanName.toLowerCase();

    // Check if name already registered to prevent duplicates
    const existing = await Participant.findOne({ normalizedName: normalizedName });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `"${cleanName}" is already registered. Please sign in directly using your name, or add an initial if multiple participants share this name.`,
      });
    }

    // Auto-generate unique participant ID (e.g. SF-1006)
    const count = await Participant.countDocuments();
    const generatedId = `SF-${1000 + count + 1}`;

    const participant = await Participant.create({
      name: cleanName,
      normalizedName: normalizedName,
      college: (college || '').trim(),
      participantId: generatedId,
      email: (email || '').trim().toLowerCase(),
      phone: (phone || '').trim(),
      isActive: true,
    });

    const token = generateToken({
      id: participant._id,
      name: participant.name,
      participantId: participant.participantId,
      college: participant.college,
      role: 'participant',
    });

    return res.status(201).json({
      success: true,
      message: `Registration complete! Welcome, ${participant.name}`,
      token,
      participant: {
        id: participant._id,
        name: participant.name,
        participantId: participant.participantId,
        college: participant.college,
        email: participant.email,
        phone: participant.phone,
      },
    });
  } catch (error) {
    console.error('Participant Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete on-spot registration.',
    });
  }
};

// @desc    Participant login by registered name or ID
// @route   POST /api/participants/login
// @access  Public
const participantLogin = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please enter your registered participant name.',
      });
    }

    const cleanName = name.trim();
    const normalizedInput = cleanName.toLowerCase();

    // Check if matching name or participantId
    const participant = await Participant.findOne({
      $or: [
        { normalizedName: normalizedInput },
        { participantId: { $regex: new RegExp(`^${cleanName}$`, 'i') } },
        { name: { $regex: new RegExp(`^${cleanName}$`, 'i') } },
      ],
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: `No registration found for "${cleanName}". Please check the spelling or register above.`,
      });
    }

    if (!participant.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This participant account has been deactivated.',
      });
    }

    const token = generateToken({
      id: participant._id,
      name: participant.name,
      participantId: participant.participantId,
      college: participant.college,
      role: 'participant',
    });

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${participant.name}`,
      token,
      participant: {
        id: participant._id,
        name: participant.name,
        participantId: participant.participantId,
        college: participant.college,
        email: participant.email,
        phone: participant.phone,
      },
    });
  } catch (error) {
    console.error('Participant Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login authentication.',
    });
  }
};

// @desc    Get current authenticated participant profile
// @route   GET /api/participants/me
// @access  Private (Participant)
const getParticipantMe = async (req, res) => {
  try {
    const participant = await Participant.findById(req.user.id);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant account not found.',
      });
    }

    return res.status(200).json({
      success: true,
      participant: {
        id: participant._id,
        name: participant.name,
        participantId: participant.participantId,
        college: participant.college,
        email: participant.email,
        phone: participant.phone,
        createdAt: participant.createdAt,
      },
    });
  } catch (error) {
    console.error('Get Participant Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve participant profile.',
    });
  }
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const rawInput = (username || email || '').toString().trim();
    const identifier = rawInput.toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username/email and passkey.',
      });
    }

    // Flexible search across all possible admin identifier formats
    let admin = await Admin.findOne({
      $or: [
        { email: identifier },
        { email: `${identifier}@shutterflex.com` },
        { email: `${identifier}@admin.com` },
        { email: 'admin@shutterflex.com' },
        { email: 'shutterflex@admin.com' },
        { email: 'shutterflex' },
      ],
    });

    // If identifier is default 'shutterflex' or 'admin', pick any existing admin
    if (!admin && (identifier === 'shutterflex' || identifier === 'admin')) {
      admin = await Admin.findOne();
    }

    // Auto-create default admin if no admin user exists in DB yet
    if (!admin && (identifier === 'shutterflex' || identifier === 'admin' || identifier === 'admin@shutterflex.com')) {
      if (password === 'aidex26' || password === 'admin123') {
        admin = new Admin({
          name: 'Chief Curator / Judge',
          email: 'shutterflex@admin.com',
          password: 'aidex26',
          role: 'admin',
        });
        await admin.save();
        console.log('✅ Auto-created default admin account on login.');
      }
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.',
      });
    }

    // Validate passkey (support default fallback 'aidex26' or hashed password)
    const isMatch = (password === 'aidex26') || (await admin.matchPassword(password).catch(() => false));
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid passkey.',
      });
    }

    const token = generateToken({
      id: admin._id,
      name: admin.name || 'Admin',
      email: admin.email,
      role: admin.role,
    });

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      admin: {
        id: admin._id,
        name: admin.name || 'Admin',
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during admin authentication.',
    });
  }
};

// @desc    Get current authenticated admin profile
// @route   GET /api/admin/me
// @access  Private (Admin)
const getAdminMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrator account not found.',
      });
    }

    return res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Get Admin Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin profile.',
    });
  }
};

module.exports = {
  participantRegister,
  participantLogin,
  getParticipantMe,
  adminLogin,
  getAdminMe,
};
