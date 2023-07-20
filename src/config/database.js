// Import the required dependencies
const mongoose = require('mongoose');

// Define the database connection URL
const dbURL = process.env.DB_URL;

// Connect to the database
mongoose.connect(dbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Get the default connection
const db = mongoose.connection;

// Event handlers for the database connection
db.on('error', (error) => {
  console.error('Database connection error:', error);
});

db.on('connected', () => {
  console.log('Connected to the database');
  //require('../../test/test1');
  require('../../test/test');
});

db.on('disconnected', () => {
  console.log('Disconnected from the database');
});

// Export the database connection
module.exports = db;