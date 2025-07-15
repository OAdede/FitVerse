const crypto = require('crypto');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
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
  avatar: {
    type: String,
    default: '/uploads/profil.png'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  favorites: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Recipe'
      }
  ],
  favoriteMovements: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movement'
    }
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

// Reset token'ı oluştur ve hash'le
UserSchema.methods.getResetPasswordToken = function() {
  // Token oluştur
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Token'ı hash'le ve modele ata
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Token'ın son kullanma tarihini ayarla (örneğin 10 dakika)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken; // Hash'lenmemiş token'ı e-posta ile göndermek için döndür
};

module.exports = mongoose.model('User', UserSchema);