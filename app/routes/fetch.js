const connection = require('../../config/db')

exports.root = (req, res) => {
  let page = req.params.page;
  console.log("Page: "+page)
  let user = req.user
    let users = []
    let count = 0
    let total = 1
    let filters = {
      age: {l: 20, u:40},
      dists: {l: 20, u:60},
      pop: {l: 400, u:800},
      tags: [],
      sType: "",
      sOrder: ""
    }
    let querySelect = fquerySelect(user, user.genre, user.orientation)+" ORDER BY pop DESC LIMIT 30 OFFSET ?"

    let displayProfile = () => {
      console.log("Nb users: " + users.length)
      users.forEach(usr => {
        console.log(usr.login)
      })
      res.render('Connected/fetchRoot.ejs', {filters, users})
    }

    let prepareDisplay = () => {
      console.log(querySelect)
      connection.query(querySelect, [user.id, user.id, page*30], (err, rows0) => {
        if (err) throw err;
        if (rows0.length) {
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
        } else displayProfile()
      });
    }

    prepareDisplay()
}

exports.notifs = (req, res) => {
  
}

exports.chats = (req, res) => {
  
}