const chats = require ('./routes/chats')
const likeBlockReport = require ('./routes/likeBlockReport')
const notConnected = require ('./routes/notConnected')
const profile = require ('./routes/profile')
const root = require ('./routes/root')
const notifs = require ('./routes/notifs')

const multer = require('multer')
const path = require('path')

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

    app.get('/notifs', isLoggedIn, (req, res) => {
        notifs.notifs(req, res)
    });

    // =====================================
    // SIGNIN ==============================
    // =====================================
    app.post('/signin', checkCredentials, passport.authenticate('local-signin', {
        successRedirect: '/', // redirect to the secure profile section
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
                console.log(err)
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
        profile.others(req, res)
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
    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

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