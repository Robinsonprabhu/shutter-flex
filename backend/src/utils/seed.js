const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { Readable } = require('stream');
const { connectDB, getGridFSBucket } = require('../config/db');
const Participant = require('../models/Participant');
const Submission = require('../models/Submission');
const Admin = require('../models/Admin');

// Curated high quality photographic artwork in SVG data buffers
const createCuratedPhotoBuffer = (title, category, colorHex1, colorHex2, iconType) => {
  let iconSvg = '';
  if (iconType === 'mountain') {
    iconSvg = `<path d="M100 450 L300 150 L500 450 Z" fill="#2d3748" opacity="0.8"/>
               <path d="M250 450 L450 220 L650 450 Z" fill="#1a202c" opacity="0.9"/>
               <polygon points="300,150 260,210 340,210" fill="#f7fafc"/>
               <polygon points="450,220 410,280 490,280" fill="#f7fafc"/>
               <circle cx="650" cy="120" r="45" fill="#fbd38d" opacity="0.9"/>`;
  } else if (iconType === 'architecture') {
    iconSvg = `<rect x="150" y="100" width="120" height="350" fill="#1a202c" opacity="0.85"/>
               <rect x="300" y="60" width="160" height="390" fill="#2d3748" opacity="0.95"/>
               <rect x="490" y="140" width="140" height="310" fill="#1a202c" opacity="0.8"/>
               <line x1="320" y1="80" x2="440" y2="80" stroke="#fbd38d" stroke-width="4"/>
               <line x1="320" y1="120" x2="440" y2="120" stroke="#fbd38d" stroke-width="2"/>
               <line x1="320" y1="160" x2="440" y2="160" stroke="#fbd38d" stroke-width="2"/>
               <line x1="320" y1="200" x2="440" y2="200" stroke="#fbd38d" stroke-width="2"/>`;
  } else if (iconType === 'portrait') {
    iconSvg = `<circle cx="400" cy="220" r="110" fill="#e2e8f0" opacity="0.3"/>
               <path d="M400 120 Q440 180 400 240 Q360 180 400 120" fill="#f6ad55"/>
               <path d="M250 450 C250 340 320 310 400 310 C480 310 550 340 550 450 Z" fill="#2d3748"/>
               <circle cx="400" cy="210" r="70" fill="#e2e8f0"/>`;
  } else {
    // street / dusk
    iconSvg = `<path d="M0 400 L800 400 L700 450 L100 450 Z" fill="#171923"/>
               <rect x="200" y="240" width="40" height="160" fill="#ecc94b" opacity="0.6"/>
               <circle cx="220" cy="230" r="14" fill="#fefcbf"/>
               <line x1="100" y1="450" x2="350" y2="300" stroke="#f6e05e" stroke-dasharray="10,15" stroke-width="4"/>
               <line x1="700" y1="450" x2="450" y2="300" stroke="#f6e05e" stroke-dasharray="10,15" stroke-width="4"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colorHex1}" />
        <stop offset="100%" stop-color="${colorHex2}" />
      </linearGradient>
      <linearGradient id="overlay" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.85" />
        <stop offset="40%" stop-color="#000000" stop-opacity="0.2" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.1" />
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#bg)"/>
    ${iconSvg}
    <rect width="800" height="500" fill="url(#overlay)"/>
    <text x="50" y="420" font-family="Playfair Display, Georgia, serif" font-size="28" font-weight="bold" fill="#ffffff" letter-spacing="1">${title}</text>
    <text x="50" y="455" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="500" fill="#cbd5e0" letter-spacing="2">${category.toUpperCase()} • SHUTTER FLEX 2026</text>
  </svg>`;

  return Buffer.from(svg, 'utf-8');
};

const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to database for seeding...');
      await connectDB();
    }
    const bucket = getGridFSBucket();

    // 1. Seed Admin Account
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@shutterflex.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    let admin = await Admin.findOne({
      $or: [{ email: 'shutterflex' }, { email: 'shutterflex@admin.com' }, { email: 'admin@shutterflex.com' }],
    });
    if (!admin) {
      admin = new Admin({
        name: 'Chief Curator / Judge',
        email: 'shutterflex@admin.com',
        password: 'aidex26',
        role: 'admin',
      });
      await admin.save();
      console.log('✅ Default Admin created: shutterflex (passkey: aidex26)');
    } else {
      admin.password = 'aidex26';
      await admin.save();
      console.log('✅ Admin passkey updated to: aidex26');
    }

    // 2. Seed Sample Participants
    const sampleParticipantsData = [
      {
        name: 'Elena Rostova',
        normalizedName: 'elena rostova',
        participantId: 'SF-1001',
        college: 'National Institute of Design',
        email: 'elena.rostova@photoexpo.org',
        phone: '+1 (555) 234-8901',
        isActive: true,
      },
      {
        name: 'Marcus Vance',
        normalizedName: 'marcus vance',
        participantId: 'SF-1002',
        college: 'St. Xavier Visual Arts',
        email: 'marcus.v@visualarts.net',
        phone: '+1 (555) 456-7890',
        isActive: true,
      },
      {
        name: 'Aria Chen',
        normalizedName: 'aria chen',
        participantId: 'SF-1003',
        college: 'Metropolitan Arts College',
        email: 'aria.chen@urbanframes.com',
        phone: '+1 (555) 678-9012',
        isActive: true,
      },
      {
        name: 'David Kim',
        normalizedName: 'david kim',
        participantId: 'SF-1004',
        college: 'City Media Academy',
        email: 'd.kim@shutterclub.io',
        phone: '+1 (555) 890-1234',
        isActive: true,
      },
      {
        name: 'Sophia Alvarez',
        normalizedName: 'sophia alvarez',
        participantId: 'SF-1005',
        college: 'Beacon Fine Arts Institute',
        email: 'sophia.alvarez@candidlens.org',
        phone: '+1 (555) 321-6547',
        isActive: true,
      },
    ];

    const seededParticipants = [];
    for (const pData of sampleParticipantsData) {
      let p = await Participant.findOne({ participantId: pData.participantId });
      if (!p) {
        p = await Participant.create(pData);
        console.log(`✅ Created Participant: ${p.name} (${p.participantId})`);
      }
      seededParticipants.push(p);
    }

    // 3. Seed Sample Submissions into GridFS & MongoDB if empty
    const existingCount = await Submission.countDocuments();
    if (existingCount === 0) {
      console.log('Seeding curated photography submissions into GridFS...');

      const submissionsConfig = [
        {
          participantIdx: 0, // Elena
          title: 'Alpine Solitude at Dawn',
          caption: 'Captured at 3,200m altitude in the Swiss Alps with Leica M11. 35mm f/1.4, 1/500s, ISO 64.',
          category: 'Landscape',
          c1: '#1a365d',
          c2: '#2c5282',
          icon: 'mountain',
          filename: 'alpine_solitude.svg',
          mimeType: 'image/svg+xml',
          status: 'winner',
          score: 96,
          judgeComment: 'Masterful control of tonal range, extraordinary golden hour balance, and poignant negative space.',
          isWinner: true,
        },
        {
          participantIdx: 1, // Marcus
          title: 'Monolithic Geometry',
          caption: 'Brutalist architectural lines during overcast noon. Hasselblad X2D, 45mm, f/8, 1/250s, ISO 100.',
          category: 'Architecture',
          c1: '#2d3748',
          c2: '#1a202c',
          icon: 'architecture',
          filename: 'monolithic_geometry.svg',
          mimeType: 'image/svg+xml',
          status: 'shortlisted',
          score: 91,
          judgeComment: 'Sharp rhythm, deliberate angular framing, and exquisite textures on concrete surfaces.',
          isWinner: false,
        },
        {
          participantIdx: 2, // Aria
          title: 'Raindrops & Neon Reflections',
          caption: 'Night street photography in Shinjuku during spring drizzle. Sony A7R V, 50mm f/1.2, 1/160s, ISO 1600.',
          category: 'Street',
          c1: '#4a5568',
          c2: '#2b6cb0',
          icon: 'street',
          filename: 'tokyo_rain.svg',
          mimeType: 'image/svg+xml',
          status: 'shortlisted',
          score: 88,
          judgeComment: 'Vivid mood, natural cinematic atmosphere without over-saturation.',
          isWinner: false,
        },
        {
          participantIdx: 3, // David
          title: 'The Silent Artisan',
          caption: 'Documentary environmental portrait of a 4th generation ceramicist. Fujifilm GFX 100 II, 80mm f/1.7.',
          category: 'Portrait',
          c1: '#744210',
          c2: '#2d3748',
          icon: 'portrait',
          filename: 'silent_artisan.svg',
          mimeType: 'image/svg+xml',
          status: 'pending',
          score: null,
          judgeComment: '',
          isWinner: false,
        },
        {
          participantIdx: 4, // Sophia
          title: 'Nordic Horizon Mist',
          caption: 'Long exposure seascape off the Lofoten coastline. Nikon Z9, 24-70mm f/2.8, 30s exposure with 10-stop ND.',
          category: 'Fine Art',
          c1: '#234e52',
          c2: '#1a202c',
          icon: 'mountain',
          filename: 'nordic_mist.svg',
          mimeType: 'image/svg+xml',
          status: 'pending',
          score: null,
          judgeComment: '',
          isWinner: false,
        },
      ];

      for (const item of submissionsConfig) {
        const participant = seededParticipants[item.participantIdx];
        const buffer = createCuratedPhotoBuffer(item.title, item.category, item.c1, item.c2, item.icon);

        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null);

        const uploadStream = bucket.openUploadStream(`${Date.now()}_${item.filename}`, {
          contentType: item.mimeType,
          metadata: {
            participantId: participant._id.toString(),
            participantName: participant.name,
            title: item.title,
          },
        });

        await new Promise((resolve, reject) => {
          readableStream
            .pipe(uploadStream)
            .on('error', reject)
            .on('finish', resolve);
        });

        await Submission.create({
          participantId: participant._id,
          participantName: participant.name,
          title: item.title,
          caption: item.caption,
          photoFileId: uploadStream.id,
          originalFileName: item.filename,
          mimeType: item.mimeType,
          fileSize: buffer.length,
          status: item.status,
          score: item.score,
          judgeComment: item.judgeComment,
          isWinner: item.isWinner,
        });

        console.log(`📸 Seeded GridFS Submission: "${item.title}" by ${participant.name} (${item.status})`);
      }
    } else {
      console.log(`ℹ️ Database already contains ${existingCount} submissions.`);
    }

    console.log('\n======================================================');
    console.log('✅ DATABASE SEED COMPLETE');
    console.log('Admin Login:');
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('Sample Registered Participants:');
    sampleParticipantsData.forEach((p) => {
      console.log(`   - "${p.name}" (ID: ${p.participantId})`);
    });
    console.log('======================================================\n');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Database Seeding Error:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
