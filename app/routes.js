const connection = require('../config/db')
module.exports = (app, passport, async) => {

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
        failureFlash : true, // allow flash messages
        session: false // prevent auto-login
	}));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, ({ user }, res) => {
        let login = user.login
        let infos_user = {}
        let tags, interests
        let User = require('./models/user')
        let count = 0
        let total = 3

        function displayProfile() {
            res.render('Connected/profile/profile.ejs', {infos_user, tags, interests, user})
        }

        User.findByLogin(login, (infos) => {
            infos_user = infos
            count++
            if (count == total)
                displayProfile()
        })

        connection.query("SELECT interest FROM tags", (err, rows) => {
            if (err) throw err;
            tags = rows
            count++
            if (count == total)
                displayProfile()
        });

        connection.query("SELECT interest FROM users_tags WHERE user_id = ?", user.id, (err, rows) => {
            if (err) throw err;
     //       console.log(JSON.stringify(rows, null, 4));
            let tab = []
            rows.forEach(row => {
                tab.push(row.interest)
            });
            interests = tab.join(', ')
            count++
            if (count == total)
                displayProfile()
        });
    });

    app.post('/modify_profile', isLoggedIn, (req, res) => {
 //       console.log(req.body)
   //     console.log(req.user.id + " --- " + req.user.login)
   
        const Check = require('./models/check')
        var params = {login, prenom, nom, email, age, password, confirm, genre, orientation, bio, interests, localisation, lat, lng} = req.body
        var count = 0
        var o = {}
        let id = req.user.id
        var valid = true
        var total = 0

        console.log(JSON.stringify(params, null, 4));

        for (let i in params) {
            if (params[i] && i !== 'confirm') total++
        }
  //      console.log(total)

        if (total === 0) {
            req.flashAdd('tabError', 'Aucune modification enregistree.');
            res.redirect('/profile')
        }

        function modify () {
    //        console.log(JSON.stringify(o, null, 4));
            if (Object.keys(o).length !== 0){
                let User = require('./models/user')
                User.update(id, o, () => {
 //                   console.log("Callback Update")
  //                  console.log(JSON.stringify(o, null, 4));
                    for (let i in o) {
                        if (o[i] && i !== 'confirm' && i !== 'lat' && i !== 'lng') req.flashAdd('tabSuccess', i+' -> '+o[i]);
                    }
                    res.redirect('/profile')
                })
            } else res.redirect('/profile')
        }

        function checkField (i) {
            if (i === "password") {
                Check[i](params[i], params["confirm"], req, (check) => {
                    let bcrypt = require('bcrypt-nodejs');
                    if (check === true) o[i] = bcrypt.hashSync(params[i], bcrypt.genSaltSync(9))
                    count++
                    if (count === total) {
                        modify()
                    }
                })
            } else if (i === "interests") {
                Check[i](params[i], req, (check) => {
                    if (check === true) o[i] = params[i]
                    count++
                    if (count === total) {
                        modify()
                    }
                })
            } else Check[i](params[i], req, (check) => {
                if (check === true) o[i] = params[i]
                count++
                if (count === total) {
                    modify()
                }
            })
        }

        for (let i in params) {
            if (params[i] && i !== 'confirm') {
            //    console.log(i+" - "+params[i])
                checkField(i)
            }
        }

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

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}