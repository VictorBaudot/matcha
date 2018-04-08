const connection = require('../../config/db')

confirm = (req, res) => {
  let login = req.params.login
  let token = req.params.token

  connection.query("SELECT * FROM users WHERE login = ? AND token = ?",[login, token], (err, rows) => {
    if (err) return console.log(err);
    else if (!rows.length) {
      req.flashAdd('tabError', 'Votre lien de confirmation n\'est pas valide.')
      res.redirect('/')
    }
    else {
      connection.query("UPDATE users SET active = 1 WHERE login = ? AND token = ?",[login, token], (err, rows) => {
        if (err) return console.log(err);
        else {
          req.flashAdd('tabSuccess', 'Email valide. Vous pouvez maintenant vous connecter.')
          res.redirect('/')
        }
      })
    }
  })
  
}

module.exports = confirm
