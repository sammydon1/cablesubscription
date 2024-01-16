import amqp from "amqplib";
import userModel from "../model/user-model";

async function consumeMessages() {
  const connection = await amqp.connect(
    "amqps://rcepzgai:6nuzlxNhuIAPJO6Gx7T35UTCoP_mGjRV@chimpanzee.rmq.cloudamqp.com/rcepzgai"
  );
  const channel = await connection.createChannel();

  await channel.assertExchange("userExchange", "direct");

  await channel.assertQueue("userQueue");

  await channel.bindQueue("userQueue", "userExchange", "wallet_balance");

  channel.consume("userQueue", async (msg) => {
    let existingUser;
    const data = JSON.parse(msg.content);
    const username = data.message.username;
    const amount = data.message.amount;
    let status;
    try {
      existingUser = await userModel.findOne({ username });
      existingUser.wallet_balance = amount + existingUser.wallet_balance;
      status = await existingUser.save();
    } catch (err) {
      console.log(
        "database operation failed,data will be updated when database server is up"
      );
    }
    console.log(data);
    if (status) {
      channel.ack(msg);
    }
  });
}
export default consumeMessages;
