// ----------------
// GLOBAL VARIABLES
// ----------------
const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

// --------
// APP SETUP
// --------
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// --------
// APP DATA
// --------
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {};

// -------------
// APP FUNCTIONS
// -------------
const generateRandomString = (length) => {
  let result = "";
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  const charLength = chars.length;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};

const checkForUser = (email, password) => {
  for (let user in users) {
    if (users[user].email === email && bcrypt.compareSync(password, users[user].password)) {
      return user;
    }
  }
  return null;
};

const urlsForUser = (id) => {
  let userUrls = {};
  for (let urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      userUrls[urlId] = urlDatabase[urlID]
    }
  }
  return userUrls;
}

// ------------------
// ROUTE GET REQUESTS
// ------------------

app.get("/urls", (req, res) => {
  const user = req.cookies["user_id"];
  if (!user) {
    return res.redirect('/login');
  }

  const userOwnedURLs = urlsForUser(user)

  const templateVars = {
    urls: userOwnedURLs,
    user: users[user],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = {
    id,
    url: urlDatabase[id],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  if (req.cookies.user_id) {
    return res.redirect("/urls");
  }
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId],
    query: req.query.error,
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  const user = req.cookies["user_id"];
  const templateVars = {
    user: users[user],
    query: req.query.error,
  };
  res.render("register", templateVars);
});

// -------------------
// ROUTE POST REQUESTS
// -------------------

app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const id = generateRandomString(6);
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  }
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const urlID = req.params.id;
  if (!urlDatabase[urlID]) {
    return res.status(404).send("URL not found.");
  }

  // Check if the user owns the URL
  if (urlDatabase[urlID].userID !== userID) {
    return res.status(403).send("You do not have permission to edit this URL.");
  }

  urlDatabase[urlID] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.cookies["user_id"];
  const urlID = req.params.id;
  const url = urlDatabase[urlID];

  if (!url) {
    return res.status(404).send("URL not found.");
  }

  if (url.userId !== userID) {
    return res.status(403).send("You do not have permission to delete this URL.");
  }

  delete urlDatabase[urlID];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    res.redirect(`/login?error=blankInput`);
    return;
  }

  const userId = checkForUser(email, password);

  if (userId) {
    res.cookie("user_id", userId);
    res.redirect("/urls");
  } else {
    res.redirect(`/login?error=validation`);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const id = generateRandomString(6);
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10)

  if (!email || !password) {
    res.redirect(`/register?error=blankInput`);
    return;
  }

  if (checkForUser(email)) {
    res.redirect(`/register?error=duplicate`);
    return;
  }

  users[id] = {
    id,
    email,
    password : hashedPassword
  };
 
  res.cookie("user_id", users[id]);
  res.redirect("/urls");
});

// ---------------------
// SERVER LISTEN REQUEST
// ---------------------
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
