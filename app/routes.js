module.exports = (app, passport) => {

    app.get('/', (req, res) => {
        if (req.isAuthenticated()) res.render("Connected/index.ejs")
        else res.render("NotConnected/index.ejs")
    })
    
    app.get('/forgot_pwd', (req, res) => {
        res.render("NotConnected/forgot_pwd.ejs")
    })
    
    // =====================================
    // SIGNIN ==============================
    // =====================================
    app.post('/signin', checkCredentials, passport.authenticate('local-signin', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/', // redirect back to the signup page if there is an error
        failureFlash: true, // allow flash messages
    }), ({ body, session }, res) => {
        console.log('hello');

        if (body.remember) {
            session.cookie.maxAge = 1000 * 60 * 3;
        } else {
            session.cookie.expires = false;
        }
        res.redirect('/');
    });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/', // redirect to the secure profile section
		failureRedirect : '/', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, ({ user }, res) => {
        let login = user.login
        let User = require('./models/user')
        User.findByLogin(login, (infos_user) => {
            res.render('Connected/profile/profile.ejs', {infos_user, user})
        })
    });

    app.post('/modify_profile', isLoggedIn, (req, res) => {
        console.log(req.body)
        console.log(req.user.id + " --- " + req.user.login)

        let {login, prenom, nom, email, age, password, confirm, genre, orientation, bio, interests, localisation} = req.body

        let id = req.user.id
        let o = {}
        let valid = true

        let Check = require('./models/check')

        if (login && (valid = Check.login(login))) o.login = login
        if (prenom && (valid = Check.nom(prenom))) o.prenom = prenom
        if (nom && (valid = Check.nom(nom))) o.nom = nom
        if (email && (valid = Check.email(email))) o.email = email
        if (age && (valid = Check.age(age))) o.age = age
        if (password && (valid = Check.password(password, confirm))) o.password = password
        if (genre && (valid = Check.genre(genre))) o.genre = genre
        if (orientation && (valid = Check.orientation(orientation))) o.orientation = orientation
        if (bio && (valid = Check.bio(bio))) o.bio = bio
        if (interests && (valid = Check.interests(interests))) o.interests = interests
        if (localisation && (valid = Check.localisation(localisation))) o.localisation = localisation
        
       console.log("Valide? "+valid)

        if (login || prenom || nom || email || age || password || genre || orientation || bio || interests || localisation){
            let User = require('./models/user')
            User.update(id, o, () => {
                req.flashAdd('tabSuccess', 'Modifications faites avec succes');
                res.redirect('/profile')
            })
        } else res.redirect('/profile')
    });

    // =====================================
    // OTHERS PROFILES =====================
    // =====================================
    app.get('/profiles/:login', isLoggedIn, (req, res) => {
        let login = req.params.login
        res.render('Connected/profiles', {login: login})/*
        Message.find(id, function (messages) {
            res.render('messages/show', {messages: messages})
        })*/
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