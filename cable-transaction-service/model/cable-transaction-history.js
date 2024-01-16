import mongoose from "mongoose";

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  subscription_type: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

   iuc_no: {
    type: String,
  },

  duration: {
    type: String,

  },
  username: {
    type: String,
  },
  mobile_number: {
    type: String,
  },
  createdAt: {
    type: String,
  },
  ExpiresAt: {
    type: String,
  }
})

export default mongoose.model("transaction", transactionSchema);
