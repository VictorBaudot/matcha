const connection = require('../../config/db')

exports.root = (req, res) => {
    let user = req.user
    let users, tags
    let my_tags = []
    let count = 0
    let total = 3
    let nb_notifs = 0
    let filters = {
      age: {l: 16, u:80},
      dists: {l: 0, u:100},
      pop: {l: 0, u:1000},
      tags: [],
      sType: "pop",
      sOrder: "desc",
      etat: ""
    }
    let querySelect = fquerySelect(user, user.genre, user.orientation)+" ORDER BY points DESC LIMIT 30"

    displayProfile = () => {
      // users.forEach(usr => {console.log(usr.login)})
      users.sort((a, b) => b.points - a.points);
      res.render('Connected/index.ejs', {filters, tags, user, users, nb_notifs, title: 'Accueil', flagNoFilter: true})
    }

    prepareDisplay = () => {
      // console.log(querySelect)
      function prepdisp2() {
        connection.query(querySelect, [user.id, user.id, user.id], (err, rows0) => {
          if (err) throw err;
          users = rows0
          let count2 = 0
          let total2 = users.length
          if (count2 == total2) {
            displayProfile()
          }
          users.forEach(usr => {
            connection.query("SELECT interest FROM users_tags WHERE user_id = ?", usr.id, (err, rows1) => {
              if (err) throw err;
              let tab = []
              rows1.forEach(row => {
                  tab.push('#'+row.interest)
                  my_tags.forEach(my_tag => {
                    if (row.interest == my_tag) usr.points += 50
                  });
              });
              usr.interests = tab.join(', ')
              count2++
              if (count2 == total2) {
                displayProfile()
              }
            });
          })
        });
      }

      connection.query("SELECT interest FROM users_tags WHERE user_id = ?", req.user.id, (err, rows) => {
        if (err) throw err;
        rows.forEach(row => {
            my_tags.push(row.interest)
        });
        count++
        if (count == total)
          prepdisp2()
      });

      connection.query("SELECT * FROM notifs WHERE bg_id = ? AND seen = 'N'", req.user.id, (err, rows) => {
        if (err) throw err;
        nb_notifs = rows.length
        count++
        if (count == total)
          prepdisp2()
      });

      connection.query("SELECT interest FROM tags", (err, rows) => {
        if (err) throw err;
        tags = rows
        count++
        if (count == total)
          prepdisp2()
      });

    }

    prepareDisplay()
}
