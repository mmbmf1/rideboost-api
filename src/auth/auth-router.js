const express = require("express");
const AuthService = require("./auth-service");

const authRouter = express.Router();
const jsonBodyParser = express.json();

authRouter.post("/login", jsonBodyParser, (req, res, next) => {
  const { user_email, password } = req.body;
  const loginUser = { user_email, password };

  for (const [key, value] of Object.entries(loginUser))
    if (value == null)
      return res.status(400).json({
        error: `Missing '${key}' in request body`
      });
  AuthService.getUserWithUserEmail(req.app.get("db"), loginUser.user_email)
    .then(dbUser => {
      if (!dbUser)
        return res.status(400).json({
          error: `Incorrect User Name or Password`
        });

      return AuthService.comparePasswords(
        loginUser.password,
        dbUser.password
      ).then(compareMatch => {
        if (!compareMatch)
          return res.status(400).json({
            error: `Incorrect User Name or Password`
          });

        const sub = dbUser.user_email;
        const payload = { user_id: dbUser.id };

        res.send({
          authToken: AuthService.createJwt(sub, payload),
          payload
        });
      });
    })
    .catch(next);
});

authRouter.post("/signup", jsonBodyParser, (req, res, next) => {
  const {
    first_name,
    last_name,
    user_email,
    password,
    zip_code,
    icao
  } = req.body;

  for (const field of [
    "first_name",
    "last_name",
    "user_email",
    "password",
    "zip_code",
    "icao"
  ])
    if (!req.body[field])
      return res.status(400).json({
        error: `${field} is required`
      });

  const passwordError = AuthService.validatePassword(password);

  if (passwordError) return res.status(400).json({ error: passwordError });

  AuthService.hasUserWithEmail(req.app.get("db"), user_email)
    .then(hasUserWithUserEmail => {
      if (hasUserWithUserEmail)
        return res.status(400).json({ error: `${user_email} already in user` });

      return AuthService.hashPassword(password).then(hashedPassword => {
        const newUser = {
          first_name,
          last_name,
          user_email,
          password: hashedPassword,
          zip_code,
          icao,
          date_created: "now()"
        };

        return AuthService.insertUser(req.app.get("db"), newUser).then(user => {
          res.status(201).json(AuthService.serializeUser(user));
        });
      });
    })
    .catch(next);
});

module.exports = authRouter;
