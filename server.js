const express = require('express')
const app = express()
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const bodyParser = require('body-parser')
const passport = require('passport')
const connectFlash = require('connect-flash')

const port = 6969;
const hostname = '127.0.0.1'; 

require('./config/passport')(passport)

// Moteur de templates
app.set('view engine', 'ejs')

// Middlewares --- Attention a leur ordre
app.use('/assets', express.static('public'))
app.use(morgan('dev'))
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
app.use(connectFlash())
app.use(require('./middlewares/flash'))

// Routes
require('./app/routes.js')(app, passport)

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });