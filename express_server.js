// ----------------
// GLOBAL VARIABLES
// ----------------
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail, verifyUser, generateRandomString } = require('helpers.js')
const app = express();
const PORT = 8080;

// --------
// APP SETUP
// --------
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

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
  const user = req.session["user_id"];
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
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = {
    id,
    url: urlDatabase[id],
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const userId = req.session["user_id"];
  const templateVars = {
    user: users[userId],
    query: req.query.error,
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const user = req.session["user_id"];
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
  if (!req.session["user_id"]) {
    return res.redirect("/login");
  }
  const id = generateRandomString(6);
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session["user_id"];
  const urlID = req.params.id;
  if (!urlDatabase[urlID]) {
    return res.status(404).send("URL not found.");
  }

  // Check if the user owns the URL
  if (urlDatabase[urlID].userID !== userID) {
    return res.status(403).send("You do not have permission to edit this URL.");
  }

  urlDatabase[urlID].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session["user_id"];
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

  const userId = verifyUser(email, password, users);

  if (userId) {
    req.session.user_id = userId;
    res.redirect("/urls");
  } else {
    res.redirect(`/login?error=validation`);
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
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

  if (getUserByEmail(email, users)) {
    res.redirect(`/register?error=duplicate`);
    return;
  }

  users[id] = {
    id,
    email,
    password : hashedPassword
  };
 
  req.session.user_id = id;
  res.redirect("/urls");
});

// ---------------------
// SERVER LISTEN REQUEST
// ---------------------
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
