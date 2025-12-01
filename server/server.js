require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
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
