// Serverless function wrapper for Express app
require('dotenv').config();
const app = require('../server/server');

module.exports = app;
