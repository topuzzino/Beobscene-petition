const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const db = require("./db");

// I hate handlebars --- BEGINN
var hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
// I hate handlebars --- END

// ---------------- UTILITIES ----------------
// if there is a request for css, go to the public folder
app.use(express.static(__dirname + "/public"));

app.use(
    require("body-parser").urlencoded({
        extended: false
    })
);

app.use(
    cookieSession({
        maxAge: 1000 * 60 * 60 * 24 * 14,
        secret: "I'm always angry"
    })
);

app.use(csurf()); // has to be after cookieSession and body-parser, adds a method retuns a token

// x-frame-options is a header that forbids a page from being displayed in a frame
app.use(function(req, res, next) {
    res.setHeader("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken(); // whar are .locals?
    next();
});

function hashPassword(plainTextPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
}

function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(
            textEnteredInLoginForm,
            hashedPasswordFromDatabase,
            function(err, doesMatch) {
                if (err) {
                    reject(err);
                } else {
                    resolve(doesMatch);
                }
            }
        );
    });
}

// ---------------- MAIN PAGE ----------------
app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main"
    });

    //req.session.userId = results.rows[0]
    //req.send(`<h1>Bla ${req.session.sigId}</h1>`)
});

// ---------------- REGISTER PAGE ----------------
app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main"
    });
});

// ---------------- LOGIN PAGE ----------------
app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main"
    });
});

// ---------------- THANKS PAGE ----------------
app.get("/thanks", (req, res) => {
    let userId = req.session.id;
    let firstname = req.session.firstname;

    db.getSignature(userId).then(data => {
        dataObj = {
            firstname,
            signature: data.rows[0].signature
        };
        res.render("thanks", {
            person: dataObj,
            layout: "main"
        });
    });

    //if (req.session.sigId) {
    // dont know what should be here
    //})
});

// ---------------- SIGNERS PAGE ----------------
app.get("/signers", (req, res) => {
    db.getSigners()
        .then(list => {
            res.render("signers", {
                layout: "main",
                signerslist: list.rows
            });
        })
        .catch(err => {
            console.log("Error in getSigners");
        });
});

// ---------------- PETITION FORM REQUEST ----------------

// any changes to a db (UPDATE, INSERT or DELETE)
// should be done in a POST route
app.post("/petition", (req, res) => {
    db.addSigners(req.body.firstname, req.body.lastname, req.body.signature)
        .then(results => {
            req.session.id = results.rows[0].id;
            req.session.firstname = results.rows[0].firstname;
            req.session.lastname = results.rows[0].lastname;
            res.redirect("/thanks");
        })
        .catch(err => {
            res.render("petition", {
                error: "Something went wrong. Please try again",
                layout: "main"
            });
            console.log("err in addSigners (post request): ", err);
        });

    // how do we query a database from an express server?
});

// ---------------- REGISTER FORM REQUEST ----------------
app.post("/register", (req, res) => {
    hashPassword(req.body.password).then(hash => {
        db.addUsers(req.body.firstname, req.body.lastname, req.body.email, hash)
            .then(id => {
                req.session.userId = id.rows[0].id;
                res.redirect("/petition");
            })
            .catch(err => {
                res.render("register", {
                    layout: "main",
                    error: "Error by registration",
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    email: req.body.email
                });
                console.log("Error in db.addUsers: ", err);
            });
    });
});

// ---------------- LOGIN FORM REQUEST ----------------
app.post("/login", (req, res) => {
    db.getUsers(req.body.email).then(data => {
        if (data.length == 1) {
            checkPassword(req.body.password, data.rows[0].password)
                .then(() => {
                    req.session.firstname = data.rows[0].firstname;
                    req.session.lastname = data.rows[0].lastname;
                    req.session.email = data.rows[0].email;
                    req.session.userId = data.rows[0].id;
                    res.redirect("/petition");
                })
                .catch(() => {
                    res.render("login", {
                        layout: "main",
                        error: "Your email or password is wrong. Try again",
                        email: req.body.email
                    });
                });
        } else {
            res.render("login", {
                layout: "main",
                error: "Your email or password is wrong. Try again",
                email: req.body.email
            });
        }
    });
});

app.listen(8080, () => console.log("PETITION ..."));
