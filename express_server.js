// ----------------
// GLOBAL VARIABLES
// ----------------
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {urlDatabase, userDatabase, getUserByEmail, generateRandomString, urlsForUser} = require("./helpers");
const app = express();
const PORT = 8080;

// --------
// APP SETUP
// --------
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// ------------------
// ROUTE GET REQUESTS
// ------------------
app.get("/", (req, res) => {
   const userId = req.session.user_id;
   const user = userDatabase[userId];
   if (user) {
     return res.redirect("/urls");
   }
  
  return res.status(302).redirect("/login");
});

app.get("/urls", (req, res) => {
  const user = userDatabase[req.session.user_id];
  if (!user) {
    return res.send("No user found. Please log in.");
  }
  
  const urls = urlsForUser(user);

  const templateVars = {urls, user};
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
   const userId = req.session.user_id;
   const user = userDatabase[userId];
   if (!user) {
     return res.redirect("/login");
   }
  
  const templateVars = {user};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const urlEntry = urlDatabase[id];
  const user = userDatabase[req.session.user_id];
  if (!urlEntry) {
    return res.status(404).send("URL not found");
  }

  if (!user) {
    return res.status(403).send("You must be logged in");
  }

  if (urlEntry.userID !== user.id) {
    return res.status(403).send("You do not have permission to view this page");
  }
  const templateVars = {
    id,
    url: urlEntry.longURL,
    user,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/login", (req, res) => {
  const userId = req.session["user_id"];
  const user = userDatabase[userId];
  if (user) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user,
    query: req.query.error,
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const userId = req.session["user_id"];
  const user = userDatabase[userId];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user,
    query: req.query.error,
  };
  res.render("register", templateVars);
});

// -------------------
// ROUTE POST REQUESTS
// -------------------

app.post("/urls", (req, res) => {
   const userId = req.session["user_id"];
   const user = userDatabase[userId];
   if (!user) {
     return res.redirect("/login");
   }
  
  const id = generateRandomString(6);
  urlDatabase[id] = {
    id: id,
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };

  return res.redirect(`/urls`);
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

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  urlDatabase[id].longUrl = req.body.newURL;

  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session["user_id"];
  const url = urlDatabase[req.params.id];

  if (!url) {
    return res.status(404).send("URL not found.");
  }

  if (url.userID !== userID) {
    return res.status(403).send("You do not have permission to delete this URL.");
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.send("Input cannot be empty");
    return;
  }

  const user = getUserByEmail(email, userDatabase);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Invalid login");
    return;
  }

  req.session.user_id = user.id;
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const { email, password: passwordText  } = req.body;

  if (!email || !passwordText) {
    res.send("Input cannot be empty");
    return;
  }

  if (getUserByEmail(email, userDatabase)) {
    res.send("User already exists");
    return;
  }

  const password = bcrypt.hashSync(passwordText, 10);
  const id = generateRandomString(6);
  userDatabase[id] = {id, email, password};

  req.session.user_id = id;
  res.redirect("/urls");
});

// ---------------------
// SERVER LISTEN REQUEST
// ---------------------
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
