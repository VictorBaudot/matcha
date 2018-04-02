const connection = require('../config/db')

likes = () => {
    connection.query(`\
    CREATE TABLE IF NOT EXISTS \`likes\` ( \
        user_id INT UNSIGNED NOT NULL, \
        bg_id INT UNSIGNED NOT NULL, \
            PRIMARY KEY (user_id, bg_id) \
    )`);

    connection.query(`\
    CREATE TABLE IF NOT EXISTS \`matchs\` ( \
        user_id INT UNSIGNED NOT NULL, \
        bg_id INT UNSIGNED NOT NULL, \
            PRIMARY KEY (user_id, bg_id) \
    )`);

    connection.query(`\
    CREATE TABLE IF NOT EXISTS \`blocks\` ( \
        user_id INT UNSIGNED NOT NULL, \
        bg_id INT UNSIGNED NOT NULL, \
            PRIMARY KEY (user_id, bg_id) \
    )`);

    connection.query(`\
    CREATE TABLE IF NOT EXISTS \`reports\` ( \
        user_id INT UNSIGNED NOT NULL, \
        bg_id INT UNSIGNED NOT NULL, \
            PRIMARY KEY (user_id, bg_id) \
    )`);

    connection.query(`\
    CREATE TABLE IF NOT EXISTS \`visits\` ( \
        user_id INT UNSIGNED NOT NULL, \
        bg_id INT UNSIGNED NOT NULL, \
            PRIMARY KEY (user_id, bg_id) \
    )`);
} 

module.exports = likes

likes()

connection.end();