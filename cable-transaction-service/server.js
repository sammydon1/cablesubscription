import express from "express";

import connect from "./utils/database_connection";

import Router from "./router/transaction-router";

import cors from "cors"

import consumeMessages from "./utils/consumer";

const server = express();

server.use(express.json());

server.use(cors());

server.use("/api/v1",Router)

server.listen(process.env.SERVER_PORT, () => {
  console.log("server listening to port "+ process.env.SERVER_PORT)
   connect();
  consumeMessages();
});

// middleware to handle the error of invalid json format
server.use((err, req, res, next) => {
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
server.use((error, req, res, next) => {
  if (error.status === 500) {
    return res.status(500).json({ success: false, message: error });
  }
});
