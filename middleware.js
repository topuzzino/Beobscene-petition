// middleware function
function requireLoggedInUser(req, res, next) {
    if (!req.session.userId && req.url != "/register" && req.url != "/login") {
        return res.redirect("/register");
    }
    next();
}

function requireLoggedOutUser(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/register");
    }
    next();
}

// middleware function
function requireSignature(req, res, next) {
    if (!req.session.sigId) {
        return res.redirect("/register");
    }
    next();
}
// middleware function
function requireNoSignature(req, res, next) {
    if (req.session.sigId) {
        return res.redirect("/register");
    }
    next();
}

module.exports = {
    //the names of the functions
    requireLoggedInUser,
    requireLoggedOutUser,
    requireSignature,
    requireNoSignature
};
