const chats = require ('./routes/chats')
const likeBlockReport = require ('./routes/likeBlockReport')
const notConnected = require ('./routes/notConnected')
const profile = require ('./routes/profile')
const root = require ('./routes/root')

module.exports = (app, passport) => {

    app.get('/', (req, res) => {
        root.root(req, res)
    })
    
    app.get('/forgot_pwd', (req, res) => {
        notConnected.forgot_pwd(req, res)
    })

    // =====================================
    // CHATS ===============================
    // =====================================
    app.get('/chats', isLoggedIn, (req, res) => {
        chats.chats(req, res)
    });

    // =====================================
    // SIGNIN ==============================
    // =====================================
    app.post('/signin', checkCredentials, passport.authenticate('local-signin', {
        successRedirect: '/chats', // redirect to the secure profile section
        failureRedirect: '/', // redirect back to the signup page if there is an error
        failureFlash: true, // allow flash messages
    }), ({ body, session }, res) => {
        notConnected.signin({ body, session }, res)
    });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/', // redirect to the secure profile section
		failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true, // allow flash messages
        session: false // prevent auto-login
	}));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, (req, res) => {
        profile.profile(req, res)
    });

    app.post('/modify_profile', isLoggedIn, (req, res) => {
        profile.modify_profile(req, res)
    });

    // =====================================
    // OTHERS PROFILES =====================
    // =====================================
    app.get('/bg/:login', isLoggedIn, (req, res) => {
        profile.others(req, res)
    })

    // =====================================
    // LIKE BLOCK REPORT ===================
    // =====================================
    app.post('/like', isLoggedIn, (req, res) => {
        likeBlockReport.like(req, res)
    })

    app.post('/block', isLoggedIn, (req, res) => {
        likeBlockReport.block(req, res)
    })

    app.post('/report', isLoggedIn, (req, res) => {
        likeBlockReport.report(req, res)
    })

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });
}

// route middleware to make sure
function isLoggedIn(req, res, next) {

    if (req.isAuthenticated()) return next();

    res.redirect('/');
}

function checkCredentials(req, res, next) {

    if (req.body.login && req.body.password) return next();

    req.flashAdd('tabError', 'Login/Password invalides');
    res.redirect('/');
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}