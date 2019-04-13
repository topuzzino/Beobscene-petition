module.exports = {
    ifLoggedIn,
    ifLoggedOut,
    ifSigned,
    ifUnsigned
};

// middleware function
function ifLoggedIn(req, res, next) {
    if (req.session.user) {
        return res.redirect("/petition");
    }
    next();
}

function ifLoggedOut(req, res, next) {
    if (!req.session.user && req.url != "/register" && req.url != "/login") {
        return res.redirect("/register");
    }
    next();
}

// middleware function
function ifSigned(req, res, next) {
    if (!req.session.signatureId) {
        return res.redirect("/petition");
    }
    next();
}

function ifUnsigned(req, res, next) {
    if (req.session.signatureId) {
        return res.redirect("/thanks");
    }
    next();
}
