const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');

const participantRoutes = require('./routes/participantRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true, // Allow frontend origin
  credentials: true,
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Shutter Flex API',
    timestamp: new Date().toISOString(),
    gridfs: 'enabled',
  });
});

// API Routes
app.use('/api/participants', participantRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal server error occurred.',
  });
});

const { seedDatabase } = require('./utils/seed');
const Admin = require('./models/Admin');

// Start Server after connecting to Database
const startServer = async () => {
  try {
    await connectDB();
    
    // Auto-seed sample participants, admin, and submissions if database is fresh
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('🌱 Database is fresh. Initializing seed data...');
      try {
        await seedDatabase();
      } catch (seedErr) {
        console.warn('Seed note:', seedErr.message);
      }
    }

    app.listen(PORT, () => {
      console.log(`🚀 Shutter Flex Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (!process.env.VERCEL) {
  startServer();
}

module.exports = app;
