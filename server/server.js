require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const { authenticateAPIKey, rateLimit, sanitizeInput } = require('./middleware/auth');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration - allow all origins for development/production
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: false
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(sanitizeInput);

// Routes - NO AUTHENTICATION MIDDLEWARE
app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/parties', require('./routes/parties'));
app.use('/api/commodities', require('./routes/commodities'));
app.use('/api/payment-terms', require('./routes/paymentTerms'));
app.use('/api/bank-details', require('./routes/bankDetails'));
app.use('/api/export', require('./routes/export'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Export Contract Generator API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
