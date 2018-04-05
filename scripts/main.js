const connection = require('../config/db')

require('./users')()
require('./tags')()
require('./actions')()
require('./messages')()


connection.end();