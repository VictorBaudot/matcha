const connection = require('../../config/db')

exports.root = (req, res) => {
  if (req.isAuthenticated()) {
      let users
      function displayProfile() {
          res.render('Connected/index.ejs', {users})
      }

      connection.query("SELECT * FROM users", (err, rows) => {
          if (err) throw err;
          users = rows
          displayProfile()
      });
  }
  else res.render("NotConnected/index.ejs")
}