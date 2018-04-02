const connection = require('../config/db')

require('./users')()
console.log('Success: table users Created!')
require('./tags')()
console.log('Success: table tags & users_tags Created!')
require('./actions')()
console.log('Success: table likes Created!')


connection.end();