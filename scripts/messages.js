const connection = require('../config/db')

connection.query(`\
CREATE TABLE IF NOT EXISTS \`messages\` ( \
    id INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    user_id INT UNSIGNED NOT NULL, \
    bg_id INT UNSIGNED NOT NULL, \
    message TEXT NULL, \
    creation DATETIME NULL, \
        PRIMARY KEY (id) \
)`, (err) => {
    if (err) console.error(err)
    else console.log('Success: table messages Created!')
});