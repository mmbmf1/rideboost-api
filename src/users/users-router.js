const express = require("express");
const unirest = require("unirest");
const moment = require("moment-timezone");
const zipcodes = require("zipcodes");
const zipcode_to_timezone = require("zipcode-to-timezone");
const airports = require("airport-codes");
const { requireAuth } = require("../middleware/jwt-auth");
const UsersService = require("./users-service");
const config = require("../config");

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter
  .route("/dashboard/:user_id")
  .get(requireAuth, jsonBodyParser, (req, res, next) => {
    UsersService.getUsersZipCodeById(req.app.get("db"), req.params.user_id)
      .then((user_data) => {
        const zip_code = user_data[0].zip_code;
        const icao = user_data[0].icao;
        const timezone = zipcode_to_timezone.lookup(zip_code);
        const currentDate = moment
          .tz(moment(), timezone)
          .format("YYYY-MM-DDTHH:mm");
        const futureDate = moment
          .tz(moment(), timezone)
          .add(1, "h")
          .format("YYYY-MM-DDTHH:mm");

        console.log(currentDate, futureDate);

        const location = zipcodes.lookup(zip_code);
        const airport = airports.findWhere({ icao: icao }).get("iata");

        const currentWeatherPromise = new Promise((resolve, reject) => {
          unirest(
            "GET",
            `https://api.openweathermap.org/data/2.5/weather?zip=${zip_code},us&appid=${config.WEATHER_KEY}`
          ).end((res) => {
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
          ).end((res) => {
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
            `https://aerodatabox.p.rapidapi.com/flights/airports/icao/${icao}/${currentDate}/${futureDate}?withLeg=false`
          )
            .headers({
              "x-rapidapi-host": "aerodatabox.p.rapidapi.com",
              "x-rapidapi-key": `${config.AIRLINE_KEY}`,
            })
            .end((res) => {
              if (res.error) {
                reject(res.error);
              } else {
                resolve(JSON.parse(res.raw_body));
              }
            });
        });

        const eventPromise = new Promise((resolve, reject) => {
          unirest(
            "GET",
            `http://api.eventful.com/json/events/search?app_key=${config.EVENT_KEY}&location=${zip_code}&date=Today&within=15&category=music, sports&mature=safe&change_multi_day_start=true`
          ).end((res) => {
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
          location,
          airport,
          currentDate,
          futureDate,
        ])
          .then((data) => res.json({ data }))
          .catch((error) => {
            console.error(error.message);
            next(error.message);
          });
      })
      .catch(next);
  });

module.exports = usersRouter;
