const bcrypt = require("bcryptjs");
const getUserByEmail = function(email, userObj) {
  
  if (typeof userObj !== "object" || userObj === null) {
    throw new TypeError(`${userObj} is not a valid object`);
  }
  // Check if 'email' is a string and not null
  if (typeof email !== "string" || email === null) {
    throw new TypeError(`${email} is not a valid string`);
  }

  for (let key in userObj) {
    if (userObj[key].email === email) {
      return userObj[key];
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

const verifyUser = function (email, password, usersObj) {
  for (let key in usersObj) {
    // Check if the email matches and then use bcrypt to compare the password
    if (usersObj[key].email === email && bcrypt.compareSync(password, usersObj[key].password)) {
      return key; // Return user's ID on successful match
    }
  }
  return null; // Return null if no matching user is found
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  verifyUser,
};
