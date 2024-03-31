// global variables
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

// app setup
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


// app data
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {};

// app functions
const generateRandomString = (length) => {
  let result = "";
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  const charLength = chars.length;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};

const checkForUser = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

// route GET requests

app.get("/urls", (req, res) => {
  const user = req.cookies["user_id"];
  const templateVars = {
    urls: urlDatabase,
    user: users[user],
    alert: 'Page does not exist!'
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = {
    id,
    longURL: urlDatabase[id],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.get('/login', (req, res) => {
  if (req.cookies.user_id) {
    return res.redirect("/urls");
  }
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId],
    query: req.query.error,
  };

  res.render('login', templateVars);
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  const user = req.cookies["user_id"];
  const templateVars = {
    user: users[user],
    query: req.query.error
  };
  res.render("register", templateVars);
});

// route POST requests
app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const id = generateRandomString(6);
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.redirect(`/login?error=blankInput`);
    return;
  }
  
  const userId = checkForUser(email);
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
  const {email, password} = req.body;
  if (!email || !password) {
    res.redirect(`/register?error=blankInput`);
  }


  
  if (checkForUser(email)) {
    res.redirect(`/register?error=duplicate`);
    return;
  }

  users[id] = {
    id,
    email,
    password,
  };

  res.cookie("user_id", id);
  res.redirect("/urls");
});

// server listen request
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
