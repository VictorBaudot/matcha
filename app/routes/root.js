const connection = require('../../config/db')

exports.root = (req, res) => {
  if (req.isAuthenticated()) {
      let users
      let count = 0
      let total = 2
      let nb_notifs = 0
      
      function displayProfile() {
          res.render('Connected/index.ejs', {user: req.user, users, nb_notifs, title: 'Accueil'})
      }

      connection.query("SELECT * FROM users", (err, rows) => {
          if (err) throw err;
          users = rows
          count++
          if (count == total)
            displayProfile()
      });

      connection.query("SELECT * FROM notifs WHERE bg_id = ?", req.user.id, (err, rows) => {
        if (err) throw err;
        nb_notifs = rows.length
        count++
        if (count == total)
          displayProfile()
    });
  }
  else res.render("NotConnected/index.ejs")
}