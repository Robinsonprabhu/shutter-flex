const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let gfsBucket = null;
let mongoMemoryServerInstance = null;
let isConnectingPromise = null;

const connectDB = async () => {
  // If already connected, ensure GridFS bucket is ready and return fast
  if (mongoose.connection.readyState === 1) {
    if (!gfsBucket && mongoose.connection.db) {
      gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'photos',
      });
    }
    return mongoose.connection;
  }

  // If connection is in progress, await the existing promise
  if (isConnectingPromise) {
    return isConnectingPromise;
  }

  isConnectingPromise = (async () => {
    try {
      let uri = process.env.MONGODB_URI;
      const dbName = process.env.DATABASE_NAME || 'shutter_flex';

      if (!uri || uri.trim() === '') {
        if (!mongoMemoryServerInstance) {
          console.log('⚡ Starting local MongoDB Memory Server...');
          mongoMemoryServerInstance = await MongoMemoryServer.create();
        }
        uri = mongoMemoryServerInstance.getUri();
      } else {
        console.log(`Connecting to MongoDB database "${dbName}"...`);
      }

      let conn;
      try {
        conn = await mongoose.connect(uri, {
          dbName: dbName,
          serverSelectionTimeoutMS: 1500, // Fast 1.5s timeout if Atlas is blocked/unreachable
        });
      } catch (atlasErr) {
        if (!mongoMemoryServerInstance) {
          console.warn('⚠️ Primary MongoDB connection unavailable. Spinning up In-Memory MongoDB Server for instant local access...');
          mongoMemoryServerInstance = await MongoMemoryServer.create();
          const memUri = mongoMemoryServerInstance.getUri();
          conn = await mongoose.connect(memUri, {
            dbName: dbName,
          });
        } else {
          const memUri = mongoMemoryServerInstance.getUri();
          conn = await mongoose.connect(memUri, {
            dbName: dbName,
          });
        }
      }

      // Initialize GridFS bucket
      if (conn && conn.connection && conn.connection.db) {
        gfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
          bucketName: 'photos',
        });
      }

      // Ensure Admin exists in database
      const Admin = require('../models/Admin');
      const adminCount = await Admin.countDocuments().catch(() => 0);
      if (adminCount === 0) {
        console.log('🌱 Fresh DB detected. Auto-seeding default admin & sample data...');
        const { seedDatabase } = require('../utils/seed');
        await seedDatabase().catch((e) => console.warn('Auto-seed note:', e.message));
      }

      return conn;
    } catch (error) {
      console.error(`❌ MongoDB Connection Failure: ${error.message}`);
      throw error;
    } finally {
      isConnectingPromise = null;
    }
  })();

  return isConnectingPromise;
};

const getGridFSBucket = () => {
  if (!gfsBucket) {
    if (mongoose.connection && mongoose.connection.db) {
      gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'photos',
      });
    } else {
      throw new Error('GridFS Bucket is not yet initialized. Database connection required.');
    }
  }
  return gfsBucket;
};

module.exports = {
  connectDB,
  getGridFSBucket,
};
