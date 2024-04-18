const bcrypt = require("bcryptjs");

// --------
// APP DATA
// --------
const urlDatabase = {
  b6UTxQ: {
    id: "b6UTxQ",
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    id: "i3BoGr",
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const userDatabase = {};

// -------------
// APP FUNCTIONS
// -------------

const getUserByEmail = function(email, userDatabase) {
  
  if (typeof userDatabase !== "object" || userDatabase === null) {
    throw new TypeError(`${userDatabase} is not a valid object`);
  }
  // Check if 'email' is a string and not null
  if (typeof email !== "string" || email === null) {
    throw new TypeError(`${email} is not a valid string`);
  }

  for (let key in userDatabase) {
    const user = userDatabase[key]
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const generateRandomString = (length) => {
  let result = "";
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const charLength = chars.length;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};

const urlsForUser = (user) => {
  let urls = {};
  for (let id in urlDatabase) {
    if (urlDatabase[id].userID === user.id) {
      urls[id] = urlDatabase[id];
    }
  }
  return urls;
};


module.exports = {
  urlDatabase,
  userDatabase,
  getUserByEmail,
  generateRandomString,
  urlsForUser
};
