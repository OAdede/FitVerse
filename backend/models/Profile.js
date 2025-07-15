const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  height: {
    type: Number,
  },
  weight: {
    type: Number,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
  },
  waist: {
    type: Number,
  },
  neck: {
    type: Number,
  },
  activityLevel: {
    type: String,
  },
  goals: {
    type: String,
  },
  weightHistory: [
    {
      weight: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('profile', ProfileSchema); 