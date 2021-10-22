const mongoose = require("mongoose");
const conversationSchema = new mongoose.Schema(
  {
    phrases: { type: Array },
    type: { type: Number, require: true, default: 1 }, // 1 -> pertanyaan , 2 -> jawaban
  },
  { timestamps: true }
);

conversationSchema.pre("save", function (next) {
  if ("invalid" == this.type) {
    return next(new Error("#sadpanda"));
  }
  next();
});

module.exports = mongoose.model("Conversations", conversationSchema);
