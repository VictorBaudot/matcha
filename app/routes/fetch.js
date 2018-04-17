const connection = require('../../config/db')

exports.root = (req, res) => {
  let page = req.params.page;
  // console.log("Page: "+page)
  let user = req.user
  let my_tags = []
    let users = []
    let filters = {
      age: {l: 20, u:40},
      dists: {l: 20, u:60},
      pop: {l: 400, u:800},
      tags: [],
      sType: "",
      sOrder: ""
    }
    let querySelect = fquerySelect(user, user.genre, user.orientation)+" ORDER BY points DESC LIMIT 30 OFFSET ?"

    let displayProfile = () => {
      // console.log("Nb users: " + users.length)
      users.sort((a, b) => b.points - a.points);
      res.render('Connected/fetchRoot.ejs', {filters, users})
    }

    let prepareDisplay = () => {
      // console.log(querySelect)
      connection.query(querySelect, [user.id, user.id, user.id, page*30], (err, rows0) => {
        if (err) throw err;
        if (rows0.length) {
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
        } else displayProfile()
      });
    }

    connection.query("SELECT interest FROM users_tags WHERE user_id = ?", req.user.id, (err, rows) => {
      if (err) throw err;
      rows.forEach(row => {
          my_tags.push(row.interest)
      });
      prepareDisplay()
    });
    
}

exports.notifs = (req, res) => {
  
}

exports.chats = (req, res) => {
  
}