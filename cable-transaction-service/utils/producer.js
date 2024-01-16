const amqp = require("amqplib");

const rabbitMQ = require("./config");

class Producer {
  async publishMessage(routingKey, message) {
    this.channel;

    if (!this.channel) {
      const connection = await amqp.connect(rabbitMQ.url);
      this.channel = await connection.createChannel();
    }
    await this.channel.assertExchange(rabbitMQ.exchangeName, "direct");

    this.channel.publish(
      "userExchange",
      routingKey,
      Buffer.from(
        JSON.stringify({
          routingKey: routingKey,
          message: message,
          dateTime: new Date(),
        })
      )
    );
  }
}
module.exports = Producer;
