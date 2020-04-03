const knex = require("knex");
const jwt = require("jsonwebtoken");
const app = require("../src/app");

describe("Auth endpoints", function () {
  let db;

  const testUsers = [
    {
      id: 1,
      first_name: "Test",
      last_name: "User",
      user_email: "testuser1@mail.com",
      password: "P@ssw0rd",
      zip_code: "55555",
      icao: "KMCI",
    },
  ];

  let testUser = testUsers[0];
  let authToken;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });

    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean table", () => db.raw("TRUNCATE TABLE rideboost_users"));

  beforeEach("register and login user", (done) => {
    supertest(app)
      .post("/api/auth/signup")
      .send(testUser)
      .then((registeredUser) => {
        const { user_email, password } = testUser;
        supertest(app)
          .post("/api/auth/login")
          .send({ user_email, password })
          .then((res) => {
            authToken = res.body.authToken;
            console.log(authToken);
            done();
          });
      });
  });

  afterEach("clean up", () => db("rideboost_users").truncate());

  describe("POST /api/auth/login", () => {
    it("returns true", () => {
      supertest(app).post("/api/auth/login").expect(400);
    });
  });
});
