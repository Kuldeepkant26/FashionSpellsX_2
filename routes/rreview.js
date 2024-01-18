const express = require("express");
const router = express.Router();
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const Listings = require("../models/listings");
const Reviews = require("../models/review");
const User = require("../models/users");
const ExpressError = require("../utils/ExpressError");
const wrapasync = require("../utils/wrapasync");
const { isLogedIn } = require("../utils/middlewares");

router.post("/review/:id", isLogedIn,wrapasync(async (req, res) => {
  let { id } = req.params;
  let listing = await Listings.findById(id);
  let { rating, comment } = req.body;
  let r1 = new Reviews({
    rating: rating,
    comment: comment,
  });
  r1.owner = req.user;
  listing.reviews.push(r1);
  await listing.save();
  await r1.save();
  res.redirect(`/show/${id}`);
}));
router.get(
  "/review/delete/:rid/:id",
  isLogedIn,
  wrapasync(async (req, res) => {
    const { id, rid } = req.params;
    let review=await Reviews.findById(req.params.rid).populate('owner');
    if (review.owner && req.user.username !== review.owner.username) {
      res.send("Suspecious Activity");
    }
    // console.log(review.owner)
    // console.log(req.user.username);
    await Reviews.findByIdAndDelete(rid);
    await Listings.updateOne({ _id: id }, { $pull: { reviews: rid } });
    req.flash("success", "Review Deleted");

    res.redirect(`/show/${id}`);
  })
);

module.exports = router;
