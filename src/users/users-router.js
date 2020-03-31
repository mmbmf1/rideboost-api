const express = require("express");
const unirest = require("unirest");
const moment_timezone = require("moment-timezone");
const zipcodes = require("zipcodes");
const zipcode_to_timezone = require("zipcode-to-timezone");
// const airports = require("airport-codes");
const UsersService = require("./users-service");
const config = require("../config");

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter.get("/dashboard/:user_id", jsonBodyParser, (req, res, next) => {
  UsersService.getUsersZipCodeById(req.app.get("db"), req.params.user_id)
    .then(zipcode => {
      const zip_code = zipcode[0].zip_code;
      const timezone = zipcode_to_timezone.lookup(zip_code);
      const currentDate = moment_timezone()
        .tz(timezone)
        .format("YYYY-MM-DDTHH:MM");
      const futureDate = moment_timezone()
        .tz(timezone)
        .add(1, "h")
        .format("YYYY-MM-DDTHH:MM");

      const location = zipcodes.lookup(zip_code);

      // console.log(location);

      // const airport = airports.findWhere({ city: location.city }).get('icao');

      // console.log(airport);

      const currentWeatherPromise = new Promise((resolve, reject) => {
        unirest(
          "GET",
          `https://api.openweathermap.org/data/2.5/weather?zip=${zip_code},us&appid=${config.WEATHER_KEY}`
        ).end(res => {
          if (res.error) {
            reject(res.error);
          } else {
            resolve(JSON.parse(res.raw_body));
          }
        });
      });

      const forecastWeatherPromise = new Promise((resolve, reject) => {
        unirest(
          "GET",
          `https://api.openweathermap.org/data/2.5/forecast?zip=${zip_code},us&appid=${config.WEATHER_KEY}`
        ).end(res => {
          if (res.error) {
            reject(res.error);
          } else {
            resolve(JSON.parse(res.raw_body));
          }
        });
      });

      const airlinePromise = new Promise((resolve, reject) => {
        unirest(
          "GET",
          `https://aerodatabox.p.rapidapi.com/flights/airports/icao/KMCI/${currentDate}/${futureDate}?withLeg=false`
        )
          .headers({
            "x-rapidapi-host": "aerodatabox.p.rapidapi.com",
            "x-rapidapi-key": `${config.AIRLINE_KEY}`
          })
          .end(res => {
            if (res.error) {
              reject(res.error);
            } else {
              resolve(JSON.parse(res.raw_body));
            }
          });
      });

      // const departuresPromise = new Promise((resolve, reject) => {
      //   unirest(
      //     "GET",
      //     `https://aerodatabox.p.rapidapi.com/flights/airports/icao/KMCI/${currentDate}/${futureDate}?withLeg=false&direction=Departure`
      //   )
      //     .headers({
      //       "x-rapidapi-host": "aerodatabox.p.rapidapi.com",
      //       "x-rapidapi-key": `${config.AIRLINE_KEY}`
      //     })
      //     .end(res => {
      //       if (res.error) {
      //         reject(res.error);
      //       } else {
      //         resolve(JSON.parse(res.raw_body));
      //       }
      //     });
      // });

      const eventPromise = new Promise((resolve, reject) => {
        unirest(
          "GET",
          `http://api.eventful.com/json/events/search?app_key=${config.EVENT_KEY}&location=${zip_code}&date=Today&within=15&category=music, sports&sort_order=date&mature=safe`
        ).end(res => {
          if (res.error) {
            reject(res.error);
          } else {
            resolve(JSON.parse(res.raw_body));
          }
        });
      });

      Promise.all([
        currentWeatherPromise,
        forecastWeatherPromise,
        airlinePromise,
        eventPromise,
        location
      ]).then(data => res.json({ data }));
    })
    .catch(next);
});

module.exports = usersRouter;
