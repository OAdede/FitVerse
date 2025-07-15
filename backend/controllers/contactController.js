const { getChannel } = require('../utils/rabbitmq');
const sendEmail = require('../utils/sendEmail');

// @desc    Submit a question and send it to the support email
// @route   POST /api/contact/ask
// @access  Public
exports.askQuestion = async (req, res, next) => {
    const { email, question } = req.body;

    if (!email || !question) {
        return res.status(400).json({ success: false, error: 'Lütfen e-posta ve soru alanlarını doldurun.' });
    }

    try {
        const channel = getChannel();
        const queue = 'email_queue';
        const msg = JSON.stringify({
            type: 'ask_question',
            data: {
                email,
                question
            }
        });

        channel.sendToQueue(queue, Buffer.from(msg), { persistent: true });
        console.log(" [x] Sent '%s'", msg);
        res.status(200).json({ success: true, data: 'Sorunuz başarıyla sıraya alındı.' });

    } catch (err) {
        console.error(err);
        res.status(500).send('Mesaj sıraya alınamadı.');
    }
};

// @desc    Submit a subscription/contact request and send it to the support email
// @route   POST /api/contact/subscribe
// @access  Public
exports.subscribe = async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, error: 'Lütfen e-posta adresini girin.' });
    }

    try {
        const channel = getChannel();
        const queue = 'email_queue';
        const msg = JSON.stringify({
            type: 'subscribe',
            data: {
                email
            }
        });

        channel.sendToQueue(queue, Buffer.from(msg), { persistent: true });
        console.log(" [x] Sent '%s'", msg);
        res.status(200).json({ success: true, data: 'İletişim talebiniz başarıyla sıraya alındı.' });

    } catch (err) {
        console.error(err);
        res.status(500).send('Mesaj sıraya alınamadı.');
    }
};

// @desc    Suggest a recipe and send it to the support email
// @route   POST /api/contact/suggest-recipe
// @access  Public
exports.suggestRecipe = async (req, res, next) => {
    const { title, ingredients, steps, userEmail } = req.body;

    if (!title || !ingredients || !steps) {
        return res.status(400).json({ success: false, error: 'Lütfen tüm tarif alanlarını doldurun.' });
    }

    // Switched from HTML to plain text message for guaranteed delivery.
    const message = `
        Yeni Tarif Önerisi Geldi!

        Öneren Kullanıcı: ${userEmail || 'Giriş Yapılmamış'}
        -----------------------------------
        Tarif Adı: ${title}
        -----------------------------------
        Malzemeler:
        ${ingredients}
        -----------------------------------
        Hazırlanışı:
        ${steps}
    `;
    
    try {
        await sendEmail({
            to: process.env.SMTP_EMAIL,
            subject: `FitVerse Yeni Tarif Önerisi: ${title}`,
            message: message // Use `message` key just like the working examples.
        });

        res.status(200).json({ success: true, data: 'Tarif öneriniz başarıyla gönderildi.' });
    } catch (err) {
        console.error('Tarif önerme hatası (sendEmail aracılığıyla):', err);
        res.status(500).json({ success: false, error: 'E-posta gönderimi sırasında bir sunucu hatası oluştu.' });
    }
}; 