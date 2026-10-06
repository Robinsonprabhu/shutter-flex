const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const Participant = require('../models/Participant');
const { getGridFSBucket } = require('../config/db');

let adminStatsCache = { data: null, timestamp: 0 };
const STATS_CACHE_TTL = 3000; // 3 seconds fast cache

const invalidateStatsCache = () => {
  adminStatsCache = { data: null, timestamp: 0 };
};

// @desc    Get dashboard metrics & overview stats with parallel aggregation
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    const now = Date.now();
    if (adminStatsCache.data && now - adminStatsCache.timestamp < STATS_CACHE_TTL) {
      return res.status(200).json(adminStatsCache.data);
    }

    const [
      totalParticipants,
      totalSubmissions,
      pendingSubmissions,
      shortlistedSubmissions,
      rejectedSubmissions,
      winnerSubmissions,
      currentWinner,
    ] = await Promise.all([
      Participant.countDocuments({ isActive: true }),
      Submission.countDocuments(),
      Submission.countDocuments({ status: 'pending' }),
      Submission.countDocuments({ status: 'shortlisted' }),
      Submission.countDocuments({ status: 'rejected' }),
      Submission.countDocuments({ isWinner: true }),
      Submission.findOne({ isWinner: true })
        .select('title participantName score')
        .lean(),
    ]);

    const statsPayload = {
      success: true,
      stats: {
        totalParticipants,
        totalSubmissions,
        pendingSubmissions,
        shortlistedSubmissions,
        rejectedSubmissions,
        winnerSubmissions,
        hasWinner: Boolean(currentWinner),
        winnerDetails: currentWinner
          ? {
              id: currentWinner._id,
              title: currentWinner.title,
              participantName: currentWinner.participantName,
              score: currentWinner.score,
              photoUrl: `/api/submissions/${currentWinner._id}/photo`,
            }
          : null,
      },
    };

    adminStatsCache = { data: statsPayload, timestamp: now };
    return res.status(200).json(statsPayload);
  } catch (error) {
    console.error('Admin Stats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to aggregate competition statistics.',
    });
  }
};

// @desc    Get all submissions with filtering & search
// @route   GET /api/admin/submissions
// @access  Private (Admin)
const getAdminSubmissions = async (req, res) => {
  try {
    const { status, search, participantId, sortBy = 'createdAt', order = 'desc' } = req.query;

    const filter = {};

    if (status && status !== 'all') {
      if (status === 'winner') {
        filter.isWinner = true;
      } else {
        filter.status = status;
      }
    }

    if (participantId && mongoose.Types.ObjectId.isValid(participantId)) {
      filter.participantId = participantId;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { participantName: searchRegex },
        { title: searchRegex },
        { originalFileName: searchRegex },
      ];
    }

    const sortOption = {};
    const sortField = sortBy === 'score' ? 'score' : 'createdAt';
    sortOption[sortField] = order === 'asc' ? 1 : -1;

    const submissions = await Submission.find(filter)
      .populate('participantId', 'name participantId email phone')
      .sort(sortOption)
      .lean();

    const formatted = submissions.map((sub) => ({
      id: sub._id,
      title: sub.title,
      caption: sub.caption,
      participantId: sub.participantId?._id || sub.participantId,
      participantName: sub.participantName,
      participantCode: sub.participantId?.participantId || 'N/A',
      participantEmail: sub.participantId?.email || '',
      photoFileId: sub.photoFileId,
      originalFileName: sub.originalFileName,
      mimeType: sub.mimeType,
      fileSize: sub.fileSize,
      status: sub.status,
      score: sub.score,
      judgeComment: sub.judgeComment,
      isWinner: sub.isWinner,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
      photoUrl: `/api/submissions/${sub._id}/photo`,
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      submissions: formatted,
    });
  } catch (error) {
    console.error('Admin Submissions Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions.',
    });
  }
};

// @desc    Get single submission detail
// @route   GET /api/admin/submissions/:id
// @access  Private (Admin)
const getAdminSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID.',
      });
    }

    const submission = await Submission.findById(id)
      .populate('participantId', 'name participantId email phone createdAt')
      .lean();

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.',
      });
    }

    return res.status(200).json({
      success: true,
      submission: {
        id: submission._id,
        title: submission.title,
        caption: submission.caption,
        participantId: submission.participantId?._id,
        participantName: submission.participantName,
        participantDetails: submission.participantId,
        photoFileId: submission.photoFileId,
        originalFileName: submission.originalFileName,
        mimeType: submission.mimeType,
        fileSize: submission.fileSize,
        status: submission.status,
        score: submission.score,
        judgeComment: submission.judgeComment,
        isWinner: submission.isWinner,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        photoUrl: `/api/submissions/${submission._id}/photo`,
      },
    });
  } catch (error) {
    console.error('Get Submission Detail Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching submission details.',
    });
  }
};

// @desc    Update submission status (pending, shortlisted, rejected, winner)
// @route   PATCH /api/admin/submissions/:id/status
// @access  Private (Admin)
const updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'shortlisted', 'rejected', 'winner'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.',
      });
    }

    submission.status = status;
    if (status !== 'winner') {
      submission.isWinner = false;
    } else {
      submission.isWinner = true;
    }

    await submission.save();
    invalidateStatsCache();

    return res.status(200).json({
      success: true,
      message: `Status updated to "${status}".`,
      submission: {
        id: submission._id,
        status: submission.status,
        isWinner: submission.isWinner,
      },
    });
  } catch (error) {
    console.error('Update Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update submission status.',
    });
  }
};

// @desc    Update submission score (0 to 100)
// @route   PATCH /api/admin/submissions/:id/score
// @access  Private (Admin)
const updateSubmissionScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { score } = req.body;

    const numericScore = score === null || score === '' ? null : Number(score);
    if (numericScore !== null && (isNaN(numericScore) || numericScore < 0 || numericScore > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Score must be a number between 0 and 100.',
      });
    }

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.',
      });
    }

    submission.score = numericScore;
    await submission.save();

    return res.status(200).json({
      success: true,
      message: 'Score recorded successfully.',
      score: submission.score,
    });
  } catch (error) {
    console.error('Update Score Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update score.',
    });
  }
};

// @desc    Update judge editorial commentary
// @route   PATCH /api/admin/submissions/:id/comment
// @access  Private (Admin)
const updateSubmissionComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { judgeComment } = req.body;

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.',
      });
    }

    submission.judgeComment = (judgeComment || '').trim();
    await submission.save();

    return res.status(200).json({
      success: true,
      message: 'Judge critique saved.',
      judgeComment: submission.judgeComment,
    });
  } catch (error) {
    console.error('Update Comment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save judge comments.',
    });
  }
};

// @desc    Designate or remove submission as champion winner
// @route   PATCH /api/admin/submissions/:id/winner
// @access  Private (Admin)
const setSubmissionWinner = async (req, res) => {
  try {
    const { id } = req.params;
    const { isWinner } = req.body;

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.',
      });
    }

    if (isWinner) {
      // Unset previous winner to ensure single title holder
      await Submission.updateMany(
        { isWinner: true, _id: { $ne: submission._id } },
        { $set: { isWinner: false, status: 'shortlisted' } }
      );

      submission.isWinner = true;
      submission.status = 'winner';
    } else {
      submission.isWinner = false;
      submission.status = 'shortlisted';
    }

    await submission.save();
    invalidateStatsCache();

    return res.status(200).json({
      success: true,
      message: isWinner
        ? `Photograph by "${submission.participantName}" has been crowned competition winner!`
        : 'Winner status has been retracted.',
      submission: {
        id: submission._id,
        isWinner: submission.isWinner,
        status: submission.status,
      },
    });
  } catch (error) {
    console.error('Set Winner Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update winner status.',
    });
  }
};

// @desc    Get all registered participants + submission counts
// @route   GET /api/admin/participants
// @access  Private (Admin)
const getAdminParticipants = async (req, res) => {
  try {
    const participants = await Participant.find().sort({ createdAt: -1 }).lean();

    // Aggregate submissions per participant
    const submissionCounts = await Submission.aggregate([
      {
        $group: {
          _id: '$participantId',
          total: { $sum: 1 },
          hasWinner: { $max: { $cond: ['$isWinner', 1, 0] } },
        },
      },
    ]);

    const countMap = {};
    submissionCounts.forEach((sc) => {
      countMap[sc._id.toString()] = {
        total: sc.total,
        hasWinner: sc.hasWinner === 1,
      };
    });

    const formatted = participants.map((p) => ({
      id: p._id,
      name: p.name,
      participantId: p.participantId,
      college: p.college || 'N/A',
      email: p.email,
      phone: p.phone,
      isActive: p.isActive,
      createdAt: p.createdAt,
      submissionCount: countMap[p._id.toString()]?.total || 0,
      hasWinner: Boolean(countMap[p._id.toString()]?.hasWinner),
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      participants: formatted,
    });
  } catch (error) {
    console.error('Get Participants Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch registered participants.',
    });
  }
};

// @desc    Register a new participant (from Admin panel)
// @route   POST /api/admin/participants
// @access  Private (Admin)
const createAdminParticipant = async (req, res) => {
  try {
    const { name, college, email, phone, participantId } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Participant name is required.',
      });
    }

    const cleanName = name.trim();
    let generatedId = (participantId || '').trim();

    if (!generatedId) {
      const count = await Participant.countDocuments();
      generatedId = `SF-${1000 + count + 1}`;
    }

    const existing = await Participant.findOne({
      $or: [
        { normalizedName: cleanName.toLowerCase() },
        { participantId: generatedId },
      ],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A participant with name "${cleanName}" or ID "${generatedId}" already exists.`,
      });
    }

    const participant = await Participant.create({
      name: cleanName,
      normalizedName: cleanName.toLowerCase(),
      college: (college || '').trim(),
      participantId: generatedId,
      email: (email || '').trim().toLowerCase(),
      phone: (phone || '').trim(),
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: `Participant "${participant.name}" (${participant.participantId}) successfully registered.`,
      participant: {
        id: participant._id,
        name: participant.name,
        college: participant.college,
        participantId: participant.participantId,
        email: participant.email,
        phone: participant.phone,
      },
    });
  } catch (error) {
    console.error('Create Participant Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create participant record.',
    });
  }
};

// @desc    Delete submission & remove GridFS binary
// @route   DELETE /api/admin/submissions/:id
// @access  Private (Admin)
const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.',
      });
    }

    // Delete photo from GridFS
    try {
      const bucket = getGridFSBucket();
      await bucket.delete(new mongoose.Types.ObjectId(submission.photoFileId));
    } catch (gfsErr) {
      console.warn('GridFS binary delete note:', gfsErr.message);
    }

    await Submission.findByIdAndDelete(id);
    invalidateStatsCache();

    return res.status(200).json({
      success: true,
      message: 'Submission removed from competition archive.',
    });
  } catch (error) {
    console.error('Delete Submission Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete submission.',
    });
  }
};

module.exports = {
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
};
