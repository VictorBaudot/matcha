const connection = require('../config/db')

module.exports = connection.query(`\
CREATE TABLE IF NOT EXISTS \`users\` ( \
    id INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    login VARCHAR(60) NOT NULL default '', \
	prenom VARCHAR(255) NOT NULL default '', \
	nom VARCHAR(255) NOT NULL default '', \
    email VARCHAR(320) NOT NULL default '', \
	password TEXT NULL, \
	creation DATETIME NULL, \
	active BINARY(1) NOT NULL default 0, \
	ready BINARY(1) NOT NULL default 0, \
    pop INT UNSIGNED NOT NULL default 100, \
	age INT UNSIGNED NULL, \
	genre enum('Homme', 'Femme') NOT NULL default 'Homme', \
	orientation enum('Hetero', 'Homo', 'Bi') NOT NULL default 'Bi', \
	bio TEXT NULL, \
	token TEXT NULL, \
	localisation VARCHAR(255) NULL, \
	lat FLOAT( 10, 6 ) NULL, \
	lng FLOAT( 10, 6 ) NULL, \
	pp VARCHAR(320) NOT NULL default 'default.jpg', \
	p2 VARCHAR(320) NOT NULL default 'default.jpg', \
	p3 VARCHAR(320) NOT NULL default 'default.jpg', \
        PRIMARY KEY (id) \
)`, (err) => {
	if (err) console.error(err)
	else console.log('Success: table users Created!')
});

connection.end();