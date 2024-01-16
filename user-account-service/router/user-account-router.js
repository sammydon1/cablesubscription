import express from "express";

const Router = express.Router();

import { addIucNumber, addPhoneNumber, loginUser, registerUser, subscribeCable } from "../controller/user-controller";

Router.post("/signup", registerUser);

Router.post("/signin", loginUser)

Router.post("/mobile/save", addPhoneNumber)

Router.post("/iuc/save", addIucNumber)

Router.post("/cable/subscribe", subscribeCable)

export default Router;
