import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  iuc_no: {
    type: String,
    default: "nil",
  },

  wallet_balance: {
    type: Number,
    default: 0.0,
  },

  mobile_number: {
    type: String,
    default: "nil",
  },
});

export default mongoose.model("User", UserSchema);
