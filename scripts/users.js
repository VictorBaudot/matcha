const connection = require('../config/db')

module.exports = connection.query(`\
CREATE TABLE IF NOT EXISTS \`users\` ( \
    id INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    login VARCHAR(20) NOT NULL default '', \
	prenom VARCHAR(255) NOT NULL default '', \
	nom VARCHAR(255) NOT NULL default '', \
    email VARCHAR(320) NOT NULL default '', \
	password TEXT NOT NULL, \
	creation DATETIME NULL, \
	active BINARY(1) NOT NULL default 0, \
	age INT UNSIGNED NULL, \
	genre enum('Homme', 'Femme') NOT NULL default 'Homme', \
	orientation enum('Hetero', 'Homo', 'Bi') NOT NULL default 'Bi', \
	bio TEXT NULL, \
	localisation VARCHAR(255) NULL, \
        PRIMARY KEY (id) \
)`);

connection.end();