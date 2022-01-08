const mongoose = require("mongoose");
const conversations = require("./Conversations");
const mongoosePaginate = require("mongoose-paginate-v2");

const conversationKeySchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    key: { type: String },
    conversations: [conversations.schema],
  },
  { timestamps: true }
);
conversationKeySchema.plugin(mongoosePaginate);
module.exports = mongoose.model("ConversationKey", conversationKeySchema);
