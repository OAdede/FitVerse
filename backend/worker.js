require('dotenv').config();
const amqp = require('amqplib');
const sendEmail = require('./utils/sendEmail');

async function processEmailQueue() {
  try {
    const connection = await amqp.connect('amqp://user:password@rabbitmq:5672');
    const channel = await connection.createChannel();
    const queue = 'email_queue';

    await channel.assertQueue(queue, { durable: true });
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        console.log(" [x] Received %s", JSON.stringify(content));

        try {
          if (content.type === 'ask_question') {
            const { email, question } = content.data;
            const message = `Kullanıcı E-postası: ${email}\nSoru: \n${question}`;
            await sendEmail({
              to: process.env.SMTP_EMAIL,
              subject: `FitVerse Yeni Soru: ${email}`,
              message,
            });
            console.log(`Email sent for 'ask_question' to ${email}`);
          } else if (content.type === 'subscribe') {
            const { email } = content.data;
            const message = `Aşağıdaki e-posta adresi size ulaşmak istiyor:\n\n${email}`;
            await sendEmail({
              to: process.env.SMTP_EMAIL,
              subject: `FitVerse İletişim Talebi: ${email}`,
              message,
            });
            console.log(`Email sent for 'subscribe' to ${email}`);
          }
          channel.ack(msg);
        } catch (error) {
          console.error('Failed to send email:', error);
          // Re-queue the message if sending failed
          channel.nack(msg);
        }
      }
    });
  } catch (error) {
    console.error('Error connecting to RabbitMQ in worker:', error);
  }
}

processEmailQueue(); 