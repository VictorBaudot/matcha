const connection = require('../config/db')

require('./users')()
require('./tags')()
require('./actions')()
require('./messages')()
require('./notifs')()

connection.end();