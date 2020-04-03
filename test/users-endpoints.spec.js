const knex = require("knex");
const app = require("../src/app");

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

  //need help with this test

  describe("GET /api/user/dashboard/:user_id", () => {
    // beforeEach("insert test user", () => {
    //   return db.into("rideboost_users").insert(testUser);
    // });
    it("responds 200 with user info", () => {
      const user_id = testUser.id;
      return supertest(app).get(`/api/user/dashboard/${user_id}`).expect(200);
    });
  });
});
