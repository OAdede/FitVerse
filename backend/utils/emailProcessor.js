const amqp = require('amqplib');
const sendEmail = require('./sendEmail');

const processEmailQueue = async () => {
    let connection;
    try {
        // 1. RabbitMQ'ya bağlan
        connection = await amqp.connect(process.env.CLOUDAMQP_URL);
        const channel = await connection.createChannel();
        const queue = 'email_queue';
        await channel.assertQueue(queue, { durable: true });

        // 2. Kuyruktan sadece bir mesaj al (noAck: false -> mesajı manuel onaylayacağız)
        const msg = await channel.get(queue, { noAck: false });

        if (msg) {
            const content = JSON.parse(msg.content.toString());
            console.log(" [x] Received message to process: %s", JSON.stringify(content));

            try {
                // 3. Mesajın türüne göre e-postayı gönder
                if (content.type === 'ask_question') {
                    const { email, question } = content.data;
                    const message = `Kullanıcı E-postası: ${email}\nSoru: \n${question}`;
                    await sendEmail({
                        to: process.env.SMTP_EMAIL,
                        subject: `FitVerse Yeni Soru: ${email}`,
                        message,
                    });
                } else if (content.type === 'subscribe') {
                    const { email } = content.data;
                    const message = `Aşağıdaki e-posta adresi size ulaşmak istiyor:\n\n${email}`;
                    await sendEmail({
                        to: process.env.SMTP_EMAIL,
                        subject: `FitVerse İletişim Talebi: ${email}`,
                        message,
                    });
                }
                
                // 4. Mesaj başarıyla işlendi, kuyruktan sil
                channel.ack(msg);
                console.log(" [✔] Message processed and acknowledged.");
                return { success: true, message: 'Message processed' };

            } catch (error) {
                console.error('Failed to send email, rejecting message:', error);
                // Mesaj işlenemedi, tekrar denenebilmesi için kuyruğa geri koyma (isteğe bağlı)
                channel.nack(msg, false, false); // false, false -> requeue etme
                return { success: false, error: 'Failed to process message' };
            }
        } else {
            console.log("No messages in queue to process.");
            return { success: true, message: 'No messages in queue' };
        }
    } catch (error) {
        console.error('Error connecting to RabbitMQ or processing queue:', error);
        return { success: false, error: 'Error connecting to RabbitMQ' };
    } finally {
        // 5. Bağlantıyı kapat
        if (connection) {
            await connection.close();
        }
    }
};

module.exports = { processEmailQueue }; 