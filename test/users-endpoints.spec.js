const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Users endpoint", function () {
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

  const testUser = testUsers[0];

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });

    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean table", () => db("rideboost_users").truncate());

  afterEach("clean up", () => db("rideboost_users").truncate());

  describe.only("GET /api/user/dashboard/:user_id", () => {
    beforeEach("insert test user", () => {
      return db.into("rideboost_users").insert(testUser);
    });
    it("responds 200 with user info", () => {
      const user_id = testUser.id;
      return supertest(app)
        .get(`/api/user/dashboard/${user_id}`)
        .set("Authorization", helpers.makeAuthHeader(testUser))
        .expect(200);
    });
  });
});
