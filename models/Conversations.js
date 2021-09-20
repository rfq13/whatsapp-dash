const mongoose = require("mongoose");
const UserModel = require("./users");
const conversationSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    key: { type: String },
    phrases: { type: Array },
    type: { type: Number, require: true, default: 1 }, // 1 -> pertanyaan , 2 -> jawaban
  },
  { timestamps: true }
);
module.exports = mongoose.model("Conversations", conversationSchema);
