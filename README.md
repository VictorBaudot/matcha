# Matcha: dating website made with NodeJs -- 42's project

![home](https://image.ibb.co/c6AQ17/matcha_home.png)

## Install

	1. Clone the repo: `git clone https://github.com/VictorBaudot/matcha.git`
	2. Install packages: `npm install`
	3. Edit the database configuration in `config/db.js`, add your 42's API credentials in `config/passport.js` and add your Google Maps's API key in `view/Connected/private.ejs` (line 1) and in `scripts/seed.js` (line 35)
	4. Create data schema: `node scripts/main.js`
	5. Add fake profiles: `node scripts/seed.js 500`
	6. Install and launch maildev to get all emails sent from the app: `sudo npm i -g maildev && maildev -s 1050`
	7. Launch: `npm start`
	8. Visit in your browser at: `http://localhost:6969`

## Subject 
	This project is about creating a dating website. 
	You will need to create an app allowing two potential lovers to meet, 
	from the registration to the final encounter. 
	A user will then be able to register, connect, fill his/her profile, 
	search and look into the profile of other users, like them, chat with those that “liked” back.
	Look at `subject.pdf` for more details.

## Key concepts 
	* Front-end framework
	* Build tools
	* Micro-framework 
	* Advanced user registration and sign-in
	* Real-time application
	* Geolocation 
	* Security (XSS, SQL injection..) 
	* Data validation
	* UX / UI Design 

## My stack
	* Node.js
	* Express (+ middleware)
	* JavaScript ES6+
	* MySQL
 	* OAuth
	* Socket.io
	* Fakerjs

## Project’s constraints 

	Mandatory tools: 
		* Relational database 

	Forbidden tools:
		* ORM/ODM
		* MVC framework
		* Validators 
		* Registration / Authentication library 
