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
const multer = require('multer');
const { storage } = require("../cloudConfig.js");

const upload = multer({ storage })

router.get(
  "/home",
  wrapasync(async (req, res) => {
    let listings = await Listings.find();
    res.render("home.ejs", { listings });
  })
);

router.get("/add", isLogedIn, (req, res) => {
  res.render("addForm.ejs");
});

router.post(
  "/add",
  isLogedIn,
  upload.single('image'),
  wrapasync(async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    let { title, gender, occasion, price, image, blink, desc } = req.body;
    if (
      !req.body.title ||
      !req.body.desc ||

      !req.body.price ||
      !req.body.gender ||
      !req.body.occasion ||
      !req.body.blink
    ) {
      throw new ExpressError(404, "invalid input");
    }
    let l1 = new Listings({
      title: title,
      gender: gender,
      occasion: occasion,
      price: price,

      blink: blink,
      desc: desc,
    });
    l1.owner = req.user;
    l1.image = { url, filename };
    await l1.save();
    req.flash("success", "Suggested outfit successfully");
    res.redirect("/home");
  })
);
router.get(
  "/show/:id",
  wrapasync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listings.findById(id)
      .populate({ path: "reviews", populate: { path: "owner" } })
      .populate("owner");
    let Nlistings = await Listings.find();
    res.render("show.ejs", { listing, Nlistings });
  })
);
router.get(
  "/edit/:id",
  isLogedIn,
  wrapasync(async (req, res) => {
    let id = req.params.id;

    let listing = await Listings.findById(id).populate("owner");
    if (listing.owner && req.user.username !== listing.owner.username) {
      res.send("Suspecious Activity");
    }

    res.render("eform.ejs", { listing });
  })
);
router.post(
  "/edit/:id",
  isLogedIn,
  wrapasync(async (req, res) => {
    let id = req.params.id;
    let listing = await Listings.findById(id).populate("owner");
    if (req.user.username !== listing.owner.username) {
      res.send("Suspecious Activity");
    }
    let { title, gender, occasion, price, blink, desc } = req.body;
    if (
      !req.body.title ||
      !req.body.desc ||

      !req.body.price ||
      !req.body.gender ||
      !req.body.occasion ||
      !req.body.blink
    ) {
      throw new ExpressError(404, "invalid input");
    }
    await Listings.findByIdAndUpdate(id, {
      title: title,
      gender: gender,
      occasion: occasion,
      price: price,
      blink: blink,
      desc: desc,
    });
    req.flash("success", "Suggested outfit successfully");

    res.redirect(`/show/${id}`);
  })
);
router.get(
  "/delete/:id",
  isLogedIn,
  wrapasync(async (req, res) => {
    let id = req.params.id;
    let listing = await Listings.findById(id).populate("owner");
    if (req.user.username !== listing.owner.username) {
      res.send("Suspecious Activity");
    }
    if (!listing) {
      // Handle case where the listing is not found
      return res.status(404).send("Listing not found");
    }
    await Reviews.deleteMany({ _id: { $in: listing.reviews } });
    await Listings.findByIdAndDelete(id);
    req.flash("success", "Suggestion removed successfully");

    res.redirect("/home");
  })
);
module.exports = router;
