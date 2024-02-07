if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}
const dbUrl=process.env.ATLASDB_URL;
const express = require("express");// requiring express
const app = express();             //  ----storing 
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const Listings = require("./models/listings");
const Reviews = require("./models/review");
const User = require("./models/users");
const ExpressError = require("./utils/ExpressError");
const wrapasync = require("./utils/wrapasync");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const rlisting = require("./routes/rlisting");
const rreviews = require("./routes/rreview");
const { isLogedIn } = require("./utils/middlewares");

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((e) => {
    console.log(e);
  });
async function main() {
  await mongoose.connect(dbUrl);
}
app.listen(8080, () => {
  console.log("Server is listening on Port 8080");
});
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views/body"));
app.use(express.urlencoded({ extended: true })); //to access the data inside request
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

const store=  MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET
  },
  touchAfter:24*3600,
});
store.on("error", ()=>{
  console.log("Error in mongo Session store",err);
})
const sopt = {
  store,
  secret:process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, //To prevent cross scripting attacks
  },
};




app.use(session(sopt));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.currUser = req.user;

  next();
});

app.use("/", rlisting);
app.use("/", rreviews);

app.get("/signup", (req, res) => {
  res.render("sform.ejs");
});
app.post("/signup",wrapasync( async (req, res) => {
  let { username, email, password } = req.body;
  let u1 = new User({
    email: email,
    username: username,
  });
  let rUser = await User.register(u1, password);
  req.login(rUser, (err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "SignUp Successfully");
    res.redirect("/home");
  });
}));
app.get("/login", (req, res) => {
  res.render("lform.ejs");
});
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureflash: true,
    failureMessage: "Wrong info",
  }),
  wrapasync(
  async (req, res) => {
    req.flash("success", "You are logedin  now");
    res.redirect("/home");
  }
));
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out");
    res.redirect("/home");
  });
});
//$$$$$$$$$$$Cetegories$$$$$$
app.get(
  "/men",
  wrapasync(async (req, res) => {
    let listings = await Listings.find();
    res.render("men.ejs", { listings });
  })
);
app.get(
  "/women",
  wrapasync(async (req, res) => {
    let listings = await Listings.find();
    res.render("women.ejs", { listings });
  })
);
app.get(
  "/winter",
  wrapasync(async (req, res) => {
    let listings = await Listings.find();
    res.render("winter.ejs", { listings });
  })
);
app.get(
  "/summer",
  wrapasync(async (req, res) => {
    let listings = await Listings.find();
    res.render("summer.ejs", { listings });
  })
);
app.get(
  "/upper",
  wrapasync(async (req, res) => {
    let listings = await Listings.find();
    res.render("upper.ejs", { listings });
  })
);
app.get(
  "/lower",
  wrapasync(async (req, res) => {
    let listings = await Listings.find();
    res.render("lower.ejs", { listings });
  })
);
app.get(
  "/accessories",
  wrapasync(async (req, res) => {
    let listings = await Listings.find();
    res.render("accessories.ejs", { listings });
  })
);

//#######################
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode, message } = err;
  res.render("error.ejs", { statusCode, message });
  // res.status(statusCode).send(message);
});
