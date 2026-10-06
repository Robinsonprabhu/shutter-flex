const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
      required: [true, 'Participant reference is required'],
      index: true,
    },
    participantName: {
      type: String,
      required: [true, 'Participant name is required'],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    caption: {
      type: String,
      trim: true,
      default: '',
    },
    photoFileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'GridFS photo file ID is required'],
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'rejected', 'winner'],
      default: 'pending',
      index: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    judgeComment: {
      type: String,
      trim: true,
      default: '',
    },
    isWinner: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ participantId: 1 }, { unique: true });
submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ status: 1, score: -1 });

module.exports = mongoose.model('Submission', submissionSchema);
