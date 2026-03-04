const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async (retries = 5, delay = 5000) => {
  // Use Google DNS to avoid corporate/local DNS issues with SRV lookups
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`MongoDB connection attempt ${attempt}/${retries}...`);
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('All MongoDB connection attempts failed.');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
