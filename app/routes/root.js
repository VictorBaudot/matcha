const connection = require('../../config/db')

exports.root = (req, res) => {
  if (req.isAuthenticated()) {
    let user = req.user
    let users, tags
    let count = 0
    let total = 3
    let nb_notifs = 0
    let filters = {
      age: {l: 20, u:40},
      dists: {l: 20, u:60},
      pop: {l: 400, u:800},
      tags: [],
      sType: "",
      sOrder: ""
    }
    let querySelect = fquerySelect(user, user.genre, user.orientation)+" ORDER BY age ASC"

    displayProfile = () => {
        res.render('Connected/index.ejs', {filters, tags, user, users, nb_notifs, title: 'Accueil'})
    }

    prepareDisplay = () => {
      // console.log(querySelect)
      connection.query(querySelect, (err, rows0) => {
        if (err) throw err;
        users = rows0
        let count2 = 0
        let total2 = users.length
        users.forEach(usr => {
          connection.query("SELECT interest FROM users_tags WHERE user_id = ?", usr.id, (err, rows1) => {
            if (err) throw err;
            let tab = []
            rows1.forEach(row => {
                tab.push('#'+row.interest)
            });
            usr.interests = tab.join(', ')
            count2++
            if (count2 == total2) {
              count++
              if (count == total)
                displayProfile()
            }
          });
        })
      });

      connection.query("SELECT * FROM notifs WHERE bg_id = ? AND seen = 'N'", req.user.id, (err, rows) => {
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

    prepareDisplay()
  }
  else res.render("NotConnected/index.ejs")
}
