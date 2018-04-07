const connection = require('../../config/db')

exports.root = (req, res) => {
  if (req.isAuthenticated()) {
      let users, tags
      let count = 0
      let total = 3
      let nb_notifs = 0
      
      function displayProfile() {
          res.render('Connected/index.ejs', {tags, user: req.user, users, nb_notifs, title: 'Accueil'})
      }

      connection.query("SELECT * FROM users WHERE ready = 1", (err, rows) => {
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

      connection.query("SELECT interest FROM tags", (err, rows) => {
        if (err) throw err;
        tags = rows
        count++
        if (count == total)
            displayProfile()
    });
  }
  else res.render("NotConnected/index.ejs")
}