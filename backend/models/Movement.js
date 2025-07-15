const mongoose = require('mongoose');

const MovementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lütfen bir hareket adı girin'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Lütfen bir kategori belirtin (örn: chest, back)'],
    trim: true,
  },
  youtubeUrl: {
    type: String,
    required: [true, 'Lütfen bir YouTube video URL\'si girin'],
  },
  description: {
    type: String,
    required: [true, 'Lütfen bir açıklama girin'],
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  ratings: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
    },
  ],
  favoritedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  // Sanal alanların JSON çıktısına dahil edilmesi için
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ortalama puanı hesaplayan sanal alan
MovementSchema.virtual('averageRating').get(function() {
  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
    return (sum / this.ratings.length).toFixed(1);
  }
  return 0;
});

module.exports = mongoose.model('Movement', MovementSchema); 