const mongoose = require('mongoose');
const { Readable } = require('stream');
const Submission = require('../models/Submission');
const Participant = require('../models/Participant');
const { getGridFSBucket } = require('../config/db');

// @desc    Upload photo & create submission
// @route   POST /api/submissions
// @access  Private (Participant)
const createSubmission = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photograph file was attached. Please select an image to upload.',
      });
    }

    const { title, caption } = req.body;
    const participantId = req.participant._id;
    const participantName = req.participant.name;

    // Enforce 1-photo-per-participant rule
    const existingCount = await Submission.countDocuments({ participantId: participantId });
    if (existingCount >= 1) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a photograph. Only one entry per participant is allowed.',
      });
    }

    // Optional duplicate check: prevent uploading exact same filename on the same day
    const existingSubmission = await Submission.findOne({
      participantId: participantId,
      originalFileName: req.file.originalname,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: `A photograph with filename "${req.file.originalname}" was already submitted recently. If this is a new shot, please rename the file.`,
      });
    }

    const bucket = getGridFSBucket();
    const uniqueFilename = `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    // Create readable stream from memory buffer
    const readablePhotoStream = new Readable();
    readablePhotoStream.push(req.file.buffer);
    readablePhotoStream.push(null);

    // Open upload stream to GridFS
    const uploadStream = bucket.openUploadStream(uniqueFilename, {
      contentType: req.file.mimetype,
      metadata: {
        participantId: participantId.toString(),
        participantName: participantName,
        originalName: req.file.originalname,
        uploadedAt: new Date(),
      },
    });

    // Pipe buffer to GridFS
    await new Promise((resolve, reject) => {
      readablePhotoStream
        .pipe(uploadStream)
        .on('error', (err) => {
          console.error('GridFS Upload Stream Error:', err);
          reject(err);
        })
        .on('finish', () => {
          resolve(uploadStream.id);
        });
    });

    const photoFileId = uploadStream.id;

    // Create submission record in MongoDB
    const submission = await Submission.create({
      participantId: participantId,
      participantName: participantName,
      title: (title || '').trim(),
      caption: (caption || '').trim(),
      photoFileId: photoFileId,
      originalFileName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      status: 'pending',
      score: null,
      judgeComment: '',
      isWinner: false,
    });

    return res.status(201).json({
      success: true,
      message: 'Photograph uploaded and registered successfully for judging!',
      submission: {
        id: submission._id,
        title: submission.title,
        caption: submission.caption,
        photoFileId: submission.photoFileId,
        originalFileName: submission.originalFileName,
        mimeType: submission.mimeType,
        fileSize: submission.fileSize,
        status: submission.status,
        score: submission.score,
        judgeComment: submission.judgeComment,
        isWinner: submission.isWinner,
        createdAt: submission.createdAt,
        photoUrl: `/api/submissions/${submission._id}/photo`,
      },
    });
  } catch (error) {
    console.error('Create Submission Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete submission. ' + (error.message || ''),
    });
  }
};

// @desc    Get logged in participant's submissions
// @route   GET /api/submissions/my
// @access  Private (Participant)
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ participantId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = submissions.map((sub) => ({
      id: sub._id,
      title: sub.title,
      caption: sub.caption,
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
    console.error('Get My Submissions Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not fetch your submissions.',
    });
  }
};

// In-memory cache for photo file metadata & exhibition data to minimize DB round-trips
const photoMetaCache = new Map();
let exhibitionCache = { data: null, timestamp: 0 };
const EXHIBITION_CACHE_TTL_MS = 15000; // 15 seconds

const invalidateExhibitionCache = () => {
  exhibitionCache = { data: null, timestamp: 0 };
};

// @desc    Stream photograph directly from GridFS with high-performance caching & ETags
// @route   GET /api/submissions/:id/photo
// @access  Public
const getSubmissionPhoto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid photo/submission identifier.',
      });
    }

    // Check fast metadata cache
    let cachedMeta = photoMetaCache.get(id);

    if (!cachedMeta) {
      let photoFileId = null;
      let mimeType = 'image/jpeg';
      let originalFileName = 'photograph.jpg';

      // Check if ID is a submission ID or direct GridFS photoFileId
      const submission = await Submission.findById(id).select('photoFileId mimeType originalFileName').lean();
      if (submission) {
        photoFileId = submission.photoFileId;
        mimeType = submission.mimeType || 'image/jpeg';
        originalFileName = submission.originalFileName;
      } else {
        photoFileId = new mongoose.Types.ObjectId(id);
      }

      const bucket = getGridFSBucket();
      const files = await bucket.find({ _id: new mongoose.Types.ObjectId(photoFileId) }).project({ contentType: 1, length: 1, filename: 1 }).toArray();

      if (!files || files.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Photograph not found in archive.',
        });
      }

      const fileMeta = files[0];
      cachedMeta = {
        photoFileId: photoFileId.toString(),
        contentType: fileMeta.contentType || mimeType,
        length: fileMeta.length,
        filename: fileMeta.filename || originalFileName,
        etag: `"${photoFileId}_${fileMeta.length}"`,
      };

      // Keep cache size bounded (max 500 items)
      if (photoMetaCache.size > 500) {
        const firstKey = photoMetaCache.keys().next().value;
        photoMetaCache.delete(firstKey);
      }
      photoMetaCache.set(id, cachedMeta);
    }

    // Check ETag for 304 Not Modified (instant client response, 0 byte transfer)
    if (req.headers['if-none-match'] === cachedMeta.etag) {
      return res.status(304).end();
    }

    res.setHeader('Content-Type', cachedMeta.contentType);
    if (cachedMeta.length) {
      res.setHeader('Content-Length', cachedMeta.length);
    }
    res.setHeader('ETag', cachedMeta.etag);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('Content-Disposition', `inline; filename="${cachedMeta.filename}"`);

    const bucket = getGridFSBucket();
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(cachedMeta.photoFileId));

    downloadStream.on('error', (error) => {
      console.error('GridFS Download Stream Error:', error);
      if (!res.headersSent) {
        res.status(404).json({
          success: false,
          message: 'Unable to stream requested photograph.',
        });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Get Photo Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Server error retrieving photograph.',
      });
    }
  }
};

// @desc    Get public winner and exhibition spotlight with short in-memory cache
// @route   GET /api/submissions/exhibition
// @access  Public
const getExhibitionSubmissions = async (req, res) => {
  try {
    const now = Date.now();
    if (exhibitionCache.data && now - exhibitionCache.timestamp < EXHIBITION_CACHE_TTL_MS) {
      return res.status(200).json(exhibitionCache.data);
    }

    const [winner, shortlisted] = await Promise.all([
      Submission.findOne({ isWinner: true })
        .select('title caption participantName originalFileName createdAt score judgeComment')
        .lean(),
      Submission.find({ status: 'shortlisted', isWinner: { $ne: true } })
        .select('title caption participantName createdAt score')
        .sort({ score: -1, createdAt: -1 })
        .limit(16)
        .lean(),
    ]);

    const winnerData = winner
      ? {
          id: winner._id,
          title: winner.title,
          caption: winner.caption,
          participantName: winner.participantName,
          originalFileName: winner.originalFileName,
          createdAt: winner.createdAt,
          score: winner.score,
          judgeComment: winner.judgeComment,
          photoUrl: `/api/submissions/${winner._id}/photo`,
        }
      : null;

    const shortlistedData = shortlisted.map((item) => ({
      id: item._id,
      title: item.title,
      caption: item.caption,
      participantName: item.participantName,
      createdAt: item.createdAt,
      score: item.score,
      photoUrl: `/api/submissions/${item._id}/photo`,
    }));

    const responseData = {
      success: true,
      hasWinner: Boolean(winner),
      winner: winnerData,
      shortlisted: shortlistedData,
    };

    exhibitionCache = { data: responseData, timestamp: now };
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Get Exhibition Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load exhibition data.',
    });
  }
};

module.exports = {
  createSubmission,
  getMySubmissions,
  getSubmissionPhoto,
  getExhibitionSubmissions,
};
