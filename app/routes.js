const chats = require ('./routes/chats')
const likeBlockReport = require ('./routes/likeBlockReport')
const notConnected = require ('./routes/notConnected')
const profile = require ('./routes/profile')
const root = require ('./routes/root')
const notifs = require ('./routes/notifs')
const sortFilter = require ('./routes/sortFilter')
const forgot_pwd = require('./routes/forgot_pwd')
const confirm = require('./routes/confirm')
const fetch = require('./routes/fetch')
const multer = require('multer')
const path = require('path')
const connection = require('./../config/db')

module.exports = (app, passport) => {

    app.get('/', (req, res) => {
        if (req.isAuthenticated()) {
            let user = req.user
            if (user.ready == 0) {
                req.flashAdd('tabSuccess', 'Complete ton profil avant de pouvoir aller matcher.')
                res.redirect('/profile')
            } else root.root(req, res)
        } else res.render("NotConnected/index.ejs")
    })

    app.get('/auth/42', passport.authenticate('42'));
    
    app.get('/auth/42/callback', passport.authenticate('42', { failureRedirect: '/' }), (req, res) => {
        res.redirect('/profile'); // Successful authentication, redirect home.
    });

    app.get('/confirm/:login/:token', (req, res) => {
        confirm(req, res)
    })
    
    app.get('/forgot_pwd', (req, res) => {
        notConnected.forgot_pwd(req, res)
    })

    app.post('/forgot_pwd', (req, res) => {
        forgot_pwd(req, res)
    })

    app.post('/filter', isLoggedIn, (req, res) => {
        sortFilter.filter(req, res)
    })

    // =====================================
    // CHATS ===============================
    // =====================================
    app.get('/chats', isLoggedIn, (req, res) => {
        chats.chats(req, res)
    });

    app.get('/notifs', isLoggedIn, (req, res) => {
        notifs.notifs(req, res)
    });

    // =====================================
    // SIGNIN ==============================
    // =====================================
    app.post('/signin', checkCredentials, passport.authenticate('local-signin', {
        successRedirect: '/profile', // redirect to the secure profile section
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

    // Set The Storage Engine
    const storage = multer.diskStorage({
        destination: './public/pics/',
        filename: (req, file, cb) => {
            cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    });
    
    // Init Upload
    const upload = multer({
        storage: storage,
        limits:{fileSize: 1000000},
        fileFilter: (req, file, cb) => {
            checkFileType(file, cb);
        }
    }).fields([{name: 'pp'}, {name: 'p2'}, {name: 'p3'}]);

    app.post('/modify_profile', isLoggedIn, (req, res) => {
        upload(req, res, (err) => {
            if(err){
                // console.log(err)
                req.flashAdd('tabError', 'Le fichier que vous essayez d\'envoyer n\'est pas adapte');
                res.redirect('back')
            } else {
                profile.modify_pics(req, res, profile.modify_profile)
            }
        });
    });

    // =====================================
    // OTHERS PROFILES =====================
    // =====================================
    app.get('/bg/:login', isLoggedIn, (req, res) => {
        let user = req.user
        if (req.params.login == user.login) {
            return res.redirect('/profile')
        }
        if (user.ready == 0) {
            req.flashAdd('tabSuccess', 'Complete ton profil avant de pouvoir aller matcher.')
            res.redirect('/profile')
        } else profile.others(req, res)
    })

    // =====================================
    // LIKE BLOCK REPORT ===================
    // =====================================

    app.post('/block', isLoggedIn, (req, res) => {
        likeBlockReport.block(req, res)
    })

    app.post('/report', isLoggedIn, (req, res) => {
        likeBlockReport.report(req, res)
    })

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', isLoggedIn, (req, res) => {
        // console.log("Logout: "+req.user.login)
        let last_visit = req.user.last_visit
        let id = req.user.id
        let hello = new Date();
        // console.log(hello)
        // console.log(last_visit)
        let popbonus = Math.round((hello - last_visit) / 300000)
        // console.log(popbonus)
        
        function logout (){
            connection.query("UPDATE users SET online = 0, last_visit = ? WHERE login = ?", [hello, req.user.login], (err, rows2) => {
                if (err) throw err
                req.logout();
                res.redirect('/');
            })
        }
        if (popbonus > 0) {
            connection.query("SELECT pop FROM users WHERE id = ?", [id], (err, rows) => {
                if (err) throw err;
                if (rows.length) {
                    connection.query("UPDATE users SET pop = ? WHERE id = ?",[rows[0].pop + popbonus, id], (err) => {
                        if (err) throw err
                        else logout()
                    })
                }
            });
        } else logout()

    });

    app.get('/fetch/root/:page', isLoggedIn, (req, res) => {
        if (isNaN(req.params.page)) res.redirect('back')
        else fetch.root(req, res)
    })

    app.get('*', (req, res) => {
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

// Check File Type
function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
        return cb(null,true);
    } else {
        cb('Error: Images Only!');
    }
  }