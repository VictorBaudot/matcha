//const app = require ('./app')
//const map = require('lodash/map')
const app = require('express')()

app.get('/', (req, res) => {
    res.send("Tu es a la racine mamene")
})

app.get('/demo', (req, res) => {
    res.send("Oh yeah, fais moi une demo babyyy!!!")
})

app.listen(8080)

/*
console.log(map([1, 2, 3], function(n) {
    return n * 3;
}))

let yo = app.start()
yo.on('root', function (res) {
  res.write('Je suis a la racine mamene')
})
*/