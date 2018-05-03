const mysql = require('mysql')

const connection = mysql.createConnection({
    host: '',
    user: '',
    port: '',
    password: '',
    database: '',
});

connection.connect()

module.exports = connection