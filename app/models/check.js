const pwdRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,20})");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class Check {
}

Check.login = (login) => {
    return true
}

Check.nom = (nom) => {
    return true
}

Check.email = (email) => {
    return true
}

Check.age = (age) => {
    return true
}

Check.password = (password, confirm) => {
    return true
}

Check.genre = (genre) => {
    return true
}

Check.orientation = (orientation) => {
    return true
}

Check.bio = (bio) => {
    return true
}

Check.interests = (interests) => {
    return true
}

Check.localisation = (localisation) => {
    return true
}

module.exports = Check