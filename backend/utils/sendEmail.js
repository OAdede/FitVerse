const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create a transporter object using the simplified 'gmail' service.
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    // 2. Define the email options
    const mailOptions = {
        from: `FitVerse Bildirim <${process.env.SMTP_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        text: options.message,
    };

    // 3. Actually send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!', info);
    } catch (error) {
        console.error('Error sending email:', error);
        // Bu hatayı fırlatarak, çağıran fonksiyonun (örn: emailProcessor)
        // hatayı yakalamasını ve mesajı kuyruktan silmemesini sağlıyoruz.
        throw error;
    }
};

module.exports = sendEmail; 