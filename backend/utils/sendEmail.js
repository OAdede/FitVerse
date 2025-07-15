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
    };

    // Conditionally add text or html. Cannot have both if one is undefined.
    if (options.html) {
        mailOptions.html = options.html;
    } else {
        mailOptions.text = options.message;
    }

    // 3. Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail; 