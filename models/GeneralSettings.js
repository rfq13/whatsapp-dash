const mongoose = require("mongoose");
const gsSchema = new mongoose.Schema({
  nlp_algo: { type: Number, default: 1 }, // 1 for fuzzy , 2 for rabin-karp
});

// gsSchema.pre("save", function (next) {
//   if ("invalid" == this.type) {
//     return next(new Error("#sadpanda"));
//   }
//   next();
// });

module.exports = mongoose.model("GeneralSettings", gsSchema);
