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
        connection.query('SELECT * FROM users WHERE login = ?', [login], (err, rows) => {
            if (err) throw err
            callback(rows[0])
        })
    }

    static update (id, column, value, callback) {
        let query = "UPDATE users SET " + column + " = ? WHERE id = ?";
        connection.query(query, [value, id], (err) => {
            if (err) throw err
            callback()
        })
    }

    static findById (id, callback) {
        connection.query('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
            callback(err, rows)
        })
    }

}

let update = (table, idcol) => (id, o, callback) => {
    let keys = Object.keys(o);
    let cols = keys.map(k => `${k} = ?`).join(', ');
    let query = `UPDATE ${table} SET ${cols} WHERE ${idcol} = ${id}`;
    let values = keys.map(k => o[k]).concat(id);
    connection.query(query, values, (err) => {
      if (err) throw err;
      callback();
    });
  };

User.update = update('users', 'id');

module.exports = User