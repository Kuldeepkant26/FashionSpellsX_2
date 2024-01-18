const mongoose = require("mongoose");
let reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  owner:{
    type: mongoose.Schema.Types.ObjectId,
      ref: "User",
  }
});

module.exports = mongoose.model("Reviews", reviewSchema);