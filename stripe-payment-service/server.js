const dotenv = require("dotenv");
const express = require("express");
const app = express();
const Producer = require("./utils/producer");

app.use(express.json());
app.use(express.static("public"));
dotenv.config();

// middle to handle the error of invalid json format
app.use((err, req, res, next) => {
  // body-parser will set this to 400 if the json is in error

  if (err.status === 400) {
    return res
      .status(err.status)
      .send({ success: false, message: "Bad Request" });
  } else {
    next();
  }
});
// middle to handle the error of internal server error
app.use((error, req, res, next) => {
  if (error.status === 500) {
    return res.status(500).json({ success: false, message: error });
  }
});

app.listen(process.env.PORT, () => {
  console.log("Running on port " + process.env.PORT);
});

const stripe = require("stripe")(
  "sk_test_51O95o5HCdb8yJZVuNOvBW50eXLIMph59GNn5U1JnliEpncCC2oMHlEmMKzwcftACrjlGeyDVYLCvFrBOhRFHQMqS008KAcQDO0"
);

// Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret =
  "whsec_1fe3947045c3b893a5f4200a9d49f2b543054ee8ca332f81616e6c38b4b35d5f";

app.post("/webhook", (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  let data;

  let eventType;

  /* try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log(verified);
  } catch (err) {
    console.log(err);
    res.status(400).json({err})
  }            
*/
  data = req.body.data.object;
  eventType = req.body.type;

  // Handling the event
  if (eventType === "payment_intent.succeeded") {
    stripe.customers.retrieve(data.customer).then((customer) => {
      username = customer.metadata.userId;
      const payload = {
        amount: data.amount / 100,
        username: username,
      };

      const cable_transaction_details={
        subscriptionType:"Top Up",
        username:username,
        amount:data.amount/100
      }
      const producer = new Producer();
      producer.publishMessage("wallet_balance", payload,"userExchange");
      producer.publishMessage("transaction", cable_transaction_details,"billExchange");
    });
  }
  res.send().end();
});

app.post("/create-checkout-session", async (req, res) => {
  const { username, amount } = req.body;

  if (username && amount) {
    const customer = await stripe.customers.create({
      metadata: {
        userId: req.body.username,
      },
    });

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer: customer.id,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name:`fund wallet for ${req.body.username}`
              },
              unit_amount: req.body.amount * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.BASE_URL}/success.html`,
        cancel_url: `${process.env.BASE_URL}/cancel.html`,
      });
      res.json({ url: session.url });
    } catch (e) {
      res.status(500).json({ e });
    }
  } else {
    res.status(400).json({ status: false, message: "invalid request" });
  }
});
