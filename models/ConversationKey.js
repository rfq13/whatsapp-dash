const mongoose = require("mongoose");
const UserModel = require("./users");
const conversationKeySchema = new mongoose.Schema(
  {
    key: { type: String },
  },
  { timestamps: true }
);
module.exports = mongoose.model("ConversationKey", conversationKeySchema);
