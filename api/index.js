const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

const { connectDB } = require('../backend/src/config/db');
const app = require('../backend/src/server');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('Serverless DB Connect Error:', err);
    }
  }
  return app(req, res);
};
