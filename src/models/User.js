const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name:  {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobile_phone: {
    type: Number,
    required: true,
  },
  birth_date: {
    type: Date,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  city:  {
    type: String,
    required: true,
  },
  gender:  {
    type: String,
    required: true,
  },
  photo_url: {
    type: String,
    required: true,
  },
  user_type: {
    type: String,
    enum: ['Customer',
					 'BusinessManager',
					 'Employee',
					 'Specialist',
					 'Administrator'],
    required: true,
  },
  // Additional fields for different user types
  company_position: String,
  specialty: String,
  expertise: String,
  licence: String,
  description: String,
  offered_services: String,
  therapy_price: Number,
  consultation_price: Number,
  years_of_experience: Number,
  professional_experience: String,
  age: Number,
  
  encryptedRefreshToken: {
    type: String,
    required: false,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = {
  User,
};