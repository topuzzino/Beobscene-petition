const express = require("express");
const router = express.Router();
const db = require("./utils/db");
const bc = require("./utils/bcrypt");
const {} = require("./middleware");

router.get("/profile", ifLoggedOut, (req, res) => {
    res.render("profile", {
        layout: "main"
    });
});

router.post("/profile", (req, res) => {
    res.sendStatus(200);
});

module.exports = router;

/* in index.js
app.use(require("./profile"));

or
app.use('/profile', require("./profile"));
тогда здесь не нужно будет после слеша писать profile,
оно автоматически с него начинается в этой ветке
*/
