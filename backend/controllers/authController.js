const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        // Kullanıcının zaten var olup olmadığını kontrol et
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'Bu e-posta ile zaten bir kullanıcı mevcut' });
        }

        // Yeni bir kullanıcı oluştur
        user = new User({
            name,
            email,
            password,
        });

        // Şifreyi hash'le (şifrele)
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Kullanıcıyı veritabanına kaydet
        await user.save();
        
        // JWT (JSON Web Token) oluştur
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // .env dosyasında oluşturacağız
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu Hatası');
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Kullanıcının var olup olmadığını kontrol et
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Geçersiz kimlik bilgileri' });
        }

        // Şifreleri karşılaştır
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Geçersiz kimlik bilgileri' });
        }

        // JWT (JSON Web Token) oluştur
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu Hatası');
    }
};

// @desc    Change user password
// @route   PUT /api/auth/changepassword
// @access  Private
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        // Kullanıcıyı veritabanından bul
        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            // Bu durumun normalde olmaması gerekir çünkü auth middleware'i kullanıcıyı bulmalı
            return res.status(404).json({ msg: 'Kullanıcı bulunamadı' });
        }

        // Mevcut şifrenin doğru olup olmadığını kontrol et
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Mevcut şifre yanlış' });
        }

        // Yeni şifreyi hash'le
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Kullanıcıyı yeni şifreyle kaydet
        await user.save();

        res.json({ msg: 'Şifreniz başarıyla değiştirildi!' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu Hatası');
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            // Güvenlik için, kullanıcı bulunamasa bile "gönderildi" mesajı veriyoruz.
            return res.status(200).json({ success: true, data: 'E-posta gönderildi (eğer kullanıcı mevcutsa).' });
        }

        // Reset token al
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Sıfırlama URL'sini oluştur
        const resetUrl = `${process.env.FRONTEND_URL}/html/reset-password.html?token=${resetToken}`;

        const message = `
            Şifrenizi sıfırlamak için bu linke tıklayın. Bu link 10 dakika geçerlidir.\n\n${resetUrl}
        `;
        
        try {
            await sendEmail({
                to: user.email,
                subject: 'FitVerse Şifre Sıfırlama Talebi',
                message
            });

            res.status(200).json({ success: true, data: 'E-posta başarıyla gönderildi.' });
        } catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).send('E-posta gönderilemedi.');
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu Hatası');
    }
}; 

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
    try {
        // Gelen token'ı hash'le
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        // Hash'lenmiş token'a sahip ve süresi dolmamış kullanıcıyı bul
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş token.' });
        }

        // Yeni şifreyi ayarla
        user.password = req.body.password; // Hash'leme User modelinde pre-save hook ile de yapılabilir, ama burada doğrudan yapıyoruz.
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        
        // Şifreyi yeniden hash'le
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        
        await user.save();

        // Yeni bir token oluşturup kullanıcıyı otomatik login de yapabiliriz, şimdilik sadece başarı mesajı dönüyoruz.
        res.status(200).json({ success: true, data: 'Şifre başarıyla sıfırlandı.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu Hatası');
    }
}; 