const LocalStrategy = require('passport-local').Strategy;
const FortyTwoStrategy = require('passport-42').Strategy;
const nodemailer = require('nodemailer')

const FORTYTWO_APP_ID = ''
const FORTYTWO_APP_SECRET = ''

// load up the user model
const bcrypt = require('bcrypt-nodejs');
const connection = require('./db')

module.exports = (passport) => {

    passport.serializeUser((user, done) => {
        done(null,user.id)
    })

    passport.deserializeUser((id, done) => {
        connection.query("SELECT * FROM users WHERE id = ? ",[id], (err, rows) => {
            done(err, rows[0]);
        });
    })

    // =========================================================================
    // 42 STRATEGY =============================================================
    // =========================================================================

    passport.use(new FortyTwoStrategy({
        clientID: FORTYTWO_APP_ID,
        clientSecret: FORTYTWO_APP_SECRET,
        callbackURL: "http://localhost:6969/auth/42/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        // console.log(profile)
        let {id, login, first_name, last_name, image_url, email} = profile._json
        // console.log(id + '\n' + login + '\n' + first_name + '\n' + last_name + '\n' + image_url + '\n' + email)
        connection.query("SELECT * FROM users WHERE fortytwoId = ?",[id], (err, rows) => {
            if (err) return done(err);
            if (rows.length > 0) {
                // console.log('already signin')
                let hello = new Date();
                connection.query("UPDATE users SET online = 1, last_visit = ? WHERE fortytwoId = ?", [hello, id], (err, rows2) => {
                    if (err) throw err;
                    // all is well, return successful user
                    return done(null, rows[0]);
                })
            }
            else {
                let newpwd = generatePassword()
                var newUser = {
                    fortytwoId: id,
                    login: login + id,
                    prenom: capitalizeFirstLetter(first_name),
                    nom: capitalizeFirstLetter(last_name),
                    creation: new Date(),
                    last_visit: new Date(),
                    pp: image_url,
                    email: email,
                    password: bcrypt.hashSync(newpwd, bcrypt.genSaltSync(9)),
                    token: bcrypt.hashSync('matcha'+login, bcrypt.genSaltSync(9)).replace(/\//g, '')
                };
                // console.log(newUser)
                var insertQuery = "INSERT INTO users ( online, fortytwoId, active, login, pp, prenom, nom, email, password, creation, last_visit, token ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                connection.query(insertQuery,[1, newUser.fortytwoId, 1, newUser.login, newUser.pp, newUser.prenom, newUser.nom, newUser.email, newUser.password, newUser.creation, newUser.last_visit, newUser.token], (err, rows3) => {
                    if (err) throw err
                    let user = {id: rows3.insertId}
                    return done(null, user);
                });
            }
        });
      }
    ));
    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'login',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, login, password, done) => {
        let end = () => {
            return done(null, null, req.flashAdd('tabSuccess', 'Bravo, finalisez votre compte en cliquant sur le lien que vous venez de recevoir par email!'));
        }
        connection.query("SELECT * FROM users WHERE login = ? OR email = ?",[login, req.body.email], (err, rows) => {
            if (err) return done(err);
            if (!isSignUpValid(req, login, password, rows)) return done(null, false);
            else {
                var newUser = {
                    login: login,
                    password: bcrypt.hashSync(password, bcrypt.genSaltSync(9)),
                    prenom: capitalizeFirstLetter(req.body.prenom),
                    nom: capitalizeFirstLetter(req.body.nom),
                    email: req.body.email,
                    creation: new Date(),
                    last_visit: new Date(),
                    token: bcrypt.hashSync('matcha'+login, bcrypt.genSaltSync(9)).replace(/\//g, '')
                };
                // console.log(newUser)
                var insertQuery = "INSERT INTO users ( login, prenom, nom, email, password, creation, last_visit, token ) values (?, ?, ?, ?, ?, ?, ?, ?)";

                connection.query(insertQuery,[newUser.login, newUser.prenom, newUser.nom, newUser.email, newUser.password, newUser.creation, newUser.last_visit, newUser.token], (err) => {
                    if (err) throw err
                    else {
                        let link = 'http://localhost:6969/confirm/'+newUser.login+'/'+newUser.token
                        let msgtext = "Validez votre compte en vous rendant a cette adresse : "+link
                        let msghtml = "<p>Validez votre compte en "+"<a href="+link+">cliquant ici</a></p>"
                        go("Matcha", msgtext, msghtml, newUser.email)
                    }
                });
            }
        });

        let go = (subj, msgtext, msghtml, towho) => {
            nodemailer.createTestAccount((err, account) => {
                if (err) {
                    // console.error('Failed to create a testing account. ' + err.message);
                    return process.exit(1);
                }
            
                // console.log('Credentials obtained, sending message...');
            
                // create reusable transporter object using the default SMTP transport
                let transporter = nodemailer.createTransport({
                    port: 1050,
                    ignoreTLS : true
                });
            
                // setup email data with unicode symbols
                let mailOptions = {
                    from: '"Victor Foo 👻" <foo@example.com>', // sender address
                    to: towho, // list of receivers
                    subject: subj, // Subject line
                    text: msgtext, // plain text body
                    html: msghtml // html body
                };
            
                // send mail with defined transport object
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                    // console.log('Error occurred. ' + err.message);
                    return process.exit(1);
                    }
                    // console.log('Message sent: %s', info.messageId);
                    // Preview only available when sending through an Ethereal account
                    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                    end()
                    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                });
            });
        }
    }))

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================

    passport.use(
        'local-signin',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'login',
            passwordField: 'password',
            passReqToCallback: true, // allows us to pass back the entire request to the callback
        }, (req, login, password, done) => { // callback with email and password from our form
            connection.query('SELECT * FROM users WHERE login = ?', [login], (err, rows) => {
                if (err) return done(err);
                if (!rows.length) {
                    return done(null, false, req.flashAdd('tabError', 'Cet utilisateur n\'existe pas.'));
                }
                if (rows[0].active == 0)  return done(null, false, req.flashAdd('tabError', 'L\'email de ce compte n\'a pas encore ete confirme'));
                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password)) return done(null, false, req.flashAdd('tabError', 'Oops! Mauvais mot de passe.'));

                let hello = new Date();
                
                connection.query("UPDATE users SET online = 1, last_visit = ? WHERE login = ?", [hello, login], (err, rows2) => {
                    if (err) return console.log(err);
                    // all is well, return successful user
                    return done(null, rows[0]);
                })
            });
            
        })
    );
}

function isSignUpValid (req, login, password, rows) {
    const pwdRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,20})");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nomRegex = new RegExp("^[a-zA-Z_]{3,16}$");
    const loginRegex = new RegExp("^[a-zA-Z0-9_]{3,16}$");
    let result = true;

    if (rows.length) {
        req.flashAdd('tabError', 'Ce pseudo/email est deja pris')
        result = false
    }
    if (!loginRegex.test(login)) {
        req.flashAdd('tabError', 'Pseudo: format incorrect')
        result = false
    }
    if (!nomRegex.test(req.body.prenom)) {
        req.flashAdd('tabError', 'Prenom: format incorrect')
        result = false
    }
    if (!nomRegex.test(req.body.nom)) {
        req.flashAdd('tabError', 'Nom: format incorrect')
        result = false
    }
    if (password !== req.body.confirm) {
        req.flashAdd('tabError', 'Les mots de passe ne correspondent pas.');
        result = false
    }
    if (!pwdRegex.test(password)) {
        req.flashAdd('tabError', 'Mot de passe en carton. ([a-z]+[A-Z]+[0-9])*(6-20)');
        result = false
    }
    if (!emailRegex.test(req.body.email)) {
        req.flashAdd('tabError', 'Syntaxe de l\'email invalide');
        result = false
    }
    if (!isLengthOkay('Pseudo', login, req) || !isLengthOkay('Prenom', req.body.prenom, req) || !isLengthOkay('Nom', req.body.nom, req))
        result = false
    return result
}

function isLengthOkay(champs, value, req) {
    let result = true
    // console.log(champs+" : "+value.length)
    if (value.length < 3) {
        req.flashAdd('tabError', champs+': trop court');
        result = false
    }
    else if (value.length > 16) {
        req.flashAdd('tabError', champs+': trop long');
        result = false
    }
    return result
}

function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1).toLowerCase();
}

function generatePassword() {
    var length = 12,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }