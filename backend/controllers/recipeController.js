const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Comment = require('../models/Comment'); // Yeni modeli import et
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all recipes
// @route   GET /api/recipes
// @access  Public
exports.getAllRecipes = asyncHandler(async (req, res) => {
    const recipes = await Recipe.find()
        .populate({
            path: 'comments',
            populate: {
                path: 'user',
                select: 'name _id'
            }
        })
        .sort({ createdAt: -1 });
    res.json(recipes);
});

// @desc    Get recipe by ID
// @route   GET /api/recipes/:id
// @access  Public
exports.getRecipeById = async (req, res) => {
    // Henüz boş
};

// @desc    Create a recipe (suggest)
// @route   POST /api/recipes
// @access  Private
exports.createRecipe = async (req, res) => {
    // Henüz boş
};

// @desc    Like or unlike a recipe
// @route   PUT /api/recipes/:id/like
// @access  Private
exports.likeRecipe = asyncHandler(async (req, res, next) => {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
        return res.status(404).json({ msg: 'Tarif bulunamadı' });
    }

    // Kullanıcı dislike listesindeyse, onu oradan kaldır
    recipe.dislikes = recipe.dislikes.filter(
        ({ user }) => user.toString() !== req.user.id
    );

    // Beğeniyi toggle et (varsa kaldır, yoksa ekle)
    const isLiked = recipe.likes.some(like => like.user.toString() === req.user.id);

    if (isLiked) {
        // Beğeniyi geri al
        recipe.likes = recipe.likes.filter(
            ({ user }) => user.toString() !== req.user.id
        );
    } else {
        // Beğen
        recipe.likes.unshift({ user: req.user.id });
    }
    
    await recipe.save();
    res.json({ likes: recipe.likes, dislikes: recipe.dislikes });
});

// @desc    Dislike or un-dislike a recipe
// @route   PUT /api/recipes/:id/dislike
// @access  Private
exports.dislikeRecipe = asyncHandler(async (req, res, next) => {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
        return res.status(404).json({ msg: 'Tarif bulunamadı' });
    }

    // Kullanıcı like listesindeyse, onu oradan kaldır
    recipe.likes = recipe.likes.filter(
        ({ user }) => user.toString() !== req.user.id
    );

    // Dislike'ı toggle et (varsa kaldır, yoksa ekle)
    const isDisliked = recipe.dislikes.some(dislike => dislike.user.toString() === req.user.id);

    if (isDisliked) {
        // Dislike'ı geri al
        recipe.dislikes = recipe.dislikes.filter(
            ({ user }) => user.toString() !== req.user.id
        );
    } else {
        // Dislike et
        recipe.dislikes.unshift({ user: req.user.id });
    }

    await recipe.save();
    res.json({ likes: recipe.likes, dislikes: recipe.dislikes });
});

// @desc    Toggle favorite status for a recipe
// @route   PUT /api/recipes/:id/favorite
// @access  Private
exports.toggleFavoriteRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!recipe || !user) {
        return res.status(404).json({ msg: 'Tarif veya kullanıcı bulunamadı.' });
    }

    const recipeIndexInUser = user.favorites.indexOf(recipe._id);
    const userIndexInRecipe = recipe.favoritedBy.indexOf(user._id);
    
    let isFavorited;

    if (recipeIndexInUser > -1) {
        // Zaten favoride, kaldır
        user.favorites.splice(recipeIndexInUser, 1);
        if (userIndexInRecipe > -1) {
            recipe.favoritedBy.splice(userIndexInRecipe, 1);
        }
        isFavorited = false;
    } else {
        // Favoride değil, ekle
        user.favorites.push(recipe._id);
        recipe.favoritedBy.push(user._id);
        isFavorited = true;
    }

    await user.save();
    await recipe.save();

    res.json({ isFavorited, favoritedBy: recipe.favoritedBy });
});


// @desc    Comment on a recipe
// @route   POST /api/recipes/:id/comment
// @access  Private
exports.addComment = asyncHandler(async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ msg: 'Yorum metni boş olamaz.' });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
        return res.status(404).json({ msg: 'Tarif bulunamadı.' });
    }

    const newComment = new Comment({
        text: text,
        user: req.user.id,
        recipe: req.params.id
    });

    await newComment.save();

    recipe.comments.push(newComment._id);
    await recipe.save();

    // Kullanıcı adı ve profil resmi gibi detayları göndermek için populate kullanalım
    const populatedComment = await Comment.findById(newComment._id).populate('user', ['name']);

    res.status(201).json(populatedComment);
});

// @desc    Delete a comment
// @route   DELETE /api/recipes/:recipeId/comments/:commentId
// @access  Private
exports.deleteComment = asyncHandler(async (req, res) => {
    const { recipeId, commentId } = req.params;

    const comment = await Comment.findById(commentId);

    // Yorumun varlığını kontrol et
    if (!comment) {
        return res.status(404).json({ msg: 'Yorum bulunamadı.' });
    }

    // Kullanıcının yorumun sahibi olup olmadığını kontrol et
    if (comment.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Bu işlem için yetkiniz yok.' });
    }

    // Tarifi bul ve yorum referansını kaldır
    const recipe = await Recipe.findById(recipeId);
    if (recipe) {
        recipe.comments.pull(commentId);
        await recipe.save();
    }
    
    // Yorumu sil
    await Comment.findByIdAndDelete(commentId);


    res.json({ msg: 'Yorum başarıyla silindi.' });
}); 