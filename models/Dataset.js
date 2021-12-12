const mongoose = require("mongoose");
const datasetSchema = new mongoose.Schema(
  {
    phrases: { type: Array },
    type: { type: Number, require: true, default: 1 }, // 1 -> pertanyaan , 2 -> jawaban
  },
  { timestamps: true }
);

// datasetSchema.pre("save", function (next) {
//   if ("invalid" == this.type) {
//     return next(new Error("#sadpanda"));
//   }
//   next();
// });

module.exports = mongoose.model("Datasets", datasetSchema);
