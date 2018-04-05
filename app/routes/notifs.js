const connection = require('../../config/db')
const moment = require('moment')

moment.locale('fr')

exports.notifs = (req, res) => {
  let login = req.user.login
  let user = req.user
  let notifs = []
  let User = require('./../models/user')
  let count = 0
  let total = 1

  function displayNotifs() {
      res.render("Connected/notifs.ejs", {user: req.user, notifs, nb_notifs: notifs.length, title: 'Notifs'})
  }

  connection.query("SELECT * FROM notifs, users WHERE users.id = user_id AND bg_id = ?", user.id, (err, rows) => {
      if (err) throw err;
      if (rows.length) {
          notifs = rows
          let msg = ''
          notifs.forEach(notif => {
            switch(notif.type) {
                case 'like':
                    msg = ' a like votre profil';
                    break;
                case 'visit':
                    msg = ' a visite votre profil';
                    break;
                case 'match':
                    msg = ' match avec vous';
                    break;
                case 'unmatch':
                    msg = ' ne like plus votre profil';
                    break;
                case 'message':
                    msg = ' vous a envoye un message';
                    break;
                }
                notif.msg = msg
                notif.creation = capitalizeFirstLetter(moment(notif.creation).fromNow())
            })
            // console.log(msg +"\n"+ JSON.stringify(notifs, null, 4));
      }
      count++
      if (count == total)
          displayNotifs()
  });


};

function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
}