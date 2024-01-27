const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    url: String,
    filename: String,
  },
  gender: {
    type: String,
    required: true,
  },
  occasion: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  blink: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reviews",
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Listing", listingSchema);
