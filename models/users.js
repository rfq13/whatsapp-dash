const mongoose = require("mongoose");
const uniqValidator = require("mongoose-unique-validator");
var passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, index: true, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String },
  },
  { timestamps: true }
);
userSchema.methods.isValidPassword = async function (password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.password);

  return compare;
};
userSchema.plugin(uniqValidator, { message: "gagal melanjutkan proses,{PATH} {VALUE} sudah digunakan." });
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
