const express = require("express");
const UsersService = require("./users-service");

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter.get("/dashboard/:user_id", jsonBodyParser, (req, res, next) => {
  UsersService.getUsersZipCodeById(req.app.get("db"), req.params.user_id)
    .then(zipcode => {
      res.json(zipcode);
      //make API calls here?
    })
    .catch(next);
});

module.exports = usersRouter;
