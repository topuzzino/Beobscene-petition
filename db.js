var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/tabasco-petition");

// add signers in the database
exports.addSigners = function addSigners(firstname, lastname, signature) {
    let q = `INSERT INTO signatures (firstname, lastname, signature) VALUES ($1, $2, $3) RETURNING *`; // q stands for SQL query, $1 - for user prompt
    let params = [firstname, lastname, signature];
    return db.query(q, params);
};

// extract signers from the database
exports.getSigners = function getSigners() {
    return db.query("SELECT firstName, lastName FROM signatures");
};

exports.addSignature = function addSignature(signature, userId) {
    let q =
        "INSERT INTO signatures (signature, userId) VALUES ($1, $2) RETURNING id";
    let params = [signature, userId];
    return db.query(q, params);
};

exports.getSignature = function getSignature(userId) {
    let q = "SELECT * FROM signatures WHERE id = $1";
    return db.query(q, [userId]);
};
