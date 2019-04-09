DROP TABLE IF EXISTS user_profiles;

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    age INTEGER,
    city VARCHAR(255),
    url VARCHAR(600),
    obscene VARCHAR(600),
    userId INTEGER REFERENCES users(id) NOT NULL UNIQUE
);
