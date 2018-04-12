const connection = require('../config/db')

connection.query(`\
CREATE TABLE IF NOT EXISTS \`likes\` ( \
    user_id INT UNSIGNED NOT NULL, \
    bg_id INT UNSIGNED NOT NULL, \
        PRIMARY KEY (user_id, bg_id) \
)`, (err) => {
    if (err) console.error(err)
    else console.log('Success: table likes Created!')
});

connection.query(`\
CREATE TABLE IF NOT EXISTS \`matchs\` ( \
    user_id INT UNSIGNED NOT NULL, \
    bg_id INT UNSIGNED NOT NULL, \
        PRIMARY KEY (user_id, bg_id) \
)`, (err) => {
    if (err) console.error(err)
    else console.log('Success: table matchs Created!')
});

connection.query(`\
CREATE TABLE IF NOT EXISTS \`blocks\` ( \
    user_id INT UNSIGNED NOT NULL, \
    bg_id INT UNSIGNED NOT NULL, \
        PRIMARY KEY (user_id, bg_id) \
)`, (err) => {
    if (err) console.error(err)
    else console.log('Success: table blocks Created!')
});

connection.query(`\
CREATE TABLE IF NOT EXISTS \`reports\` ( \
    user_id INT UNSIGNED NOT NULL, \
    bg_id INT UNSIGNED NOT NULL, \
        PRIMARY KEY (user_id, bg_id) \
)`, (err) => {
    if (err) console.error(err)
    else console.log('Success: table reports Created!')
});

connection.query(`\
CREATE TABLE IF NOT EXISTS \`visits\` ( \
    user_id INT UNSIGNED NOT NULL, \
    bg_id INT UNSIGNED NOT NULL, \
        PRIMARY KEY (user_id, bg_id) \
)`, (err) => {
    if (err) console.error(err)
    else console.log('Success: table visits Created!')
});