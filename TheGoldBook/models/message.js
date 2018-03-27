const connection = require('../config/db')
const moment = require('moment')

moment.locale('fr')

class Message {

    constructor (row) {
        this.row = row
    }

    get content () {
        return this.row.content
    }

    get id () {
        return this.row.id
    }

    get created () {
        return moment(this.row.created)
    }

    static create (content, callback) {
        connection.query('INSERT INTO messages SET content = ?, created = ?', 
        [content, new Date()], (err, result) => {
            if (err) throw err
            callback(result)
        })
    }

    static all (callback) {
        connection.query('SELECT * FROM messages ORDER BY created DESC', (err, rows) => {
            if (err) throw err
            callback(rows.map((row) => new Message(row)))
        })
    }

    static find (id, callback) {
        connection.query('SELECT * FROM messages WHERE id = ? ORDER BY created DESC', [id], (err, rows) => {
            if (err) throw err
            callback(rows.map((row) => new Message(row)))
        })
    }

}

module.exports = Message