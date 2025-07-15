const amqp = require('amqplib');

let channel;

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://user:password@rabbitmq:5672');
    channel = await connection.createChannel();
    await channel.assertQueue('email_queue', { durable: true });
    console.log('RabbitMQ connected and queue asserted');
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    // Exit process or implement retry logic
    process.exit(1);
  }
}

function getChannel() {
  if (!channel) {
    throw new Error('RabbitMQ channel is not available.');
  }
  return channel;
}

module.exports = { connectRabbitMQ, getChannel }; 