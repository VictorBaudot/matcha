CREATE TABLE IF NOT EXISTS users
(
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,
	login VARCHAR(255) NOT NULL default '',
	prenom VARCHAR(255) NOT NULL default '',
	nom VARCHAR(255) NOT NULL default '',
	email VARCHAR(320) NOT NULL default '',
	password TEXT NOT NULL,
	creation DATETIME,
	active BINARY(1) NOT NULL default '0',
	age INT UNSIGNED NOT NULL,
	genre enum('homme', 'femme') NOT NULL,
	orientation enum('hetero', 'homo', 'bi') NOT NULL,
	bio TEXT NOT NULL default '',
	interests BLOB NULL,
	profile_pic TEXT NULL,
	pics BLOB NULL,
	pop_score FLOAT default 0,
	localisation VARCHAR(255) NOT NULL default '',
	reported BLOB NULL,
	blocked BLOB NULL,
	activity DATETIME,
	rights enum('user', 'admin') NOT NULL default 'user'
);

CREATE TABLE IF NOT EXISTS confirm (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,
	userid INT UNSIGNED NOT NULL,
	randomkey VARCHAR(128) NOT NULL default '',
	email VARCHAR(250) default NULL);

CREATE TABLE IF NOT EXISTS matchs (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,
	userid INT UNSIGNED NOT NULL,
	);

CREATE TABLE IF NOT EXISTS visits (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,
	userid INT UNSIGNED NOT NULL,
	);

CREATE TABLE IF NOT EXISTS likes (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,
	userid INT UNSIGNED NOT NULL,
	);

CREATE TABLE messages (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,
	content VARCHAR 255,
	created DATETIME);
