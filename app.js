// Get all the require modules
const express = require("express");
const session = require("cookie-session");
const { createClient } = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
const { sha256 } = require("js-sha256");

// Create an express app
const app = express();

// Create a middleware
app.use(
  session({
    secret: "hello",
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
    env.SUPABASE_URL,
    env.SUPABASE_KEY
);

// GET method route
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("signup");
});

app.get("/home", (req, res) => {
  res.render("home");
});

// POST method route
// ! Edit later
app.post("/login", async (req, res) => {
  // Get the data from the request
  const data = req.body;
  const email = data.email;
  const password = data.password;

  // Fetch the data from the server
  try {
    const { resultdata, error } = await supabase
      .from("UserData")
      .select("Email, Password")
      .eq("Email", hash(email), "Password", hash(data.password));

    // Check if there is an error
    if (error) {
      throw error;
      return;
    }

    // Check if the data is valid
    if (!resultdata) return res.sendStatus(400);
  } catch (err) {
    console.error(err);
  }

  req.session.email = email;

  // Check if the email and password is valid
  return res.sendStatus(200);
});

app.post("/register", async (req, res) => {
  // Get the data from the request
  const data = req.body;
  const email = data.email;
  const password = data.password;

  // Check if the email and password is valid
  try {
    const { resultdata, error } = await supabase
      .from("UserData")
      .select("Email, Password")
      .eq("Email", hash(email), "Password", hash(data.password));

    // Check if there is an error
    if (error) {
      throw error;
      return;
    }

    // Check if the data is valid
    if (resultdata) return res.sendStatus(400);

    // Insert the data to the server
    const { result, err } = await supabase
      .from("UserData")
      .insert([{ Email: hash(email), Password: hash(password) }]);

    // Check if there is an error
    if (err) {
      throw err;
      return;
    }

  } catch (err) {
    console.error(err);
  }

  return res.sendStatus(200);
});

// Create a route
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`http://localhost:${port}`);
});

// Hash function
// ! Edit later
function hash(password) {
  return sha256(password);
}
