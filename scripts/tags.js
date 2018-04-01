const connection = require('../config/db')

users_tags = () => {
    connection.query(`\
    CREATE TABLE IF NOT EXISTS \`tags\` ( \
        interest VARCHAR(30) NOT NULL PRIMARY KEY \
    )`);
    connection.query(`\
    CREATE TABLE IF NOT EXISTS \`users_tags\` ( \
        user_id INT UNSIGNED NOT NULL, \
        interest VARCHAR(30) NOT NULL, \
            PRIMARY KEY (user_id, interest) \
    )`);
} 

module.exports = users_tags

users_tags()

connection.end();