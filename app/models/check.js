const pwdRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,20})");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nomRegex = new RegExp("^[a-zA-Z_]{3,16}$");
const loginRegex = new RegExp("^[a-zA-Z0-9_]{3,16}$");

var Check = {

    // - Pas deja pris
    // - Taille raisonnable
    // - Format correct
    login: login = (login, req, cb) => {
        let rep = true
        if (!loginRegex.test(login)) {
            req.flashAdd('tabError', 'Pseudo: format incorrect')
            rep = false
        }
        let User = require('./user')
        User.findByLogin(login, (row) => {
            if (row) {
                req.flashAdd('tabError', 'Ce pseudo n\'est pas disponible')
                rep = false
            }
            cb(rep)
        })
    },

    // - Pas d'espace
    // - Uniquement des lettres
    // - Taille correcte
    prenom: prenom = (nom, req, cb) => {
        let rep = true
        if (!nomRegex.test(nom)) {
            req.flashAdd('tabError', 'Prenom: format incorrect')
            rep = false
        }
        cb(rep)
    },
    nom: nom = (nom, req, cb) => {
        let rep = true
        if (!nomRegex.test(nom)) {
            req.flashAdd('tabError', 'Nom: format incorrect')
            rep = false
        }
        cb(rep)
    },
    // - Pas deja pris
    // - Format correct
    email: email = (email, req, cb) => {
        let rep = true
        let User = require('./user')
        User.findByEmail(email, (rows) => {
            if (rows.length) {
                req.flashAdd('tabError', 'Cet email n\'est pas disponible')
                rep = false
            } else if (!emailRegex.test(email)) {
                req.flashAdd('tabError', 'Syntaxe de l\'email invalide');
                rep = false
            }
            cb(rep)
        })
    },

    // - Bien un nombre
    // - Compris entre 16 et 30
    age: age = (age, req, cb) => {
        let rep = true
        if (isNaN(age)) {
            req.flashAdd('tabError', 'Tu es cense mettre un nombre pour ton age...');
            rep = false
        } else if (age < 16 || age > 30) {
            req.flashAdd('tabError', 'Ton age doit etre compris entre 16 et 30');
            rep = false
        }
        cb(rep)
    },

    // - Password === confirmation
    // - Format correct
    password: password = (password, confirm, req, cb) => {
        let rep = true
        if (!confirm || password !== confirm) {
            req.flashAdd('tabError', 'Les mots de passe ne correspondent pas.');
            rep = false
        }
        if (!pwdRegex.test(password)) {
            req.flashAdd('tabError', 'Mot de passe en carton. ([a-z]+[A-Z]+[0-9])*(6-20)');
            rep = false
        }
        cb(rep)
    },

    // - "Homme" ou "Femme"
    genre: genre = (genre, req, cb) => {
        let rep = true
        if (genre !== "Homme" && genre !== "Femme") {
            req.flashAdd('tabError', 'Tu es absolument sur d\'etre humain?');
            rep = false
        }
        cb(rep)
    },

    // - "Hetero", "Bi" ou "Homo"
    orientation: orientation = (orientation, req, cb) => {
        let rep = true
        if (orientation !== "Hetero" && orientation !== "Bi" && orientation !== "Homo") {
            req.flashAdd('tabError', 'Desole, mais il va falloir faire un choix sur ton orientation sexuelle...');
            rep = false
        }
        cb(rep)
    },

    // - Taille correcte
    bio: bio = (bio, req, cb) => {
        let rep = true
        if (!isLengthOkay("Bio", bio, req)) rep = false
        cb(rep)
    },

    interests: interests = (interests, req, cb) => {
        let rep = true
        console.log(interests)
        console.log(JSON.stringify(interests, null, 4));
        cb(rep)
    },

    localisation: localisation = (localisation, req, cb) => {
        let rep = true
        cb(rep)
    }
}

function isLengthOkay(champs, value, req) {
    let result = true
    console.log(champs+" : "+value.length)
    if (value.length < 3) {
        req.flashAdd('tabError', champs+': trop court');
        result = false
    }
    else if (value.length > 25) {
        req.flashAdd('tabError', champs+': trop long');
        result = false
    }
    return result
}

module.exports = Check