import amqp from "amqplib";

import { rabbitMQ } from "./config";

export default class Producer {
  async publishMessage(routingKey, message, exchangeName) {
    this.channel;

    if (!this.channel) {
      const connection = await amqp.connect(rabbitMQ.url);
      this.channel = await connection.createChannel();
    }
    await this.channel.assertExchange(exchangeName, "direct");

    this.channel.publish(
      exchangeName,
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
