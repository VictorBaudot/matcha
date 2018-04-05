const connection = require('../../config/db')

exports.chats = (req, res) => {
    let login = req.user.login
    let user = req.user
    let matchs, messages
    let User = require('./../models/user')
    let count = 0
    let total = 3
    let nb_notifs = 0

    function displayProfile() {
        res.render("Connected/chats.ejs", {user, matchs, messages, nb_notifs, title: 'Chats'})
    }

    connection.query("SELECT * FROM users INNER JOIN matchs ON matchs.user_id = users.id WHERE matchs.bg_id = ?", user.id, (err, rows) => {
        if (err) throw err;
        if (rows.length) matchs = rows
        else matchs = []
        // console.log(JSON.stringify(matchs, null, 4));
        count++
        if (count == total)
            displayProfile()
    });

    connection.query("SELECT * FROM messages WHERE user_id = ? OR bg_id = ? ORDER BY id DESC", [user.id, user.id], (err, rows) => {
    if (err) throw err;
    if (rows.length) messages = rows
    // console.log(JSON.stringify(messages, null, 4));
    count++
    if (count == total)
        displayProfile()
    });

    connection.query("SELECT * FROM notifs WHERE bg_id = ?", req.user.id, (err, rows) => {
        if (err) throw err;
        nb_notifs = rows.length
        count++
        if (count == total)
          displayProfile()
    });
};