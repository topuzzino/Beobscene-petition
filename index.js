// ---------------- REQUIRES ----------------
const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const db = require("./utils/db");
const { hashPassword, checkPassword } = require("./utils/bcrypt");

const {
    ifLoggedIn,
    ifLoggedOut,
    ifSigned,
    ifUnsigned
} = require("./routes/middleware");
//const redis = require("./utils/redis");

// I hate handlebars --- BEGINN
var hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
// I hate handlebars --- END

// ---------------- UTILITIES ----------------
app.use(express.static(__dirname + "/public")); // if there is a request for css, go to the public folder

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

app.use(ifLoggedOut);

/*
app.use(function(req, res, next) {
    if (!req.session.user.id && req.url != "/register" && req.url != "/login") {
        return res.redirect("/register");
    }
    next();
});
*/

// ---------------- MAIN PAGE ----------------
app.get("/petition", ifUnsigned, (req, res) => {
    console.log("req.session: ", req.session);
    db.getSigner(req.session.user.id).then(data => {
        if (data.rows[0].length > 0) {
            req.session.signatureId = data.rows[0].id;
            res.redirect("/thanks");
        } else {
            res.render("signatureform", {
                layout: "main"
            });
        }
    });
});

app.get("/", (req, res) => {
    res.redirect("/register");
});

// ---------------- REGISTER PAGE ----------------
app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main"
    });
});

// ---------------- PROFILE PAGE ----------------
app.get("/profile", (req, res) => {
    console.log("req.session in /profile: ", req.session);
    console.log("req.body: ", req.body);
    db.getProfileInfo(req.session.user.id).then(data => {
        res.render("profile", {
            layout: "main"
            //signerslist: data.rows[0]
        });
    });
});

// ---------------- LOGIN PAGE ----------------
app.get("/login", ifLoggedIn, (req, res) => {
    res.render("login", {
        layout: "main"
    });
});

// UPDATE PROFILE PAGE
app.get("/edit", (req, res) => {
    db.getProfileInfo(req.session.user.id).then(data => {
        console.log("data in edit page:", data);
        res.render("edit", {
            layout: "main",
            signerslist: data.rows
        });
    });
});

// ---------------- THANKS PAGE ----------------
app.get("/thanks", ifSigned, (req, res) => {
    db.getSignature(req.session.user.id).then(data => {
        dataObj = {
            firstname: req.session.firstname,
            lastname: req.session.firstname,
            signature: data.rows[0].signature
        };
        res.render("thanks", {
            person: dataObj,
            layout: "main"
        });
    });
});

// ---------------- SIGNERS PAGE ----------------
app.get("/signers", ifSigned, (req, res) => {
    db.getSigners()
        .then(list => {
            //console.log("list: ", list);
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
app.get("/signers/cities/:city", ifSigned, (req, res) => {
    db.filterSignersByCity(req.body.city)
        .then(results => {
            console.log("results in signers: ", results);
            res.render("signers", {
                layout: "main",
                signerslist: results.rows
            });
        })
        .catch(err => {
            console.log("Error in filterSignersByCity: ", err);
        });
});

// ---------------- PETITION FORM REQUEST ----------------

app.post("/petition", ifUnsigned, (req, res) => {
    if (req.body.signatureId != "") {
        //console.log("req.session: ", req.session);
        db.addSignature(req.body.signature, req.session.user.id)
            .then(results => {
                //console.log("results: ", results);
                // cookie
                req.session.signatureId = results.rows[0].id;
                res.redirect("/thanks");
            })
            .catch(err => {
                res.render("signatureform", {
                    error: "Something went wrong. Please try again",
                    layout: "main"
                });
                console.log("err in addSignature (post request): ", err);
            });
    } else {
        res.render("signatureform", {
            layout: "main",
            error:
                "You haven't signed. Without your signature this petition would be a totally bullshit. You better sign!"
        });
    }
});

// ---------------- REGISTER FORM REQUEST ----------------
// here have to add some conditions (, or if not all fields are filled in)
app.post("/register", ifLoggedIn, (req, res) => {
    // if an email already exists, don't register
    db.getUsers(req.body.email).then(data => {
        //console.log("data is: ", data); // если нет юзера в датабазе, то data.rows - пустой массив
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
                        // should we add to cookies all the info of the user???
                        req.session.user = {
                            id: results.rows[0].id,
                            firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            email: req.body.email,
                            password: hash
                        };
                        console.log("req.session.user: ", req.session.user);
                        res.redirect("/profile"); // or may be here shoud be a redirection to a login?
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

// ---------------- PROFILE FORM REQUEST ----------------
app.post("/profile", (req, res) => {
    console.log("req.body in profile: ", req.body);
    console.log("req.session.user.id: ", req.session.user.id);
    if (
        !req.body.url.startsWith("http://") ||
        !req.body.url.startsWith("https://") ||
        !req.body.url.startsWith("//")
    ) {
        req.body.url = "http://" + req.body.url;
    }
    db.addProfileInfo(
        req.body.age,
        req.body.city,
        req.body.url,
        req.body.obscene,
        req.session.user.id
    );
    res.redirect("/petition");
});

// ---------------- LOGIN FORM REQUEST ----------------
app.post("/login", ifLoggedIn, (req, res) => {
    db.getUsers(req.body.email).then(data => {
        if (data.length != 0) {
            checkPassword(req.body.password, data.rows[0].password)
                .then(matches => {
                    if (matches) {
                        req.session.user = {
                            id: data.rows[0].id,
                            firstname: data.rows[0].first,
                            lastname: data.rows[0].last,
                            email: data.rows[0].email
                        };
                        req.session.signatureId = data.rows[0].signatureId;

                        console.log("req.session: ", req.session);
                        res.redirect("/petition");
                    } else {
                        res.render("login", {
                            layout: "main",
                            error: "Your email or password is wrong. Try again"
                        });
                    }
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

// ---------------- LOGOUT FORM REQUEST ----------------
app.get("/unsign", (req, res) => {
    req.session = null;
    /* should be rewrite for Redis
    req.session.destroy(function() {
        res.redirect('/login')
    })
    */
    res.render("unsign", {
        layout: "main"
    });
});

// UPDATE PROFILE REQUEST
app.post("/edit", (req, res) => {
    db.updateProfile(
        req.body.first,
        req.body.last,
        req.body.email,
        req.session.user.id
    ).then(
        db
            .mergeProfileData(
                req.body.age,
                req.body.city,
                req.body.url,
                req.body.obscene,
                req.session.user.id
            )
            .then(user => {})
    );
});

app.listen(8080, () => console.log("PETITION"));

/* Port for Heroku
app.listen(process.env.PORT || 8080, function() {
    console.log("I'm listening");
}
*/

/* ---------------- REDIS DEMO ----------------
redis.setex("country", 10, "germany").then(() => {
    redis.get("country").then(data => {
        console.log("data from redis GET: ", data);
    });
});
// ARRAY or OBJECT
redis.setex("country", 10, JSON.stringify(["germany", "usa"])).then(() => {
    redis.get("country").then(data => {
        console.log("data from redis GET: ", JSON.parse(data));
    });
});
*/
/*
app.get("/something", (req, res) => {
    redis.get("something").then(data => {
        if (!data) {
            // db query to get the data
            db.someQuery().then(results => {
                redis.setex("something", 230, JSON.stringify(results.rows));
            });
        } else {
            res.render("someTemplate", {
                dataFromRedis: data
            });
        }
    });
});
*/
