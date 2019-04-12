var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/tabasco-petition");

// REGISTER A NEW USER
exports.addUser = function addUser(firstname, lastname, email, password) {
    let q = `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING *`;
    let params = [firstname, lastname, email, password];
    return db.query(q, params);
};

// IN LOGIN FORM - find a user by email
exports.getUsers = function getUsers(email) {
    let q = "SELECT * FROM users WHERE email = $1";
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

//
exports.getProfileInfo = function getProfileInfo(userId) {
    let q = "SELECT * FROM user_profiles WHERE userId = $1";
    return db.query(q, [userId]);
};

exports.updateProfile = function updateProfile(
    age,
    city,
    url,
    obscene,
    userId
) {
    let q = `UPDATE user_profiles SET age = $1, city = $2, url = $3, obscene = $4 WHERE userId = $5 RETURNING id`;
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
    let q = "SELECT signature FROM signatures WHERE id = $1";
    return db.query(q, [userId]);
};

// ON THANKS page - filter signers by cities
exports.filterSignersByCity = function filterSignersByCity(city) {
    let q = `SELECT users.first, users.last,
    user_profiles.age, user_profiles.city, user_profiles.url, user_profiles.obscene,
     FROM user_profiles
     JOIN users
     ON user_profiles.userId = users.id
     WHERE user_profiles.city = $1`;
    return db.query(q);
};

exports.deleteSignature = function deleteSignature(id) {
    let q = `DELETE * FROM signatures WHERE id = $1`;
    return db.query(q, [id]);
};
