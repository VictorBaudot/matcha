const connection = require('../../config/db')
const moment = require('moment')

moment.locale('fr')

exports.notifs = (req, res) => {
  let login = req.user.login
  let user = req.user
  let notifs = []
  let User = require('./../models/user')
  let count = 0
  let total

  function displayNotifs() {
      res.render("Connected/notifs.ejs", {user: req.user, notifs, nb_notifs: 0, title: 'Notifs'})
  }

  connection.query("SELECT *, notifs.creation as sentat, notifs.id as notifId FROM notifs, users WHERE users.id = user_id AND bg_id = ? AND seen = 'N' ORDER BY sentat DESC", user.id, (err, rows) => {
      if (err) throw err;
      if (rows.length) {
          notifs = rows
          let msg = ''
          total = notifs.length
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
                case 'unlike':
                    msg = ' ne like plus votre profil';
                    break;
                case 'message':
                    msg = ' vous a envoye un message';
                    break;
            }
            notif.msg = msg
            notif.sentat = capitalizeFirstLetter(moment(notif.sentat).fromNow())

            connection.query("UPDATE notifs SET seen = 'Y' WHERE id = ?", [notif.notifId], (err, rows) => {
                if (err) throw err;
                count++
                if (count == total)
                    displayNotifs()
            });
        })
      } else displayNotifs()
  });



};

function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
}