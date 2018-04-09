const connection = require('../../config/db')

exports.filter = (req, res) => {
  let user = req.user
  let users, tags
  let count = 0
  let total = 3
  let nb_notifs = 0
  let sType = req.body.sortType
  let sOrder = req.body.sortOrder
  let filters = {
    age: {l: 16, u:80},
    dists: {l: 0, u:100},
    pop: {l: 0, u:1000},
    tags: [],
    sType: "",
    sOrder: "",
    etat: ""
  }
  let {ageL, ageU, distanceL, distanceU, popL, popU, etat, interests} = req.body
  let querySelect = fquerySelect(user, user.genre, user.orientation)
  
  console.log(req.body)

  if (ageL && ageU && ageL >= 16 && ageL <= 79 && ageU >= 17 && ageU <= 80) {
    querySelect += " AND age > " + ageL + " AND age < " + ageU
    filters.age.l = ageL
    filters.age.u = ageU
  }
  if (popL && popU && popL >= 0 && popL <= 999 && popU >= 1 && popU <= 1000) {
    querySelect += " AND pop > " + popL + " AND pop < " + popU
    filters.pop.l = popL
    filters.pop.u = popU
  }
  if (distanceL && distanceU && distanceL >= 0 && distanceL <= 99 && distanceU >= 1 && distanceU <= 100) {
    filters.dists.l = distanceL
    filters.dists.u = distanceU
  }
  if (etat && (etat === "all" || etat === "online" || etat === "disconnected")) {
    if (etat === "all" ) filters.etat = "Peu importe"
    else if (etat === "online" ) {
      filters.etat = "Oui"
      querySelect += " AND online = 1 "
    } else if (etat === "disconnected" ) {
      filters.etat = "Non"
      querySelect += " AND online = 0 "
    }
  }
  if (interests) {
    total++
    filters.tags = interests.split(',')
    connection.query("SELECT * from tags", (err, rows) => {
      let tabTags = []
      rows.forEach(tag => {
        tabTags.push(tag.interest)
      })
      // console.log(tabTags)
      for (let i = 0; i < filters.tags.length; i++) {
        if (!tabTags.includes(filters.tags[i])) filters.tags.splice(i--, 1)
      }
      console.log(filters.tags)
      count++
      if (count == total)
        displayProfile()
    })
  }

  if (sType && (sType === "age" || sType === "pop" || sType === "distance")) {
    filters.sType = sType
    querySelect += " ORDER BY " + sType
    if (sOrder && (sOrder === "asc" || sOrder === "desc")) {
      filters.sOrder = sOrder
      querySelect += " " + sOrder.toUpperCase()
    }
  }

  function displayProfile() {
    //users.forEach(usr => {console.log(usr.interests)})
    if (filters.tags) {
      let ok = true
      let tab = []
      for (let i = 0; i < users.length; i++) {
        ok = true
        tab = users[i].interests.split(', ')
        filters.tags.forEach( filter => {
          if (!tab.includes('#'+filter)) ok = false
        })
        if (ok == false) users.splice(i--, 1) // i-- because users.length to big
      }
    }
    res.render('Connected/index.ejs', {filters, tags, user, users, nb_notifs, title: 'Accueil', flagNoFilter: false})
  }

  prepareDisplay = () => {
    console.log(querySelect)
    connection.query(querySelect, [user.id, user.id], (err, rows0) => {
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

fquerySelect = (user, genre, orientation) => {
  let query = "SELECT *, ( 6371 * acos( cos( radians("+user.lat+") ) * cos( radians( lat ) ) * cos( radians( lng ) - radians("+user.lng+") ) + sin( radians("+user.lat+") ) * sin( radians( lat ) ) ) ) AS `distance` "
  query += "FROM users WHERE id NOT IN (SELECT bg_id FROM blocks WHERE user_id = ?) AND ready = 1 AND id != ? AND "
  if (genre === "Homme") {
    if (orientation === "Hetero") {
      query += "genre = 'Femme' AND (orientation = 'Hetero' OR orientation = 'Bi')"
    } else if (orientation === "Homo") {
      query += "genre = 'Homme' AND (orientation = 'Homo' OR orientation = 'Bi')"
    } else {
      query += "((genre = 'Femme' AND (orientation = 'Hetero' OR orientation = 'Bi')) OR (genre = 'Homme' AND (orientation = 'Homo' OR orientation = 'Bi')))"
    }
  } else {
    if (orientation === "Hetero") {
      query += "genre = 'Homme' AND (orientation = 'Hetero' OR orientation = 'Bi')"
    } else if (orientation === "Homo") {
      query += "genre = 'Femme' AND (orientation = 'Homo' OR orientation = 'Bi')"
    } else {
      query += "((genre = 'Homme' AND (orientation = 'Hetero' OR orientation = 'Bi')) OR (genre = 'Femme' AND (orientation = 'Homo' OR orientation = 'Bi')))"
    }
  }
  return query
}