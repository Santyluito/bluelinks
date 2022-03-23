const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const flash = require("connect-flash");
const passport = require("passport");
const { create } = require("express-handlebars");
var csrf = require("csurf");
const User = require("./models/User");
require("dotenv").config();
const clientDB = require("./db/db");

const app = express();

const corsOptions = {
  credentials: true,
  origin: process.env.PATHHEROKU || "*",
  // optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  methods: ["GET", "POST"],
};

app.use(cors());

app.use(
  session({
    secret: process.env.SECRETSESSION,
    resave: false,
    saveUninitialized: false,
    name: "secret-user",
    store: MongoStore.create({
      clientPromise: clientDB,
      dbName: process.env.DBNAME,
    }),
    cookie: {
      secure: process.env.MODO === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) =>
  done(null, { id: user._id, userName: user.userName })
); //req.user
passport.deserializeUser(async (user, done) => {
  // es necesario revisar la db???
  const userDB = await User.findById(user.id);
  return done(null, { id: userDB._id, userName: user.userName });
});

const hbs = create({
  extname: ".hbs",
  partialsDir: ["Views/components"],
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

app.use(csrf());

app.use(mongoSanitize());

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.mensajes = req.flash("mensajes");
  next();
});

app.use("/", require("./routes/home"));
app.use("/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("😍 app listening on port:" + PORT));
