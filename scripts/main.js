const connection = require('../config/db')

require('./users')
require('./tags')
require('./actions')
require('./messages')
require('./notifs')

const tags = [
	'cats', 'dogs', 'movies', 'music', 'books',
	'travel', 'sport', 'pokemon', 'sushi', 'fashion',
	'games', 'yoga', 'writing', 'trekking', 'startup',
	'humor', 'chill', 'kind', 'extrovert', 'introvert',
	'hookup', 'friendship', 'tall', 'short', 'workout'
];

let count = 0
let total = tags.length

tags.forEach(tag => {
    connection.query('INSERT INTO tags VALUES (?)', tag, (err) => {
        if (err) console.error(err)
        count++
        if (count == total) connection.end()
    });
})