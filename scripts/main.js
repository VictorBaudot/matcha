const connection = require('../config/db')

require('./users')()
console.log('Success: table users Created!')
require('./tags')()
console.log('Success: table tags Created!')


connection.end();