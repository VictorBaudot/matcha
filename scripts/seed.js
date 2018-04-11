const faker = require('faker')
const gender = require('gender')
const request = require('request')
const bcrypt = require('bcrypt-nodejs')
const randomLocation = require('random-location');
const connection = require('../config/db')

const tags = [
	'cats', 'dogs', 'movies', 'music', 'books',
	'travel', 'sport', 'pokemon', 'sushi', 'fashion',
	'games', 'yoga', 'writing', 'trekking', 'startup',
	'humor', 'chill', 'kind', 'extrovert', 'introvert',
	'hookup', 'friendship', 'tall', 'short', 'workout'
];

let seeds = process.argv[2] || 0

pickRand = (arr) => {
	return arr[Math.floor(Math.random() * arr.length)];
}

getTags = (nb) => {
  let tab = []
  for (let i = 0; i < nb; i++) {
    do {
      tag = pickRand(tags)
    } while (tab.includes(tag))
    tab.push(tag)
  }
  // console.log(tab)
  return tab
}

getLocation = (lat, lng, cb) => {
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&key=AIzaSyD1BJh8Wr--cY3PkcqAdl1XIxfJdpNr72Q';
  request({
    url: url,
    json: true
  }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
          body.results[1].formatted_address ? cb(body.results[1].formatted_address) : console.log(body)
      }
  })
};

generateUsers = (nb) => {
  const orientation = ["Bi", "Homo", "Hetero", "Hetero", "Hetero"];

  const P = { latitude: 48.861014, longitude: 2.341155 }; // Centre de Paris
  const R = 90* 1000; // 90km
  
  let users = []
  let newUser, query
  let count = 0

  insertUsers = (nb) => {
    let total = nb
    count = 0

    addCheck = () => {
      count++
      if (count == total) {
        console.log(count+" fake users generated. "+seeds+" left.")
        if (seeds == 0) process.exit(-1);
        else callGenerate()
      }
    }
    users.forEach(user => {
      //console.log(user)
      let tags = JSON.parse(JSON.stringify(user)).interests
      delete user.interests

      let countTags = 0
      let totalTags = tags.length
      let keys = Object.keys(user);

      let cols = keys.map(k => `${k}`).join(', ');
      let interokeys = keys.map(k => `?`).join(', ');

      let query = `INSERT INTO users (${cols}) VALUES (${interokeys})`;

      let values = keys.map(k => user[k]);

      connection.query(query, values, (err, res) => {
        if (err) throw err;
        else {
          console.log(res.insertId)
          tags.forEach(tag => {
              connection.query('INSERT INTO users_tags VALUES (?, ?)', [res.insertId, tag], (err) => {
                  if (err) console.error(err);
                  else {
                    countTags++
                    if (countTags == totalTags) {
                      addCheck()
                    }
                  }
              });
          });
        }
      });
    });
  }

  for (let i = 0; i < nb; i++) {
    let { latitude, longitude } = randomLocation.randomCirclePoint(P, R)
    let prenom = faker.name.firstName()
    let guessedGender = gender.guess(prenom).gender == 'male' ? 'Homme' : 'Femme';
    let login = faker.internet.userName() + Math.floor(Math.random() * 2313)
    let genre = guessedGender
    let interests = getTags(Math.floor((Math.random() * 4) + 1))

    mycb = (localisation) => {
      users.push({
        login,
        prenom,
        nom: faker.name.lastName(),
        email: faker.internet.email(),
        password: bcrypt.hashSync('Root00', bcrypt.genSaltSync(9)),
        creation: faker.date.between('1987-01-01', '2018-04-04'),
        last_visit: faker.date.between('1987-01-01', '2018-04-04'),
        active: 1,
        ready: 1,
        pop: Math.floor(Math.random() * 1000),
        age: Math.floor((Math.random() * 64) + 16),
        genre,
        orientation: pickRand(orientation),
        bio: faker.lorem.sentence(),
        token: bcrypt.hashSync('matcha'+login, bcrypt.genSaltSync(9)),
        interests,
        localisation,
        lat: latitude,
        lng: longitude,
        online: (Math.floor(Math.random() * 20 ) > 15) ? 1 : 0,
        pp: genre+'/'+Math.floor(Math.random() * 59)+'.jpg'
      })

      count++
      if (count == nb) insertUsers(nb)
    }
    
    getLocation(latitude, longitude, mycb)
  }
}

callGenerate = () => {
  if (seeds <= 10) {
    let checkseeds = seeds
    seeds = 0
    generateUsers(checkseeds)
  } else {
    seeds -= 10
    generateUsers(10)
  }
}

if (seeds <= 0) {
  console.log("Nombre invalide")
  process.exit(-1);
} else {
  callGenerate()
}