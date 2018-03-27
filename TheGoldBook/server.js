const express = require('express')
const app = express()
const session = require('express-session')
const bodyParser = require('body-parser')


// Moteur de templates
app.set('view engine', 'ejs')

// Middlewares --- Attention a leur ordre
app.use('/assets', express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))
app.use(require('./middlewares/flash'))

// Routes
app.get('/', (req, res) => {
    let Message = require('./models/message')
    Message.all(function (messages) {
        res.render('pages/index', {messages: messages})
    })
})

app.get('/message/:id', (req, res) => {
    let id = req.params.id
    let Message = require('./models/message')
    Message.find(id, function (messages) {
        res.render('messages/show', {messages: messages})
    })
})

app.post('/', (req, res) => {
    let msg = req.body.message
    if (msg === undefined || msg === '') {
        req.flash('error', "Vous n'avez pas poste de message")
        res.redirect('/')
    } else {
        let Message = require('./models/message')
        Message.create(msg, function () {
            req.flash('success', "Merci!")
            res.redirect('/')
            console.log(req.session.flash)
        })
    }
})

app.listen(3000)