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
    homepage,
    obscene,
    userId
) {
    let q = `INSERT INTO user_profiles (age, city, homepage, obscene, userId) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    let params = [age, city, homepage, obscene, userId];
    return db.query(q, params);
};

//
exports.getProfileInfo = function getProfileInfo(userId) {
    let q = "SELECT * FROM user_profiles WHERE userId = $1";
    return db.query(q, [userId]);
};

// add signers in the database
//exports.addSigners = function addSigners(firstname, lastname, signature) {
//    let q = `INSERT INTO signatures (firstname, lastname, signature) VALUES ($1, $2, $3) RETURNING *`; // q stands for SQL query, $1 - for user prompt
//    let params = [firstname, lastname, signature];
//    return db.query(q, params);
//};

// ON THANKS PAGE - show the list of signed users
exports.getSigners = function getSigner(userId) {
    let q = "SELECT * FROM signatures WHERE userId = $1";
    return db.query(q, [userId]);
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
