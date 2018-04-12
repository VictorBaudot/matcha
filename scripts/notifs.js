const connection = require('../config/db')

connection.query(`\
CREATE TABLE IF NOT EXISTS \`notifs\` ( \
    id INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    user_id INT UNSIGNED NOT NULL, \
    bg_id INT UNSIGNED NOT NULL, \
    type enum('like', 'visit', 'match', 'message', 'unlike') NOT NULL, \
    seen enum('Y', 'N') NOT NULL default 'N', \
    creation DATETIME NULL, \
        PRIMARY KEY (id) \
)`, (err) => {
    if (err) console.error(err)
    else console.log('Success: table notifs Created!')
});
