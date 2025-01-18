// Get all the require modules
const express = require("express");
const session = require("cookie-session");
const { createClient } = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
const { sha256 } = require("js-sha256");
const nodemailer = require("nodemailer");

// Create an express app
const app = express();

// Create a middleware
app.use(
  session({
    secret: process.env.WEBSITE_SECRET,
  })
);

// Set the view engine
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set the port
const port = process.env.PORT || 4000;

const emailEx = "bank";
const passwordEx = "bank";

// Create a supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// GET method route
app.get("/", (req, res) => {
  req.session = null;

  res.redirect("/login");
});

app.get("/login", (req, res) => {
  req.session = null;

  res.render("login");
});

app.get("/register", (req, res) => {
  req.session = null;

  res.render("signup");
});

app.get("/OTP", (req, res) => {
  if (!req.session.OTP) return res.redirect("/");

  res.render("otp", { email: req.session.email });
});

app.get("/home", (req, res) => {
  if (!req.session.valid) return res.redirect("/");

  res.render("home");
});

app.get("/result", (req, res)=>{
  res.render("result");
})

// POST method route
// ! Edit later
app.post("/login", async (req, res) => {
  // Get the data from the request
  const bodydata = req.body;
  const email = bodydata.email;
  const password = bodydata.password;

  // Fetch the data from the server
  try {
    // Check whether the data is valid
    const { data,error } = await supabase
      .from("UserData")
      .select("Email")
      .eq("Email", hash(email).toString())
      .eq("Password", hash(password).toString());

    // Check if there is an error
    if (error) {
      throw error;
      return;
    }

    // Check if the data is valid
    if (data.length == 0) return res.sendStatus(400);

  } catch (err) {
    console.error(err);
  }

  req.session.email = email;
  req.session.valid = true;

  // Check if the email and password is valid
  return res.sendStatus(200);
});

// * Register (Sign UP)
app.post("/register", async (req, res) => {
  // Get the data from the request
  const bodydata = req.body;
  const email = bodydata.email;
  const password = bodydata.password;

  // Check if the email and password is valid
  try {
    const { data, error } = await supabase
      .from("UserData")
      .select("Email")
      .eq("Email", hash(email));

    // Check if there is an error
    if (error) {
      throw error;
      return;
    }

    // Check if the data is valid
    if (data.length > 0) return res.sendStatus(400);

    // Sending the OTP to the target email
    const OTP = Math.floor(100000 + Math.random() * 900000);

    req.session.OTP = OTP;
    sendOTP(email, OTP);

    // Assign the email into the session
    req.session.email = email;
    req.session.password = password;
  } catch (err) {
    console.error(err);
  }

  return res.sendStatus(200);
});

// * OTP
app.post("/OTP", async (req, res) => {
  const OTP = req.body.OTP;

  if (parseInt(req.session.OTP) == parseInt(OTP)) {
    // Insert the data into the database
    await supabase.from("UserData").insert([
      {
        Email: hash(req.session.email),
        Password: hash(req.session.password),
      },
    ]);

    req.session.valid = true;

    return res.sendStatus(200);
  } else {
    return res.sendStatus(400);
  }
});

// * Resend OTP
app.post("/resendOTP", (req, res) => {
  sendOTP(req.session.email);
  return res.sendStatus(200);
});

app.post("/person", (req, res) => {

  // Prevent the user from accessing the data without logging in
  if(!req.session.email || !req.session.valid) return res.sendStatus(400);

  let person = GetPerson();

  // Send the data to the client
  res.send({ person: person });
});

// Create a route
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`http://localhost:${port}`);
});

// Hash function
function hash(password) {
  return sha256(password);
}

// Sending the OTP again
function sendOTP(email, OTP) {
  // Sending the email to the target email
  var mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "- OTP -",
    text: `Your OTP is ${OTP}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } 
  });
}

// Get the random person
