CREATE TABLE rideboost_users (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    user_email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL
);