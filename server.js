const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const passport = require('passport')
const server = require('http').Server(app);
const io = require('socket.io')(server);
const session = require("express-session")

const port = 6969;
const hostname = '127.0.0.1';
const connection = require('./config/db')

require('./config/passport')(passport)

// Moteur de templates
app.set('view engine', 'ejs')

// Middlewares --- Attention a leur ordre
app.use('/assets', express.static('public'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
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
                console.log(me)
                socket.emit('logged');
                users[me.id] = me;
            } else {
                socket.emit('mybad', {error: 'Aucun utilisateur ne correspond'});
            }
        })
    })

    socket.on('newmsg', (message) => {
        if(message.message === '' || me.id === undefined) {
            socket.emit('mybad', 'Vous ne pouvez pas envoyer un message vide')
        } else if (me.id === undefined){
            socket.emit('mybad', 'Vous devez être identifié pour envoyer un message')
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
                            connection.query('INSERT INTO notifs SET user_id = ?, type = ?, bg_id = ?, creation = ?', [
                                message.user.id,
                                'message',
                                message.bg_id,
                                new Date(message.creation)
                            ], (err) => {
                                if(err){
                                    socket.emit('mybad', err.code)
                                } else {
                                    console.log("Destinataire notif: ")
                                    console.log(users[message.bg_id])
                                    if (users[message.bg_id]) io.to(users[message.bg_id].socketid).emit('notif', message)
                                }
                            })
                        }
                    })
                }
            })
        }
    })

    socket.on('like', (infos) => {
        notif.user = me;
    })
})

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});