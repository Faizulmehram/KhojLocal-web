// Vercel serverless entry point for the Express backend.
// Every request to /api/* is routed here by vercel.json. Instead of calling
// app.listen() (Vercel does not keep a long-running server on a port), we
// export a handler that ensures the DB is connected, then delegates to Express.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = require('../server/app');
const connectDB = require('../server/config/database');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    res.status(503).json({ message: 'Database connection failed' });
    return;
  }
  return app(req, res);
};
