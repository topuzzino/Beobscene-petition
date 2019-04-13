const express = require("express");
const router = express.Router();
const db = require("./utils/db");
const { hashPassword, checkPassword } = require("./utils/bcrypt");
const {
    ifLoggedIn,
    ifLoggedOut,
    ifSigned,
    ifUnsigned
} = require("./middleware");

const { app } = require("./index");

app.get("/register", ifLoggedOut, (req, res) => {
    res.sendStatus(200);
});

app.post("/register", requireLoggedOutUser, (req, res) => {
    res.sendStatus(200);
});

app.get("/login", requireLoggedOutUser, (req, res) => {
    res.sendStatus(200);
});

app.post("/login", requireLoggedOutUser, (req, res) => {
    res.sendStatus(200);
});

module.exports = router;
