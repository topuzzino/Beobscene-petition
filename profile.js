const express = require("express");
const router = express.Router;

router.get("/profile", (req, res) => {
    res.sendStatus(200);
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
