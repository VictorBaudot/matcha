const connection = require('../../config/db')
const moment = require('moment')

moment.locale('fr')

class User {

    constructor (row) {
        this.row = row
    }

    get id () {
        return this.row.id
    }

    get created () {
        return moment(this.row.created)
    }

    static signup (login, password, callback) {
        connection.query("INSERT INTO users SET login = ?, password = ?",
        [login, password], (err, rows) => {
            callback(err, rows)
        })
    }

    static signin (login, pwd, callback) {
        connection.query('SELECT * FROM users WHERE login = ? AND password = ?', [login, pwd], (err, rows) => {
            if (err) throw err
            callback(rows)
        })
    }

    static all (callback) {
        connection.query('SELECT * FROM users ORDER BY creation DESC', (err, rows) => {
            if (err) throw err
            callback(rows.map((row) => new User(row)))
        })
    }

    static findByLogin (login, callback) {
        console.log("findOne")
        connection.query('SELECT * FROM users WHERE login = ?', [login], (err, rows) => {
            callback(err, rows)
        })
    }

    static findById (id, callback) {
        console.log("findById")
        connection.query('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
            callback(err, rows)
        })
    }

}

module.exports = User