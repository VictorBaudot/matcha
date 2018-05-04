# Matcha: dating website made with NodeJs -- 42's project

Code for the entire Matcha website

Current version database is ported to MySQL

We will be using Passport to authenticate users locally

## Instructions

If you would like to download the code and try it for yourself:

1. Clone the repo: `git clone git@github.com:VictorBaudot/matcha.git`
2. Install packages: `npm install`
3. Edit the database configuration: `config/database.js`
4. Create data schema: `node scripts/main.js`
5. Add fake profiles: `node scripts/seed.js 500`
6. Install and launch maildev to get all emails sent from the app: `npm i -g maildev && maildev -s 1050`
7. Launch: `npm start`
8. Visit in your browser at: `http://localhost:6969`

