const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const xss = require("xss");

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const AuthService = {
  getUserWithUserEmail(db, user_email) {
    return db("rideboost_users")
      .where({ user_email })
      .first();
  },

  comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
  },

  createJwt(subject, payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      expiresIn: config.JWT_EXPIRY,
      algorithm: "HS256"
    });
  },

  verifyJwt(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ["HS256"]
    });
  },

  validatePassword(password) {
    if (password.length < 8) {
      return "Password must be longer than 8 characters";
    }

    if (password.length > 72) {
      return "Password must be less than 72 characters";
    }

    if (password.startsWith(" ") || password.endsWith(" ")) {
      return "Password cannot start or end with empty spaces";
    }

    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return "Password must contain 1 uppercase, lower case, number and special character";
    }

    return null;
  },

  hasUserWithEmail(db, user_email) {
    return db("rideboost_users")
      .where({ user_email })
      .first()
      .then(email => !!email);
  },

  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into("rideboost_users")
      .returning("*")
      .then(([user]) => user);
  },

  serializeUser(user) {
    return {
      id: user.id,
      first_name: xss(user.first_name),
      last_name: xss(user.last_name),
      user_email: xss(user.user_email),
      date_created: new Date(user.date_created)
    };
  }
};

module.exports = AuthService;
