const Movement = require('../models/Movement');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const redis = require('redis');

// Redis Client Kurulumu
// Bağlantıyı hardcoded string yerine process.env'den alacak şekilde düzenle
const redisClient = redis.createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Uygulama başlarken Redis'e bağlan
redisClient.connect().then(() => {
    console.log('Connected to Redis');
}).catch(err => {
    console.error('Could not connect to Redis', err);
});


// @desc    Get all movements for a specific category
// @route   GET /api/movements/:category
// @access  Public
exports.getMovementsByCategory = async (req, res) => {
  const category = req.params.category;
  const cacheKey = `movements:${category}`; // Örnek anahtar: movements:chest

  try {
    // 1. Önce cache'i kontrol et
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      // 2. Cache'de veri varsa, onu gönder (Cache Hit)
      console.log(`Cache hit for ${cacheKey}`);
      return res.json(JSON.parse(cachedData));
    }

    // 3. Cache'de veri yoksa, veritabanından al (Cache Miss)
    console.log(`Cache miss for ${cacheKey}`);
    const movements = await Movement.find({ category: category });
    
    // 4. Veritabanından gelen veriyi cache'e kaydet (1 saat geçerli)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(movements));

    res.json(movements);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Add or remove a movement from favorites
// @route   POST /api/movements/:id/favorite
// @access  Private
exports.toggleFavoriteMovement = async (req, res) => {
  try {
    const movementId = req.params.id;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const index = user.favoriteMovements.indexOf(movementId);

    if (index === -1) {
      // Add to favorites
      user.favoriteMovements.push(movementId);
    } else {
      // Remove from favorites
      user.favoriteMovements.splice(index, 1);
    }

    await user.save();

    // İlgili hareketin kategorisini bul ve cache'i temizle
    const movement = await Movement.findById(movementId).select('category');
    if (movement) {
      const cacheKey = `movements:${movement.category}`;
      console.log(`Cache invalidated for ${cacheKey}`);
      await redisClient.del(cacheKey);
    }

    res.json(user.favoriteMovements);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Like or dislike a movement
// @route   POST /api/movements/:id/like
// @access  Private
exports.likeMovement = async (req, res) => {
    try {
        const movement = await Movement.findById(req.params.id);
        if (!movement) {
            return res.status(404).json({ msg: 'Hareket bulunamadı' });
        }

        const userId = req.user.id;
        const { action } = req.body; // 'like' or 'dislike'

        // Kullanıcının mevcut oylarını kontrol et
        const likeIndex = movement.likes.indexOf(userId);
        const dislikeIndex = movement.dislikes.indexOf(userId);

        if (action === 'like') {
            // Beğenme işlemi
            if (likeIndex > -1) {
                // Zaten beğenmiş, beğeniyi geri al
                movement.likes.splice(likeIndex, 1);
            } else {
                // Yeni beğeni, eğer dislike varsa kaldır
                movement.likes.push(userId);
                if (dislikeIndex > -1) {
                    movement.dislikes.splice(dislikeIndex, 1);
                }
            }
        } else if (action === 'dislike') {
            // Beğenmeme işlemi
            if (dislikeIndex > -1) {
                // Zaten beğenmemiş, beğenmemeyi geri al
                movement.dislikes.splice(dislikeIndex, 1);
            } else {
                // Yeni beğenmeme, eğer like varsa kaldır
                movement.dislikes.push(userId);
                if (likeIndex > -1) {
                    movement.likes.splice(likeIndex, 1);
                }
            }
        } else {
            return res.status(400).json({ msg: 'Geçersiz işlem' });
        }

        await movement.save();

        // Cache'i temizle
        const cacheKey = `movements:${movement.category}`;
        console.log(`Cache invalidated for ${cacheKey}`);
        await redisClient.del(cacheKey);

        res.json({
            likes: movement.likes.length,
            dislikes: movement.dislikes.length,
            userLiked: movement.likes.includes(userId),
            userDisliked: movement.dislikes.includes(userId),
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Rate a movement
// @route   POST /api/movements/:id/rate
// @access  Private
exports.rateMovement = async (req, res) => {
  try {
    const movement = await Movement.findById(req.params.id);
    if (!movement) {
      return res.status(404).json({ msg: 'Hareket bulunamadı' });
    }

    const userId = req.user.id;
    const { rating } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ msg: 'Puan 1 ile 5 arasında olmalıdır' });
    }

    const existingRatingIndex = movement.ratings.findIndex(
      (r) => r.user.toString() === userId
    );

    if (existingRatingIndex > -1) {
      // Puanı güncelle
      movement.ratings[existingRatingIndex].rating = rating;
    } else {
      // Yeni puan ekle
      movement.ratings.push({ user: userId, rating });
    }

    await movement.save();

    // Ortalama puanı manuel olarak yeniden hesapla ve onu gönder.
    // Bu, sanal alanın anlık olarak güncellenmemesi sorununu çözer.
    let newAverageRating = 0;
    if (movement.ratings && movement.ratings.length > 0) {
      const sum = movement.ratings.reduce((acc, item) => acc + item.rating, 0);
      newAverageRating = (sum / movement.ratings.length);
    }

    // Cache'i temizle
    const cacheKey = `movements:${movement.category}`;
    console.log(`Cache invalidated for ${cacheKey}`);
    await redisClient.del(cacheKey);

    // Güncel ortalama puanı ve kullanıcının puanını döndür
    res.json({
      averageRating: newAverageRating,
      userRating: rating
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu Hatası');
  }
}; 