const jwt = require("jsonwebtoken");

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_email,
    algorithm: "HS256",
  });
  return `bearer ${token}`;
}

module.exports = {
  makeAuthHeader,
};
