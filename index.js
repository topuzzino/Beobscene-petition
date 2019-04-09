// ---------------- REQUIRES ----------------
const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const db = require("./db");
var bcrypt = require("bcryptjs");

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
    //req.send(`<h1>Bla ${req.session.signatureId}</h1>`)
});

app.get("/", (req, res) => {
    console.log("req.session: ", req.session);
    res.redirect("/petition"); // need to change that - should redirect either to login or to register page
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
    let lastname = req.session.lastname;

    db.getSignature(userId).then(data => {
        dataObj = {
            firstname,
            lastname,
            signature: data.rows[0].signature
        };
        res.render("thanks", {
            person: dataObj,
            layout: "main"
        });
    });
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
            console.log("Error in getSigners: ", err);
        });
});

// ---------------- SIGNERS PAGE FILTERED by city ----------------
app.get("/signers/:city", (req, res) => {
    console.log("req.params", req.params);
    // will be added later
});

// ---------------- PETITION FORM REQUEST ----------------

app.post("/petition", (req, res) => {
    db.addSignature(req.body.signature, req.session.userId)
        .then(results => {
            console.log("results: ", results);
            // cookie
            req.session.id = results.rows[0].id;
            res.redirect("/thanks");
        })
        .catch(err => {
            res.render("petition", {
                error: "Something went wrong. Please try again",
                layout: "main"
            });
            console.log("err in addSignature (post request): ", err);
        });
});

// ---------------- REGISTER FORM REQUEST ----------------
// here have to add some conditions (, or if not all fields are filled in)
app.post("/register", (req, res) => {
    // if an email already exists, don't register
    db.getUsers(req.body.email).then(data => {
        console.log("data is: ", data); // если нет юзера в датабазе, то data.rows - пустой массив
        if (data.rows.length != 0) {
            res.render("register", {
                layout: "main",
                error: "Email is already registered"
            });
        } else {
            // if email doesn't exist in the database, register
            hashPassword(req.body.password).then(hash => {
                db.addUser(
                    req.body.firstname,
                    req.body.lastname,
                    req.body.email,
                    hash
                )
                    .then(results => {
                        console.log("results: ", results);
                        // should we add to cookies all the info of the user???
                        req.session.user = {
                            id: results.rows[0].id,
                            firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            email: req.body.email,
                            password: hash
                        };
                        console.log("req.session.user: ", req.session.user);
                        res.redirect("/petition"); // or may be here shoud be a redirection to a login?
                    })
                    .catch(err => {
                        res.render("register", {
                            layout: "main",
                            error: "Error by registration",
                            firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            email: req.body.email
                        });
                        console.log("Error in db.addUser: ", err);
                    });
            });
        }
    });
});

// ---------------- LOGIN FORM REQUEST ----------------
app.post("/login", (req, res) => {
    console.log("req.session", req.session);
    db.getUsers(req.body.email).then(data => {
        if (data.length != 0) {
            checkPassword(req.body.password, data.rows[0].password)
                .then(() => {
                    req.session.userId = data.rows[0].id;
                    req.session.email = data.rows[0].email;
                    res.redirect("/petition");
                })
                .catch(() => {
                    res.render("login", {
                        layout: "main",
                        error: "Your email or password is wrong. Try again"
                    });
                });
        } else {
            res.render("login", {
                layout: "main",
                error: "You email hasn't been registered yet. Please register",
                email: req.body.email
            });
        }
    });
});

app.listen(8080, () => console.log("PETITION ..."));
