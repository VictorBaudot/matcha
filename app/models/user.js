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

    static findByEmail (email, callback) {
        connection.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
            if (err) throw err
            callback(rows)
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
    console.log("\nIn update function -------------------")
    let p = JSON.parse(JSON.stringify(o));
    console.log("p: "+JSON.stringify(p, null, 4));

    if (p.interests) {
        let tags = p.interests.split(',')
        connection.query('DELETE FROM users_tags WHERE user_id = ?', id, (err) => {
            if (err) console.error(err);
        });
        tags.forEach(tag => {
            connection.query('SELECT * FROM tags WHERE interest = ?', tag, (err, rows) => {
                if (err) console.error(err);
                if (!rows.length) {
                    connection.query('INSERT INTO tags VALUES (?)', tag, (err) => {
                        if (err) console.error(err);
                    });
                }
            });
            connection.query('INSERT INTO users_tags VALUES (?, ?)', [id, tag], (err) => {
                if (err) console.error(err);
            });
        });
        delete p.interests
    }

    let keys = Object.keys(p);

    console.log(keys)
    let cols = keys.map(k => `${k} = ?`).join(', ');
    console.log(cols)

    if (!cols) return callback()
    let query = `UPDATE ${table} SET ${cols} WHERE ${idcol} = ${id}`;
    console.log(query)
    let values = keys.map(k => p[k]).concat(id);
    console.log(values)
    
    connection.query(query, values, (err) => {
        if (err) throw err;
        callback();
    });
  };

User.update = update('users', 'id');

module.exports = User