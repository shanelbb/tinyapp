// global variables
const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080;

// app setup
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


// app data
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// app functions
function generateRandomString(length) {
  let result = '';
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  const charLength = chars.length;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength))
  }
  return result;
}

// route GET requests
app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get('/urls', (req, res) => {
  const username = req.cookies['username']
  const templateVars = {
    urls: urlDatabase,
    submitted: false,
    error: null,
    username,
  };
  res.render('urls_index', templateVars)
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    submitted: false,
    error: null,
  };
  res.render("urls_new", templateVars);
});

app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const username = req.cookies["username"];
  const templateVars = {
    id,
    longURL: urlDatabase[id],
    username,
    submitted: false,
    error: null,
  };
  res.render("urls_show", templateVars)
})

app.get("/u/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[id]
  res.redirect(longURL);
});

// route POST requests
app.post('/urls', (req, res) => {
  const id = generateRandomString(6);
  urlDatabase[id] = req.body.longURL
  console.log(urlDatabase)
  res.redirect(`/urls/${id}`)
})
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL
  res.redirect('/urls')
})
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls')
})
app.post('/login', (req, res) => {
  const username = req.body.username.trim();
  if (!username) {
    const templateVars = {
      urls: urlDatabase,
      submitted: true,
      error: "Username input cannot be empty!",
      username: undefined
    };
    return res.render('urls_index', templateVars)   
  }
  res.cookie('username', username)
  res.redirect('/urls')
})
app.post('/logout', (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls')
})

// server listen request
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`)
})