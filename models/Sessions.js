const mongoose = require("mongoose");
const check = require("../plugins/checkRecord");
const sessionSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    client: { type: String },
    ready: { type: Boolean, default:false },
    description: { type: String },
  },
  { timestamps: true }
);
sessionSchema.plugin(check);
module.exports = mongoose.model("Session", sessionSchema);
