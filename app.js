// Get all the require modules
const express = require("express");
const session = require("cookie-session");
const { createClient } = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
const { sha256 } = require("js-sha256");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// Create an express app
const app = express();

//  Create a variable to store the current data
let CurrentData = null;

const credentials = JSON.parse(fs.readFileSync(process.env.KEY));

// Create a OAuth2 client
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive",
  ],
});

// Create a middleware
app.use(
  session({
    secret: process.env.WEBSITE_SECRET,
  })
);

// Key of each data in google sheet
// Index : "Column Name"
const TransferKey = {
  0: "Timestamp",
  1: "Email Address",
  2: "PDPA",
  3: "Authentication",
  4: "Interest",
  5: "Name Title",
  6: "ID",
  7: "First Name",
  8: "Last Name",
  9: "Nickname",
  10: "Age",
  11: "Height",
  12: "Program",
  13: "Year",
  14: "Sex",
  15: "Transgender",
  16: "Smoker",
  17: "Alcoholic",
  18: "Interested Sex",
  19: "Personality",
  20: "Appearance",
  21: "Hobbies",
  22: "Description",
  23: "MatchingMessage",
  24: "IG",
  25: "First Image",
  26: "Second Image",
  27: "Personality (Female)",
  28: "Appearance (Female)",
  29: "Personality (Male)",
  30: "Appearance (Male)",
  31: "Personality (Other)",
  32: "Appearance (Other)",
  33: "Confirmation",
};

//
let CurrentDataIndex = 0;

// List of the person
let People = {};

// Sample data
const samplePerson = {
  Nickname: "ABC",
  Name: ["DEF", "GHI"],
  description: "Very good",
  imagePath: ["/logo.png"],
  gender: "male",
  Contact: {
    IG: "sample IG",
    FB: "sample FB",
  },
};

// Storage for keeping the matching data
let Match = {};

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

// Retrive the data from the Google Sheet every minute
setInterval(async () => {
  CurrentData = await getSpreadsheetData(
    process.env.SPREADSHEET_ID,
    CurrentData
  );
}, 60000);

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

  if (req.session.confirmPerson) return res.redirect("/result");

  res.render("home");
});

app.get("/result", (req, res) => {
  if (!req.session.valid) return res.redirect("/");

  res.render("result");
});

app.get("/person", async (req, res) => {
  // Prevent the user from accessing the data without logging in
  if (!req.session.email || !req.session.valid) return res.sendStatus(400);

  req.session.personSet = {};

  // Check if the personSet is not assigned
  if (Object.keys(req.session.personSet).length == 0) {
    const SetOfPeople = await RandomPeopleSet(req.session.email);

    // Store the generated set of people and initialize the current person index
    req.session.personSet = SetOfPeople;
    req.session.currentPerson = 0;
  }

  // Get the current person based on the session index
  const selectedPerson = req.session.personSet[req.session.currentPerson];

  console.log(People[selectedPerson]);

  // Build the person data object based on `CurrentData`
  const personData = {
    Nickname: People[selectedPerson].Name.Nickname,
    Name: People[selectedPerson].Name.RName,
    Description: People[selectedPerson].Description,
    ImagePath: [
      People[selectedPerson]["First Image"],
      People[selectedPerson]["Second Image"],
    ],
    Gender: People[selectedPerson].Sex,
    Contact: {
      IG: People[selectedPerson].Contact.IG,
    },
    Age: People[selectedPerson].Age,
    Height: People[selectedPerson].Height,
    Program: People[selectedPerson].Program,
  };

  req.session.currentPerson++;

  // Send the person data to the client
  res.send({ person: personData });
});

app.get("/resultPerson", async (req, res) => {
  // Prevent the user from accessing the data without logging in
  if (!req.session.email || !req.session.valid) return res.sendStatus(400);

  // Get the current person based on the session index
  const selectedPerson = req.session.confirmPerson;

  console.log(People[selectedPerson]);

  // Build the person data object based on `CurrentData`
  const personData = {
    IG: People[selectedPerson].Contact.IG,
    ImagePath: People[selectedPerson]["First Image"],
    MatchingMessage: People[selectedPerson].MatchingMessage,
  };

  // Send the person data to the client
  res.send({ person: personData });
});

app.get("/resultData", async (req, res) => {
  // Prevent the user from accessing the data without logging in
  if (!req.session.email || !req.session.valid) return res.sendStatus(400);

  // Get the current person based on the session index
  const selectedPerson = req.session.confirmPerson;

  // Build the person data object based on `CurrentData`
  const personData = {
    ImagePath: People[hash(req.session.email)]["First Image"],
  };

  // Send the person data to the client
  res.send({ person: personData });
});

// POST method route
// ! Edit later
app.post("/login", async (req, res) => {
  // Get the data from the request
  const bodydata = req.body;
  const email = bodydata.email;
  const password = bodydata.password;

  if (email == process.env.EMAIL) return res.sendStatus(400);

  // Fetch the data from the server
  try {
    // Check whether the data is valid
    const { data, error } = await supabase
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

  if (email == process.env.EMAIL) return res.sendStatus(400);

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

// * Confirmation
app.post("/confirmation", async (req, res) => {
  req.session.confirmPerson =
    req.body.personSet[req.session.currentPerson];

  res.sendStatus(200);
});

// % Create a route
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`http://localhost:${port}`);
});

// % Hash function
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

// Get the data from the Google Sheet
getSpreadsheetData(process.env.SPREADSHEET_ID, CurrentData);

// Get the data from the Google Sheet dynamically (all current data)
// ! Fix later
async function getSpreadsheetData(spreadsheetId, currentData) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  // If the current data is unassigned, then assign and return

  try {
    // Get metadata to fetch the sheet name dynamically
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    // Get the first sheet's title
    const sheetTitle = metadata.data.sheets[0].properties.title;

    // Fetch all data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetTitle,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log("No data found in the spreadsheet.");
      return [];
    }

    // Map the rows into a JSON array
    const [headerRow, ...dataRows] = rows; // Destructure header row and data rows
    const jsonData = dataRows.map((row) => {
      return headerRow.reduce((acc, key, index) => {
        acc[TransferKey[index]] = row[index] || null; // Assign value or null if missing
        return acc;
      }, {});
    });

    CurrentData = jsonData;

    // Insert the data into the database
    while (CurrentDataIndex < jsonData.length) {
      const matchDataJson = await InsertTheData(
        jsonData[CurrentDataIndex]["Email Address"],
        jsonData[CurrentDataIndex]
      );

      console.log(jsonData[CurrentDataIndex]);

      // Insert the data into the match
      Match[hash(jsonData[CurrentDataIndex]["Email Address"])] = matchDataJson;

      // Download the image from the drive
      firstImagePath = await getDriveImage(
        jsonData[CurrentDataIndex]["First Image"],
        `public/images/${hash(jsonData[CurrentDataIndex]["Email Address"])}`
      );

      if (
        jsonData[CurrentDataIndex]["Second Image"] &&
        jsonData[CurrentDataIndex]["Second Image"] != null &&
        jsonData[CurrentDataIndex]["Second Image"] != ""
      ) {
        secondImagePath = await getDriveImage(
          jsonData[CurrentDataIndex]["Second Image"],
          `public/images/${hash(jsonData[CurrentDataIndex]["Email Address"])}`
        );
      }

      // Assign the data into the people
      People[hash(jsonData[CurrentDataIndex]["Email Address"])] = {
        tagLength: {
          Personal: {
            Personality:
              jsonData[CurrentDataIndex]["Personality"].split(",").length,
            Appearance:
              jsonData[CurrentDataIndex]["Appearance"].split(",").length,
          },
          Matching: {
            Personality:
              jsonData[CurrentDataIndex]["Personality (Male)"]?.split(",")
                .length +
              jsonData[CurrentDataIndex]["Personality (Female)"]?.split(",")
                .length +
              jsonData[CurrentDataIndex]["Personality (Other)"]?.split(",")
                .length,
            Appearance:
              jsonData[CurrentDataIndex]["Appearance (Male)"]?.split(",")
                .length +
              jsonData[CurrentDataIndex]["Appearance (Female)"]?.split(",")
                .length +
              jsonData[CurrentDataIndex]["Appearance (Other)"]?.split(",")
                .length,
          },
        },
        Contact: {
          IG: jsonData[CurrentDataIndex]["IG"]
            ? jsonData[CurrentDataIndex]["IG"]
            : null,
        },
        Transgender:
          jsonData[CurrentDataIndex]["Transgender"] == "ไม่" ? false : true,
        Name: {
          Nickname: jsonData[CurrentDataIndex]["Nickname"],
          RName: [
            jsonData[CurrentDataIndex]["First Name"],
            jsonData[CurrentDataIndex]["Last Name"],
          ],
        },
        Description: jsonData[CurrentDataIndex]["Description"],
        Sex: jsonData[CurrentDataIndex]["Sex"],
        Age: jsonData[CurrentDataIndex]["Age"],
        Height: jsonData[CurrentDataIndex]["Height"],
        Program: jsonData[CurrentDataIndex]["Program"],
        ImagePath: [firstImagePath, secondImagePath],
      };
      CurrentDataIndex++;

      console.log(People);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

// > Building the tag from the current data person
async function InsertTheData(email, personData) {
  // Convert the data into the given format
  let PersontagData = {},
    MatchtagData = {
      Male: null,
      Female: null,
      Other: null,
    };

  const interestSex = personData["Interested Sex"];

  // * Building the data to keep in the database
  if (interestSex.toString().includes("Male")) {
    MatchtagData.Male = {
      Personality: personData["Personality (Male)"]?.split(","),
      Appearance: personData["Appearance (Male)"]?.split(","),
    };
  } else if (interestSex.toString().includes("Female")) {
    MatchtagData.Female = {
      Personality: personData["Personality (Female)"]?.split(","),
      Appearance: personData["Appearance (Female)"]?.split(","),
    };
  } else {
    MatchtagData.Other = {
      Personality: personData["Personality (Other)"]?.split(","),
      Appearance: personData["Appearance (Other)"]?.split(","),
    };
  }

  PersontagData = {
    Personality: personData["Personality"].split(","),
    Appearance: personData["Appearance"].split(","),
  };

  // Insert the data into the database
  await supabase.from("UserInformation").insert([
    {
      Email: hash(email),
      MatchingTag: MatchtagData,
      PersonalTag: PersontagData,
      Sex: personData["Sex"],
    },
  ]);

  // Return the data as json
  return {
    MatchingTag: MatchtagData,
    PersonalTag: PersontagData,
    Sex: personData["Sex"],
    Interested: personData["Interested Sex"],
  };
}

async function getDriveImage(fileUrl, targetDir) {
  try {
    // Extract file ID from Google Drive URL
    const match = fileUrl.match(/[-\w]{25,}/);
    const fileId = match ? match[0] : null;

    if (!fileId) {
      console.error("Invalid Google Drive URL:", fileUrl);
      return null;
    }

    console.log(`Fetching image with ID: ${fileId}`);

    const client = await auth.getClient();
    const drive = google.drive({ version: "v3", auth: client });

    // Ensure the target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`Created target directory: ${targetDir}`);
    }

    // Get file metadata (name and MIME type)
    const fileMetadata = await drive.files.get({
      fileId,
      fields: "name, mimeType",
    });

    const mimeType = fileMetadata.data.mimeType;
    const mimeExtensions = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/gif": "gif",
      "image/webp": "webp",
      "image/bmp": "bmp",
      "image/tiff": "tiff",
    };

    const fileExtension = mimeExtensions[mimeType] || "";
    if (!fileExtension) {
      console.error("Unsupported file type:", mimeType);
      return null;
    }

    const fileName = `${fileId}.${fileExtension}`;
    const filePath = path.join(targetDir, fileName);

    // 🔥 Ensure the file can be written (fixes the error)
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    // Download the image
    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    await new Promise((resolve, reject) => {
      const dest = fs.createWriteStream(filePath);
      response.data
        .on("end", () => {
          console.log(`Image downloaded successfully to ${filePath}`);
          resolve();
        })
        .on("error", (err) => {
          console.error("Error downloading image:", err);
          reject(err);
        })
        .pipe(dest);
    });

    return filePath;
  } catch (error) {
    console.error("Error processing image:", error);
    return null;
  }
}


// > Do the following procedure
// > 1. Select the n people with same tag (matching tag and the requested person tag)
// > 2. If the selected people are more than n, then cut off the exceed people
// > 3. Select the most match tag and then reduce the bias like ignore 1 tag, etc.
async function RandomPeopleSet(email) {
  // Fetch dynamic personData based on hashed email
  const personData = Match[hash(email)];
  const numberOfPeople = 9;

  console.log("Your Data:", personData);

  // Determine which key in `MatchingTag` contains a non-null value
  const matchingKey = Object.keys(personData.MatchingTag).find(
    (key) => personData.MatchingTag[key] !== null
  );

  if (!matchingKey) {
    console.error("No valid matching data found in MatchingTag");
    return [];
  }

  const matchingTags = personData.MatchingTag[matchingKey];

  // Fetch all people and calculate matching percentages
  const allPeople = Object.keys(Match).map((key) => {
    const otherPerson = Match[key];

    console.log(otherPerson);

    // Skip comparison with yourself
    if (
      key === hash(email) ||
      !personData.Interested.toString().includes(otherPerson.Sex) || 
      !otherPerson.Interested.toString().includes(personData.Sex)
    )
      return null;

    // Extract `PersonalTag` of the other person
    const otherPersonalTag = otherPerson.PersonalTag;

    // Compare `yourself` (MatchingTag) with `other people's` PersonalTag
    const matchingPersonality = matchingTags.Personality.filter((tag) =>
      otherPersonalTag.Personality.includes(tag)
    ).length;

    const matchingAppearance = matchingTags.Appearance.filter((tag) =>
      otherPersonalTag.Appearance.includes(tag)
    ).length;

    // Calculate total matches and percentage
    const totalMatches = matchingPersonality + matchingAppearance;
    const totalTags =
      otherPersonalTag.Personality.length + otherPersonalTag.Appearance.length;
    const matchPercentage = (totalMatches / totalTags) * 100;

    return { header: key, matchPercentage };
  });

  // Remove null values (from skipping yourself) and sort by match percentage
  const filteredPeople = allPeople
    .filter(Boolean)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

  // Randomly select from the highest matches
  const selectedPeople = filteredPeople
    .slice(0, numberOfPeople)
    .map((p) => p.header);

  console.log("Selected Headers (Matched People):", selectedPeople);
  return selectedPeople;
}
