const connection = require('../config/db')

const tags = [
	'cats', 'dogs', 'movies', 'music', 'books',
	'travel', 'sport', 'pokemon', 'sushi', 'fashion',
	'games', 'yoga', 'writing', 'trekking', 'startup',
	'humor', 'chill', 'kind', 'extrovert', 'introvert',
	'hookup', 'friendship', 'tall', 'short', 'workout'
];
let count = 0
let total = tags.length

users_tags = () => {

    addTags = () => {
        tags.forEach(tag => {
            connection.query('INSERT INTO tags VALUES (?)', tag, (err) => {
                if (err) console.error(err)
                count++
                if (count == total) connection.end()
            });
        })
    }

    connection.query(`\
    CREATE TABLE IF NOT EXISTS \`tags\` ( \
        interest VARCHAR(30) NOT NULL PRIMARY KEY \
    )`, (err) => {
        if (err) console.error(err)
        else {
            console.log('Success: table tags Created!')
            addTags()
        }
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

users_tags();