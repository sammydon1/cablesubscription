import amqp from "amqplib";
import cableModel from "../model/cable-transaction-history";

async function consumeMessages() {
  const connection = await amqp.connect(
    "amqps://rcepzgai:6nuzlxNhuIAPJO6Gx7T35UTCoP_mGjRV@chimpanzee.rmq.cloudamqp.com/rcepzgai"
  );
  const channel = await connection.createChannel();

  await channel.assertExchange("billExchange", "direct");

  await channel.assertQueue("billQueue");

  await channel.bindQueue("billQueue", "billExchange", "transaction");

  channel.consume("billQueue", async (msg) => {
    const data = JSON.parse(msg.content);
    console.log(data)
    const subscriptionType = data.message.subscriptionType;
    if (subscriptionType === "Top Up") {
      const username = data.message.username;
      const amount = data.message.amount;
      const date = data.dateTime;
      const cableTransaction = new cableModel({
        subscription_type: subscriptionType,
        amount,
        username,
        createdAt: date,
      });
      cableTransaction.save();
      channel.ack(msg);
    } else if(subscriptionType ==="premium" || subscriptionType==="basic") {

        const iuc_no=data.message.iuc_no;

        const date = data.dateTime;

        const duration=data.message.duration;

        const username = data.message.username;

        const mobile_number = data.message.mobile;

        const amount = data.message.amount;

        const date2= new Date(date)

        date2.setMonth(date2.getMonth()+ Number(duration))

        const cableTransaction = new cableModel({subscription_type:subscriptionType,amount,iuc_no,duration:`${duration} month(s)`,username,mobile_number,createdAt:date,ExpiresAt:date2});
        
        let status;
    

        try{
          status=await cableTransaction.save();
        }
        catch(err){
          console.log("database operation failed,data will be updated when database server is up")
        }

       if(status){
            channel.ack(msg)
            }
    }
   
    
  });
}
export default consumeMessages;
