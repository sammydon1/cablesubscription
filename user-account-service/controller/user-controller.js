import bcrypt from "bcryptjs";
import userModel from "../model/user-model";
import jwt from "jsonwebtoken";
import Producer from "../utils/producer";

export const registerUser = async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await userModel.findOne({ username });

  if (!existingUser) {
    if (username && password) {
      const hashedPassword = bcrypt.hashSync(String(password));

      const user = new userModel({ username, password: hashedPassword });

      await user.save();

      res.status(201).json({ status: true, message: user });
    } else {
      res.status(400).json({
        status: false,
        message: "please enter username and password to register",
      });
    }
  } else {
    res.status(400).json({
      status: false,
      message:
        "username already exists in database, please try another username",
    });
  }
};

export const addPhoneNumber = async (req, res) => {
  let existingUser;

  const mobile = req.body.mobile;

  const username = req.body.username;

  if (mobile && username) {
    existingUser = await userModel.findOne({ username });

    existingUser.mobile_number = mobile;

    existingUser.save();

    res
      .status(200)
      .json({ status: true, message: "phone number updated successfully" });
  } else {
    res.status(400).json({ status: false, message: "invalid request" });
  }
};

export const addIucNumber = async (req, res) => {
  let existingUser;

  const iuc = req.body.iuc;

  const username = req.body.username;

  if (iuc && username) {
    existingUser = await userModel.findOne({ username });

    existingUser.iuc_no = iuc;

    existingUser.save();

    res
      .status(200)
      .json({ status: true, message: "cable iuc number updated successfully" });
  } else {
    res.status(400).json({ status: false, message: "invalid request" });
  }
};

export const loginUser = async (req, res) => {
  let decodedPassword;

  const { username, password } = req.body;

  let existingUser;

  existingUser = await userModel.findOne({ username });

  if (!existingUser) {
    res.status(404).json({
      success: false,
      message: "this username doesn't exist in the database",
    });
  } else {
    decodedPassword = bcrypt.compareSync(
      String(password),
      existingUser.password
    );

    if (decodedPassword) {
      const payload = {
        username,
        password: password,
      };
      const token = jwt.sign(payload, "secret", { expiresIn: "2h" });

      res
        .status(200)
        .json({ success: true, message: { user: existingUser, jwt: token } });
    } else {
      res.status(404).json({
        success: false,
        message:
          "password entered is incorrect!, enter correct password to login",
      });
    }
  }
};

export const subscribeCable = async (req, res) => {
  const basic = 3000;

  const premium = 6000;

  let existingUser;

  const { subtype, iuc_no, duration, username, mobile } = req.body;

  if (subtype && iuc_no && duration && username && mobile) {

    let amount;
    if (subtype === "basic") {
      amount = duration * basic;
    } else if (subtype === "premium") {
      amount = duration * premium;
    }

    existingUser = await userModel.findOne({username:username});


    if (existingUser.wallet_balance >= amount) {
      existingUser.wallet_balance = (existingUser.wallet_balance - amount);

      await existingUser.save();

      const producer = new Producer();

      const payload = {
        subscriptionType: subtype,
        iuc_no,
        duration,
        username,
        mobile,
        amount,
      };

      producer.publishMessage("transaction", payload,"billExchange");
      res.status(200).json({status:true, message: `your ${duration} months subscription was successfull`})
    } else {
      res
        .status(400)
        .json({ status: false, message: "you do not have sufficient funds" });
    }
  } else {
    res.status(400).json({ status: false, message: "invalid request" });
  }
};
