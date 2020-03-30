const express = require("express");
const unirest = require("unirest");
const moment = require("moment");
const UsersService = require("./users-service");
const config = require("../config");

const usersRouter = express.Router();
const jsonBodyParser = express.json();

//add middleware for jwt auth
usersRouter.get("/dashboard/:user_id", jsonBodyParser, (req, res, next) => {
  let currentWeatherData;
  let forecastWeatherData;
  let eventData;
  let arrivalData;
  let departureData;

  UsersService.getUsersZipCodeById(req.app.get("db"), req.params.user_id)
    .then(zipcode => {
      res.json(zipcode);
      const zip_code = zipcode[0].zip_code;
      const currentDate = moment().format("YYYY-MM-DDTHH:MM");
      const futureDate = moment()
        .add(3, "h")
        .format("YYYY-MM-DDTHH:MM");

      //currentWeatherData
      var req = unirest(
        "GET",
        `https://api.openweathermap.org/data/2.5/weather?zip=${zip_code},us&appid=${config.WEATHER_KEY}`
      ).end(function(res) {
        if (res.error) throw new Error(res.error);
        currentWeatherData = res.raw_body;
        // console.log(currentWeatherData);
      });

      //forecastWeatherData
      var req = unirest(
        "GET",
        `https://api.openweathermap.org/data/2.5/forecast?zip=${zip_code},us&appid=${config.WEATHER_KEY}`
      ).end(function(res) {
        if (res.error) throw new Error(res.error);
        forecastWeatherData = res.raw_body;
        // console.log(forecastWeatherData);
      });

      //arrivalData request
      var req = unirest(
        "GET",
        `https://aerodatabox.p.rapidapi.com/flights/airports/icao/KMCI/${currentDate}/${futureDate}?withLeg=false&direction=Arrival`
      )
        .headers({
          "x-rapidapi-host": "aerodatabox.p.rapidapi.com",
          "x-rapidapi-key": `${config.AIRLINE_KEY}`
        })
        .end(function(res) {
          if (res.error) throw new Error(res.error);
          arrivalData = res.raw_body;
          // console.log(arrivalData);
        });

      //departureData request
      var req = unirest(
        "GET",
        `https://aerodatabox.p.rapidapi.com/flights/airports/icao/KMCI/${currentDate}/${futureDate}?withLeg=false&direction=Departure`
      )
        .headers({
          "x-rapidapi-host": "aerodatabox.p.rapidapi.com",
          "x-rapidapi-key": `${config.AIRLINE_KEY}`
        })
        .end(function(res) {
          if (res.error) throw new Error(res.error);
          departureData = res.raw_body;
          // console.log(departureData);
        });

      //eventData request
      var req = unirest(
        "GET",
        `http://api.eventful.com/json/events/search?app_key=${config.EVENT_KEY}&location=${zip_code}&date=today&within=52&sort_order=popularity`
      ).end(function(res) {
        if (res.error) throw new Error(res.error);
        eventData = res.raw_body;
        // console.log(eventData);
      });

      //returns undefined for all
      // res.json({ currentWeatherData, forecastWeatherData, arrivalData, departureData, eventData });
    })
    .catch(next);
});

module.exports = usersRouter;
