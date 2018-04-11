const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const passport = require('passport')
const server = require('http').Server(app);
const io = require('socket.io')(server);
const session = require("express-session")
const busboyBodyParser = require('busboy-body-parser')

const port = 6969;
const hostname = '127.0.0.1';
const connection = require('./config/db')

require('./config/passport')(passport)

// Moteur de templates
app.set('view engine', 'ejs')

// Middlewares --- Attention a leur ordre
app.use('/assets', express.static('public'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
// app.use(busboyBodyParser())
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(require('./middlewares/flash'))

// Routes
require('./app/routes.js')(app, passport)

var users = {};

io.on('connection', function(socket){

    var me = false;

    socket.on('login', function(user){
        //console.log(user)
        connection.query('SELECT * FROM users WHERE id = ?', [user.id], (err, rows) => {
            if (err) {
                socket.emit('mybad', {error: err.code});
            } else if(rows.length === 1 && rows[0].token === user.token) {
                me = {
                    username: rows[0].login,
                    id: rows[0].id,
                    socketid: socket.id
                };
                // console.log(me)
                socket.emit('logged');
                socket.broadcast.emit('online', me.username)
                users[me.id] = me;
            } else {
                socket.emit('mybad', {error: 'Aucun utilisateur ne correspond'});
            }
        })
    })
    socket.on('disconnect', function(){
        // console.log('user disconnected');
    });

    const chatRegex = new RegExp("^[a-zA-Z0-9_\ +?!-]{2,40}$");

    socket.on('newmsg', (message) => {
        if(message.message === '' || me.id === undefined) {
            socket.emit('mybad', 'Vous ne pouvez pas envoyer un message vide')
        } else if (me.id === undefined){
            socket.emit('mybad', 'Vous devez être identifié pour envoyer un message')
        } else if (!chatRegex.test(message.message)){
            socket.emit('mybad', 'Format du message incorrect')
        } else {
            message.user = me;
            connection.query('SELECT * FROM matchs WHERE user_id = ? AND bg_id = ?', [
                message.user.id,
                message.bg_id
            ], (err, rows) => {
                if(err){
                    socket.emit('mybad', err.code)
                } else if (!rows.length){
                    socket.emit('mybad', 'Vous ne pouvez pas discuter avec cette personne.')
                } else {
                    message.creation = Date.now();
                    connection.query('INSERT INTO messages SET user_id = ?, message = ?, bg_id = ?, creation = ?', [
                        message.user.id,
                        message.message,
                        message.bg_id,
                        new Date(message.creation)
                    ], (err) => {
                        if(err){
                            socket.emit('mybad', err.code)
                        } else {
                            socket.emit('mymsg', message)
                            if (users[message.bg_id]) io.to(users[message.bg_id].socketid).emit('newmsg', message)
                            connection.query("SELECT * FROM notifs WHERE user_id = ? AND type = ? AND bg_id = ? ORDER BY creation DESC", [message.user.id, 'message', message.bg_id], (err, rows0) => {
                                if (err) throw err;
                                let datenow = new Date()
                                let callit = () => {
                                    connection.query('INSERT INTO notifs SET user_id = ?, type = ?, bg_id = ?, creation = ?', [
                                        message.user.id,
                                        'message',
                                        message.bg_id,
                                        new Date(message.creation)
                                    ], (err) => {
                                        if(err){
                                            socket.emit('mybad', err.code)
                                        } else {
                                            // console.log("Destinataire notif: ")
                                            // console.log(users[message.bg_id])
                                            if (users[message.bg_id]) io.to(users[message.bg_id].socketid).emit('notif', message)
                                        }
                                    })
                                }
                                if (rows0.length) {
                                    if (rows0[0].creation.getTime() < datenow.getTime() - 600000) callit()
                                } else callit()
                            });
                        }
                    })
                }
            })
        }
    })

    socket.on('visit', (infos) => {
        let user_id = infos.user_id
        let bg_id = infos.bg_id
        // console.log(user_id+" - "+bg_id)
        connection.query("SELECT * FROM notifs WHERE user_id = ? AND type = ? AND bg_id = ?", [user_id, 'visit', bg_id], (err, rows0) => {
            if (err) throw err;
            if (!rows0.length) {
                connection.query('INSERT INTO notifs SET user_id = ?, type = ?, bg_id = ?, creation = ?', [
                    user_id,
                    'visit',
                    bg_id,
                    new Date()
                ], (err) => {
                    if(err){
                        socket.emit('mybad', err.code)
                    } else {
                        connection.query("SELECT pop FROM users WHERE id = ?", [bg_id], (err, rows) => {
                            if (err) throw err;
                            if (rows.length) {
                                connection.query("UPDATE users SET pop = ? WHERE id = ?",[rows[0].pop + 10, bg_id], (err) => {
                                    if (err) return console.log(err);
                                    else {
                                        // console.log("Destinataire notif: ")
                                        // console.log(users[bg_id])
                                        if (users[bg_id]) io.to(users[bg_id].socketid).emit('notif', 'visit')
                                    }
                                })
                            }
                        });
                    }
                })
            }
        });
        
    })

    socket.on('like', (infos) => {
        let user_id = infos.user_id
        let bg_id = infos.bg_id
        // console.log(user_id+" - "+bg_id)

        function addNotif(type) {
            console.log(type)
            if (type == 'like') {
                connection.query("SELECT * FROM notifs WHERE user_id = ? AND type = ? AND bg_id = ?", [user_id, 'like', bg_id], (err, rows0) => {
                    if (err) throw err;
                    if (!rows0.length) {
                        connection.query('INSERT INTO notifs SET user_id = ?, type = ?, bg_id = ?, creation = ?', [
                            user_id,
                            'like',
                            bg_id,
                            new Date()
                        ], (err) => {
                            if(err){
                                socket.emit('mybad', err.code)
                            } else {
                                connection.query("SELECT pop FROM users WHERE id = ?", [bg_id], (err, rows) => {
                                    if (err) throw err;
                                    if (rows.length) {
                                        connection.query("UPDATE users SET pop = ? WHERE id = ?",[rows[0].pop + 20, bg_id], (err) => {
                                            if (err) return console.log(err);
                                            else {
                                                // console.log("Destinataire notif: ")
                                                // console.log(users[bg_id])
                                                if (users[bg_id]) io.to(users[bg_id].socketid).emit('notif', 'like')
                                            }
                                        })
                                    }
                                });
                            }
                        })
                    }
                });
            } else {
                connection.query('INSERT INTO notifs SET user_id = ?, type = ?, bg_id = ?, creation = ?', [
                    user_id,
                    type,
                    bg_id,
                    new Date()
                ], (err) => {
                    if (err) {
                        socket.emit('mybad', err.code)
                    } else {
                        // console.log("Destinataire notif: ")
                        // console.log(users[bg_id])
                        if (users[bg_id]) io.to(users[bg_id].socketid).emit('notif', type)
                    }
                })
            }
        }

        function match () {
            connection.query('INSERT INTO matchs VALUES (?, ?)', [user_id, bg_id], (err) => {
                if (err) console.error(err);
                connection.query('INSERT INTO matchs VALUES (?, ?)', [bg_id, user_id], (err) => {
                    if (err) console.error(err);
                    else addNotif('match')
                });
            });
            
        }
        function unMatch () {
            connection.query('DELETE FROM matchs WHERE user_id = ? AND bg_id = ?', [user_id, bg_id], (err) => {
                if (err) console.error(err);
                connection.query('DELETE FROM matchs WHERE user_id = ? AND bg_id = ?', [bg_id, user_id], (err) => {
                    if (err) console.error(err);
                    else addNotif('unlike')
                });
            });
        }
        function unlike () {
            connection.query('DELETE FROM likes WHERE user_id = ? AND bg_id = ?', [user_id, bg_id], (err) => {
                if (err) console.error(err);
                connection.query("SELECT * FROM likes WHERE user_id = ? AND bg_id = ?", [bg_id, user_id], (err, rows) => {
                    if (err) throw err;
                    if (rows.length) unMatch()
                });
            });
        }
        function like () {
            connection.query("SELECT * FROM users WHERE id = ? AND id != ?", [bg_id, user_id], (err, rows) => {
                if (err) throw err;
                if (rows.length) {
                    connection.query('INSERT INTO likes VALUES (?, ?)', [user_id, bg_id], (err) => {
                        if (err) console.error(err);
                        connection.query("SELECT * FROM likes WHERE user_id = ? AND bg_id = ?", [bg_id, user_id], (err, rows) => {
                            if (err) throw err;
                            if (rows.length) match()
                            else addNotif('like')
                        });
                    });
                }
            });
        }

        connection.query("SELECT * FROM likes WHERE user_id = ? AND bg_id = ?", [user_id, bg_id], (err, rows) => {
            if (err) throw err;
            if (rows.length) unlike()
            else like()
        });
    })
})

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});