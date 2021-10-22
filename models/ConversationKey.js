const mongoose = require("mongoose");
const conversations = require("./Conversations");
const conversationKeySchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    key: { type: String },
    conversations: conversations.schema,
  },
  { timestamps: true }
);
module.exports = mongoose.model("ConversationKey", conversationKeySchema);
