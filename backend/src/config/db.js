const mongoose = require('mongoose');

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
      const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

      const connectionOptions = {
        dbName: dbName,
        maxPoolSize: isServerless ? 10 : 50,
        minPoolSize: 1,
        serverSelectionTimeoutMS: 6000,
        socketTimeoutMS: 30000,
      };

      if (!uri || uri.trim() === '') {
        if (!isServerless) {
          try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            if (!mongoMemoryServerInstance) {
              console.log('⚡ Starting local MongoDB Memory Server...');
              mongoMemoryServerInstance = await MongoMemoryServer.create();
            }
            uri = mongoMemoryServerInstance.getUri();
          } catch (memErr) {
            console.warn('MongoMemoryServer not available:', memErr.message);
          }
        }
      } else {
        console.log(`Connecting to MongoDB database "${dbName}"...`);
      }

      let conn;
      try {
        conn = await mongoose.connect(uri, connectionOptions);
      } catch (atlasErr) {
        console.warn('⚠️ Primary MongoDB connection failed:', atlasErr.message);

        // In local non-serverless dev, fallback to memory server if Atlas IP is blocked
        if (!isServerless) {
          try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            if (!mongoMemoryServerInstance) {
              console.warn('Spinning up In-Memory MongoDB Server for local access...');
              mongoMemoryServerInstance = await MongoMemoryServer.create();
            }
            const memUri = mongoMemoryServerInstance.getUri();
            conn = await mongoose.connect(memUri, {
              dbName: dbName,
              maxPoolSize: 20,
            });
          } catch (fallbackErr) {
            throw new Error(`MongoDB connection failed: ${atlasErr.message}`);
          }
        } else {
          // On Vercel / serverless: Atlas is required.
          throw new Error(
            `MongoDB Atlas connection failed (${atlasErr.message}). ` +
            'Please ensure IP 0.0.0.0/0 (Allow Access From Anywhere) is whitelisted in your MongoDB Atlas dashboard under Network Access.'
          );
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
