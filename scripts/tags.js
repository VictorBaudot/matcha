const connection = require('../config/db')

users_tags = () => {
    connection.query(`\
    CREATE TABLE IF NOT EXISTS \`tags\` ( \
        interest VARCHAR(30) NOT NULL PRIMARY KEY \
    )`, (err) => {
        if (err) console.error(err)
        else console.log('Success: table tags Created!')
    });

    connection.query(`\
    CREATE TABLE IF NOT EXISTS \`users_tags\` ( \
        user_id INT UNSIGNED NOT NULL, \
        interest VARCHAR(30) NOT NULL, \
            PRIMARY KEY (user_id, interest) \
    )`, (err) => {
        if (err) console.error(err)
        else console.log('Success: table users_tags Created!')
    });
} 

module.exports = users_tags

users_tags()

connection.end();