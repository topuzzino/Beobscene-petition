var spicedPg = require("spiced-pg");
//var db = spicedPg("postgres:postgres:postgres@localhost:5432/tabasco-petition");

var dbUrl =
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/tabasco-petition";
var db = spicedPg(dbUrl);

// REGISTER A NEW USER
exports.addUser = function addUser(firstname, lastname, email, password) {
    let q = `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING *`;
    let params = [firstname, lastname, email, password];
    return db.query(q, params);
};

// IN LOGIN FORM - find a user by email
exports.getUsers = function getUsers(email) {
    let q =
        'SELECT users.*, signatures.id AS "signatureId" FROM users LEFT JOIN signatures ON users.id = signatures.userid WHERE email = $1';
    return db.query(q, [email]);
};

// IN PROFILE FORM - add user info
exports.addProfileInfo = function addProfileInfo(
    age,
    city,
    url,
    obscene,
    userId
) {
    let q = `INSERT INTO user_profiles (age, city, url, obscene, userId) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    let params = [age, city, url, obscene, userId];
    return db.query(q, params);
};

exports.removeProfile = function removeProfile(userId) {
    let q = `DELETE FROM users WHERE id = $1`;
    return db.query(q, [userId]);
};

//
exports.getProfileInfo = function getProfileInfo(userId) {
    let q = `SELECT * FROM user_profiles
    LEFT JOIN users
    ON user_profiles.userid = users.id
    WHERE userid = $1`;
    return db.query(q, [userId]);
};

exports.updateProfile = function updateProfile(first, last, email, userId) {
    let q = `UPDATE users SET first = $1, last = $2, email = $3 WHERE id = $4`;
    let params = [first, last, email, userId];
    return db.query(q, params);
};

// UPSERT PROFILE FORM
exports.mergeProfileData = function mergeProfileData(
    age,
    city,
    url,
    obscene,
    userId
) {
    let q = `INSERT INTO user_profiles (age, city, url, obscene, userId)
    VALUES ($1, $2, $3, $4, $5) ON CONFLICT (userId)
    DO UPDATE SET age = $1, city = $2, url=$3, obscene=$4, userId=$5`;
    let params = [age, city, url, obscene, userId];
    return db.query(q, params);
};

// ON THANKS PAGE - show the list of signed users
exports.getSigners = function getSigners() {
    let q = `SELECT users.first, users.last,
        user_profiles.age, user_profiles.city, user_profiles.url, user_profiles.obscene,
        signatures.userId
        FROM signatures
        LEFT JOIN users
        ON signatures.userId = users.id LEFT JOIN user_profiles ON user_profiles.userId = users.id`;
    return db.query(q);
};

// ADD SIGNATURE ON PETITION PAGE
exports.addSignature = function addSignature(signature, userId) {
    let q = `INSERT INTO signatures (signature, userId) VALUES ($1, $2) RETURNING id`;
    let params = [signature, userId];
    return db.query(q, params);
};

// GET SIGNATURE FOR THANKS PAGE
exports.getSignature = function getSignature(userId) {
    let q = "SELECT signature FROM signatures WHERE userid = $1";
    return db.query(q, [userId]);
};

// GET SIGNATURE FOR THANKS PAGE
exports.getSigner = function getSigner(userId) {
    let q = "SELECT * FROM signatures WHERE userid = $1";
    return db.query(q, [userId]);
};

// ON THANKS page - filter signers by cities
exports.filterSignersByCity = function filterSignersByCity(city) {
    let q = `SELECT users.first, users.last,
    user_profiles.age, user_profiles.city, user_profiles.url, user_profiles.obscene,
    signatures.userId
     FROM user_profiles
     JOIN users
     ON user_profiles.userId = users.id
     JOIN signatures ON signatures.userId = user_profiles.userId
     WHERE LOWER(user_profiles.city) = LOWER($1)`;
    return db.query(q, [city]);
};

exports.deleteSignature = function deleteSignature(id) {
    let q = `DELETE FROM signatures WHERE id = $1`;
    return db.query(q, [id]);
};
