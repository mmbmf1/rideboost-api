module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL || "postgresql://michael_mace@localhost/rideboost",
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL ||
    "postgresql://michael_mace@localhost/rideboost-test",
  JWT_SECRET: process.env.JWT_SECRET || "change-this-secret",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "3h",
  WEATHER_KEY: process.env.WEATHER_KEY,
  AIRLINE_KEY: process.env.AIRLINE_KEY,
  EVENT_KEY: process.env.EVENT_KEY,
};
