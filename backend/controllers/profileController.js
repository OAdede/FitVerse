const Profile = require('../models/Profile');
const User = require('../models/User');
const Movement = require('../models/Movement');

// @desc    Get current user's profile
// @route   GET /api/profile/me
// @access  Private
exports.getMyProfile = async (req, res, next) => {
  try {
    // Önce tam kullanıcı bilgisini çekelim (favoriler dahil)
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'Kullanıcı bulunamadı' });
    }

    // Sonra profile bilgisini çekelim
    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      // Eğer profil yoksa, sadece kullanıcı bilgisini döndür
      return res.json({
        user: user,
        height: null,
        weight: null,
        age: null,
        gender: null,
        waist: null,
        neck: null,
        weightHistory: []
      });
    }

    // Profil ve kullanıcı verisini birleştirip gönder
    const response = {
      ...profile.toObject(),
      user: user.toObject()
    };
    
    res.json(response);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu Hatası');
  }
};

// @desc    Create or update user profile
// @route   POST /api/profile
// @access  Private
exports.createOrUpdateProfile = async (req, res, next) => {
  const { height, weight, age, gender, waist, neck, activityLevel, goals } = req.body;

  // Build profile object
  const profileFields = {};
  profileFields.user = req.user.id;
  if (height) profileFields.height = height;
  if (weight) profileFields.weight = weight;
  if (age) profileFields.age = age;
  if (gender) profileFields.gender = gender;
  if (waist) profileFields.waist = waist;
  if (neck) profileFields.neck = neck;
  if (activityLevel) profileFields.activityLevel = activityLevel;
  if (goals) profileFields.goals = goals;

  try {
    let profile = await Profile.findOne({ user: req.user.id });

    // Eğer kilo güncelleniyorsa, geçmişe ekle
    if (weight) {
        if (profile) {
            // Mevcut profil varsa ve son kilo kaydı yeni kilodan farklıysa ekle
            const lastEntry = profile.weightHistory[profile.weightHistory.length - 1];
            if (!lastEntry || lastEntry.weight !== Number(weight)) {
                profile.weightHistory.push({ weight });
            }
        } else {
            // Yeni profil oluşturuluyorsa doğrudan ekle
            profileFields.weightHistory = [{ weight }];
        }
    }

    if (profile) {
      // Update
      // Gelen alanları profile nesnesine işle
      profile = Object.assign(profile, profileFields);
      await profile.save();
      await profile.populate('user', ['name', 'avatar']);
      return res.json(profile);
    }

    // Create
    profile = new Profile(profileFields);
    await profile.save();
    await profile.populate('user', ['name', 'avatar']);
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu Hatası');
  }
};

// @desc    Get user's favorite recipes
// @route   GET /api/profile/favorites
// @access  Private
exports.getFavoriteRecipes = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    if (!user) {
      return res.status(404).json({ msg: 'Kullanıcı bulunamadı' });
    }
    res.json(user.favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu Hatası');
  }
};

// @desc    Get user's favorite movements
// @route   GET /api/profile/favorite-movements
// @access  Private
exports.getFavoriteMovements = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Kullanıcı bulunamadı' });
    }

    const favoriteMovements = await Movement.find({
      '_id': { $in: user.favoriteMovements }
    });

    // Mongoose'un sanal alanları bu controller'da bir nedenle dahil etmemesine
    // karşı en güvenli çözüm: Ortalamayı manuel olarak hesapla.
    const responseData = favoriteMovements.map(movement => {
      const movementObject = movement.toObject(); // Düz bir JS nesnesine çevir

      if (movementObject.ratings && movementObject.ratings.length > 0) {
        const sum = movementObject.ratings.reduce((acc, item) => acc + item.rating, 0);
        movementObject.averageRating = (sum / movementObject.ratings.length);
      } else {
        movementObject.averageRating = 0; // Veya N/A olarak göndermek için null
      }
      return movementObject;
    });

    res.json(responseData);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu Hatası');
  }
};

// @desc    Upload user avatar
// @route   POST /api/profile/upload-avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'Kullanıcı bulunamadı' });
    }

    if (!req.file) {
      return res.status(400).json({ msg: 'Lütfen bir dosya seçin' });
    }

    // Path to be saved in DB
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      data: user.avatar,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu Hatası');
  }
};

// @desc    Remove user avatar and reset to default
// @route   DELETE /api/profile/avatar
// @access  Private
exports.removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Kullanıcı bulunamadı' });
    }

    const oldAvatarPath = user.avatar;
    const defaultAvatarPath = '/uploads/profil.png';

    // Reset avatar to default
    user.avatar = defaultAvatarPath;
    await user.save();

    // If the old avatar was not the default one, delete it from the server
    if (oldAvatarPath && oldAvatarPath !== defaultAvatarPath) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '..', 'public', oldAvatarPath);
      
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Eski avatar silinirken hata oluştu:', err);
          // Don't block the response for this, just log it
        }
      });
    }

    res.json({
      success: true,
      data: user.avatar,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu Hatası');
  }
}; 