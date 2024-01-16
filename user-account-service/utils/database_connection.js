import mongoose from "mongoose";

import dotenv from "dotenv";

dotenv.config();

export default function connect() {
  mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => console.log("database connection successful"))
    .catch((err) => console.log(err));
}
