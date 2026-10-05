const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let gfsBucket = null;
let mongoMemoryServerInstance = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    if (!gfsBucket && mongoose.connection.db) {
      gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'photos',
      });
    }
    return mongoose.connection;
  }

  try {
    let uri = process.env.MONGODB_URI;
    const dbName = process.env.DATABASE_NAME || 'shutter_flex';

    if (!uri || uri.trim() === '') {
      console.log('⚡ No MONGODB_URI configured. Starting local MongoDB Memory Server for zero-friction development...');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      uri = mongoMemoryServerInstance.getUri();
      console.log(`✅ In-Memory MongoDB Server running at: ${uri}`);
    } else {
      console.log(`Connecting to MongoDB Atlas database "${dbName}"...`);
    }

    const conn = await mongoose.connect(uri, {
      dbName: dbName,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Initialize GridFS bucket
    gfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
      bucketName: 'photos',
    });
    console.log('✅ GridFS Bucket ("photos") initialized successfully.');

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // If Atlas connection failed and no fallback was running, fallback to memory server to ensure app remains usable
    if (!mongoMemoryServerInstance) {
      console.log('⚠️ Falling back to In-Memory MongoDB Server so the application can run offline/locally...');
      try {
        mongoMemoryServerInstance = await MongoMemoryServer.create();
        const memUri = mongoMemoryServerInstance.getUri();
        const conn = await mongoose.connect(memUri, {
          dbName: process.env.DATABASE_NAME || 'shutter_flex',
        });
        gfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
          bucketName: 'photos',
        });
        console.log('✅ Fallback In-Memory MongoDB & GridFS successfully initialized.');
        return conn;
      } catch (memError) {
        console.error('Fatal: Could not initialize fallback database:', memError);
        process.exit(1);
      }
    }
    process.exit(1);
  }
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
