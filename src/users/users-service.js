const UsersService = {
  getUsersZipCodeById(db, user_id) {
    return db
      .from("rideboost_users AS rb_users")
      .select("rb_users.id", "rb_users.zip_code", "rb_users.icao")
      .where("rb_users.id", user_id);
  }
};

module.exports = UsersService;
