const connection = require('../config/db')
module.exports = (app, passport, async) => {

    app.get('/', (req, res) => {
        if (req.isAuthenticated()) {
            res.render("Connected/index.ejs")
        }
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
    app.get('/profile', isLoggedIn, (req, res) => {
        let login = req.user.login
        let user = req.user
        let infos_user = {}
        let tags, interests, likes, visits
        let User = require('./models/user')
        let count = 0
        let total = 5

        function displayProfile() {
            res.render('Connected/profile/profile.ejs', {infos_user, tags, interests, likes, visits, user})
        }

        User.findByLogin(login, (infos, err) => {
            if (err) throw err
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

        connection.query("SELECT * FROM users INNER JOIN visits ON visits.user_id = users.id WHERE visits.bg_id = ?", user.id, (err, rows) => {
            if (err) throw err;
            visits = rows
            count++
            if (count == total)
                displayProfile()
        });

        connection.query("SELECT * FROM users INNER JOIN likes ON likes.user_id = users.id WHERE likes.bg_id = ?", user.id, (err, rows) => {
            if (err) throw err;
            likes = rows
            count++
            if (count == total)
                displayProfile()
        });

        connection.query("SELECT interest FROM users_tags WHERE user_id = ?", user.id, (err, rows) => {
            if (err) throw err;
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

        if (total === 0) {
            req.flashAdd('tabError', 'Aucune modification enregistree.');
            res.redirect('/profile')
        }

        function modify () {
    //        console.log(JSON.stringify(o, null, 4));
            if (Object.keys(o).length !== 0){
                let User = require('./models/user')
                User.update(id, o, () => {
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
    app.get('/bg/:login', isLoggedIn, (req, res) => {
        let login = req.params.login
        let infos_user = {}
        let interests
        let liked, blocked, reported
        let User = require('./models/user')
        let user_id = req.user.id

        function displayBg() {
            res.render('Connected/bg', {infos_user, interests, liked, blocked, reported})
        }

        function likeBlockReport (bg_id) {
            connection.query("SELECT * FROM likes WHERE user_id = ? AND bg_id = ?", [user_id, bg_id], (err, rows) => {
                if (err) throw err;
                if (!rows.length) liked = false
                else liked = true
                connection.query("SELECT * FROM blocks WHERE user_id = ? AND bg_id = ?", [user_id, bg_id], (err, rows) => {
                    if (err) throw err;
                    if (!rows.length) blocked = false
                    else blocked = true
                    connection.query("SELECT * FROM reports WHERE user_id = ? AND bg_id = ?", [user_id, bg_id], (err, rows) => {
                        if (err) throw err;
                        if (!rows.length) reported = false
                        else reported = true
                        displayBg()
                    });
                });
            });
        }

        function addVisit (bg_id) {
            connection.query('INSERT INTO visits VALUES (?, ?)', [user_id, bg_id], (err) => {
                if (err) console.error(err);
                likeBlockReport(bg_id)
            });
        }

        function hasVisited(bg_id) {
            connection.query("SELECT * FROM visits WHERE user_id = ? AND bg_id = ?", [user_id, bg_id], (err, rows) => {
                if (err) throw err;
                if (!rows.length) addVisit(bg_id)
                else likeBlockReport(bg_id)
            });
        }

        User.findByLogin(login, (infos, err) => {
            if (err || !infos) {
                req.flashAdd('tabError', 'Aiee... Desole, ce BG n\'existe pas');
                res.redirect('/')
            } else {
                infos_user = infos
                connection.query("SELECT interest FROM users_tags WHERE user_id = ?", infos_user.id, (err, rows) => {
                    if (err) throw err;
                    let tab = []
                    rows.forEach(row => {
                        tab.push(row.interest)
                    });
                    interests = tab.join(', ')
                    hasVisited(infos_user.id)
                });
            }
        })

        
    })

    // =====================================
    // LIKE BLOCK REPORT ===================
    // =====================================
    app.post('/like', isLoggedIn, (req, res) => {
        let user_id = req.user.id
        let bg_id = req.body.bg_id
        console.log(user_id+" - "+bg_id)
        function match () {
            connection.query('INSERT INTO matchs VALUES (?, ?)', [user_id, bg_id], (err) => {
                if (err) console.error(err);
                connection.query('INSERT INTO matchs VALUES (?, ?)', [bg_id, user_id], (err) => {
                    if (err) console.error(err);
                    req.flashAdd('tabSuccess', 'Nouveau Match :) !');
                    res.redirect('back')
                });
            });
            
        }
        function unMatch () {
            connection.query('DELETE FROM matchs WHERE user_id = ? AND bg_id = ?', [user_id, bg_id], (err) => {
                if (err) console.error(err);
                connection.query('DELETE FROM matchs WHERE user_id = ? AND bg_id = ?', [bg_id, user_id], (err) => {
                    if (err) console.error(err);
                    req.flashAdd('tabSuccess', 'Unmatch :( !');
                    res.redirect('back')
                });
            });
        }
        function unlike () {
            connection.query('DELETE FROM likes WHERE user_id = ? AND bg_id = ?', [user_id, bg_id], (err) => {
                if (err) console.error(err);
                connection.query("SELECT * FROM likes WHERE user_id = ? AND bg_id = ?", [bg_id, user_id], (err, rows) => {
                    if (err) throw err;
                    if (rows.length) unMatch()
                    else {
                        req.flashAdd('tabSuccess', 'Unlike :( !');
                        res.redirect('back')
                    }
                });
            });
        }
        function like () {
            connection.query('INSERT INTO likes VALUES (?, ?)', [user_id, bg_id], (err) => {
                if (err) console.error(err);
                connection.query("SELECT * FROM likes WHERE user_id = ? AND bg_id = ?", [bg_id, user_id], (err, rows) => {
                    if (err) throw err;
                    if (rows.length) match()
                    else {
                        req.flashAdd('tabSuccess', 'Like :) !');
                        res.redirect('back')
                    }
                });
            });
        }
        connection.query("SELECT * FROM likes WHERE user_id = ? AND bg_id = ?", [user_id, bg_id], (err, rows) => {
            if (err) throw err;
            if (rows.length) unlike()
            else like()
        });
    })

    app.post('/block', isLoggedIn, (req, res) => {
        let user_id = req.user.id
        let bg_id = req.body.bg_id

        function unblock () {
            connection.query('DELETE FROM blocks WHERE user_id = ? AND bg_id = ?', [user_id, bg_id], (err) => {
                if (err) console.error(err);
                req.flashAdd('tabSuccess', 'Debloque !');
                res.redirect('back')
            });
        }
        function block () {
            connection.query('INSERT INTO blocks VALUES (?, ?)', [user_id, bg_id], (err) => {
                if (err) console.error(err);
                req.flashAdd('tabSuccess', 'Bloque !');
                res.redirect('back')
            });
        }
        connection.query("SELECT * FROM blocks WHERE user_id = ? AND bg_id = ?", [user_id, bg_id], (err, rows) => {
            if (err) throw err;
            if (rows.length) unblock()
            else block()
        });
    })

    app.post('/report', isLoggedIn, (req, res) => {
        let user_id = req.user.id
        let bg_id = req.body.bg_id

        function unreport () {
            connection.query('DELETE FROM reports WHERE user_id = ? AND bg_id = ?', [user_id, bg_id], (err) => {
                if (err) console.error(err);
                req.flashAdd('tabSuccess', 'Signalement supprime !');
                res.redirect('back')
            });
        }
        function report () {
            connection.query('INSERT INTO reports VALUES (?, ?)', [user_id, bg_id], (err) => {
                if (err) console.error(err);
                req.flashAdd('tabSuccess', 'Signale !');
                res.redirect('back')
            });
        }
        connection.query("SELECT * FROM reports WHERE user_id = ? AND bg_id = ?", [user_id, bg_id], (err, rows) => {
            if (err) throw err;
            if (rows.length) unreport()
            else report()
        });
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