const connection = require('../../config/db')
const multer = require('multer')
const path = require('path')
const moment = require('moment')

moment.locale('fr')

exports.profile = (req, res) => {
  let login = req.user.login
  let user = req.user
  let infos_user = {}
  let tags, interests, likes, visits
  let User = require('./../models/user')
  let count = 0
  let total = 6
  let nb_notifs = 0

  function displayProfile() {
    infos_user.last_visit = capitalizeFirstLetter(moment(infos_user.last_visit).fromNow())
      res.render('Connected/profile/profile.ejs', {infos_user, tags, interests, likes, visits, user, nb_notifs, title: 'Profil'})
  }

  User.findByLogin(login, (infos, err) => {
      if (err) throw err
      infos_user = infos
      count++
      if (count == total)
          displayProfile()
  })

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

  connection.query("SELECT * FROM users INNER JOIN visits ON visits.user_id = users.id WHERE visits.bg_id = ?", user.id, (err, rows) => {
      if (err) throw err;
      visits = rows
      count++
      if (count == total)
          displayProfile()
  });

  connection.query("SELECT * FROM users INNER JOIN likes ON likes.user_id = users.id WHERE likes.bg_id = ?", user.id, (err, rows) => {
      if (err) throw err;
      likes = rows
      count++
      if (count == total)
          displayProfile()
  });

  connection.query("SELECT interest FROM users_tags WHERE user_id = ?", user.id, (err, rows) => {
      if (err) throw err;
      let tab = []
      rows.forEach(row => {
          tab.push('#'+row.interest)
      });
      interests = tab.join(', ')
      count++
      if (count == total)
          displayProfile()
  });
};

exports.modify_pics = (req, res, cb) => {
    // console.log("File: ")
    // console.log(req.files)
    let pics = req.files
    let o = {}
    let id = req.user.id

    function modifyp () {
        //console.log(JSON.stringify(o, null, 4));
        if (Object.keys(o).length !== 0){
            let User = require('./../models/user')
            User.update(id, o, () => {
                req.flashAdd('tabSuccess', 'Modification des photos de profil reussie.');
                // console.log(req.session.flash)
                cb(req, res)
            })
        } else cb(req, res)
    }

    for (let i in pics) {
        if (pics[i]) {
            // console.log(i+" - "+pics[i][0].filename)
            o[i] = '/assets/pics/' + pics[i][0].filename
        }
    }
    
    modifyp()
}

exports.modify_profile = (req, res) => {
    // console.log("File: ")
    // console.log(req.files)
    // console.log("Body: ")
    // console.log(req.body)
    const Check = require('./../models/check')
    let {login, prenom, nom, email, age, password, confirm, genre, orientation, bio, interests, localisation, lat, lng} = req.body
    let params = {login, prenom, nom, email, age, password, confirm, genre, orientation, bio, interests, localisation, lat, lng}
    let count = 0
    let o = {}
    let id = req.user.id
    let valid = true
    let total = 0

    // console.log(JSON.stringify(params, null, 4));

    for (let i in params) {
        if (params[i] && i !== 'confirm') total++
    }

    if (total === 0) {
        if (Object.keys(req.files).length === 0) req.flashAdd('tabError', 'Aucune modification n\'a ete enregistree.');
        checkReady(id)
    }

    function checkReady (id) {
        connection.query("SELECT * FROM users WHERE id = ?", id, (err, rows) => {
            if (err) throw err;
            let u = rows[0]
            if (u.ready == 0) {
                if (u.pp != "/assets/pics/default.jpg" && u.age && u.localisation) {
                    connection.query("UPDATE users SET ready = 1 WHERE id = ?",[id], (err, rows) => {
                        if (err) throw err;
                        req.flashAdd('tabSuccess', 'Vous etes desormais pret a Matcher!')
                        res.redirect('/profile')
                    })
                } else res.redirect('/profile')
            }
            else res.redirect('/profile')
        });
    }

    function modify () {
    //  console.log(JSON.stringify(o, null, 4));
        if (Object.keys(o).length !== 0){
            let User = require('./../models/user')
            // console.log(o)
            if (!o.localisation || !o.lat || !o.lng ) {
                if (o.localisation) delete o.localisation
                if (o.lat) delete o.lat
                if (o.lng) delete o.lng
            }
            // console.log(o)
            User.update(id, o, () => {
                for (let i in o) {
                    if (o[i] && i !== 'confirm' && i !== 'lat' && i !== 'lng') req.flashAdd('tabSuccess', capitalizeFirstLetter(i)+' -> '+o[i]);
                }
                // console.log("Check")
                checkReady(id)
            })
        } else res.redirect('/profile')
    }

    function checkField (i) {
        if (i === "password") {
            Check[i](params[i], params["confirm"], req, (check) => {
                let bcrypt = require('bcrypt-nodejs');
                if (check === true) o[i] = bcrypt.hashSync(params[i], bcrypt.genSaltSync(9))
                count++
                if (count === total) {
                    modify()
                }
            })
        } else if (i === "interests") {
            Check[i](params[i], req, (check) => {
                if (check === true) o[i] = params[i]
                count++
                if (count === total) {
                    modify()
                }
            })
        } else Check[i](params[i], req, (check) => {
            if (check === true) {
                if (i === "prenom" || i === "nom") o[i] = capitalizeFirstLetter(params[i])
                else o[i] = params[i]
            }
            count++
            if (count === total) {
                modify()
            }
        })
    }

    for (let i in params) {
        if (params[i] && i !== 'confirm') {
        //    console.log(i+" - "+params[i])
            checkField(i)
        }
    }

}


    // =====================================
    // OTHERS PROFILES =====================
    // =====================================
    exports.others = (req, res) => {
      let login = req.params.login
      let infos_user = {}
      let interests
      let liked, matched, blocked, reported, liked_me
      let User = require('./../models/user')
      let user_id = req.user.id
      let count = 0, nb_notifs = 0, total = 2

      function displayBg() {
        infos_user.last_visit = capitalizeFirstLetter(moment(infos_user.last_visit).fromNow())
        res.render('Connected/bg', {infos_user, interests, liked, liked_me, matched, blocked, reported, user: req.user, nb_notifs, title: login})
      }

      connection.query("SELECT * FROM notifs WHERE bg_id = ? AND seen = 'N'", req.user.id, (err, rows) => {
          if (err) throw err;
          nb_notifs = rows.length
          count++
          if (count == total)
            displayProfile()
      });

      function likeBlockReport (bg_id) {
        connection.query("SELECT * FROM likes WHERE user_id = ? AND bg_id = ?", [bg_id, user_id], (err, rows) => {
            if (err) throw err;
            if (!rows.length) liked_me = false
            else liked_me = true
            connection.query("SELECT * FROM likes WHERE user_id = ? AND bg_id = ?", [user_id, bg_id], (err, rows) => {
                if (err) throw err;
                if (!rows.length) liked = false
                else liked = true
                connection.query("SELECT * FROM blocks WHERE user_id = ? AND bg_id = ?", [user_id, bg_id], (err, rows) => {
                    if (err) throw err;
                    if (!rows.length) blocked = false
                    else blocked = true
                    connection.query("SELECT * FROM reports WHERE user_id = ? AND bg_id = ?", [user_id, bg_id], (err, rows) => {
                        if (err) throw err;
                        if (!rows.length) reported = false
                        else reported = true
                        connection.query("SELECT * FROM matchs WHERE user_id = ? AND bg_id = ?", [user_id, bg_id], (err, rows) => {
                            if (err) throw err;
                            if (!rows.length) matched = false
                            else matched = true
                            count++
                            if (count == total)
                            displayBg()
                        })
                    });
                });
            });
        });
      }

      function addVisit (bg_id) {
          connection.query('INSERT INTO visits VALUES (?, ?)', [user_id, bg_id], (err) => {
              if (err) console.error(err);
              likeBlockReport(bg_id)
          });
      }

      function hasVisited(bg_id) {
          connection.query("SELECT * FROM visits WHERE user_id = ? AND bg_id = ?", [user_id, bg_id], (err, rows) => {
              if (err) throw err;
              if (!rows.length) addVisit(bg_id)
              else likeBlockReport(bg_id)
          });
      }

      User.findByLogin(login, (infos, err) => {
          if (err || !infos) {
              req.flashAdd('tabError', 'Aiee... Desole, ce(tte) BG n\'existe pas');
              res.redirect('back')
          } else {
                if (infos.ready == 0) {
                    req.flashAdd('tabError', 'Cet utilisateur n\'est pas pret a matcher (et encore moins avec toi)');
                    res.redirect('back')
                }
                else {
                    connection.query("SELECT * FROM users WHERE login = ? AND id IN (SELECT user_id FROM blocks WHERE bg_id = ?)", [login, user_id], (err, rows3) => {
                        if (err) throw err;
                        if (rows3.length) {
                            req.flashAdd('tabError', 'Sorry, mais vous avez ete bloque par cette personne geniale');
                            res.redirect('back')
                        }
                        else {
                            infos_user = infos
                            connection.query("SELECT interest FROM users_tags WHERE user_id = ?", infos_user.id, (err, rows) => {
                                if (err) throw err;
                                let tab = []
                                rows.forEach(row => {
                                    tab.push('#'+row.interest)
                                });
                                interests = tab.join(', ')
                                hasVisited(infos_user.id)
                            });
                        }
                    });
                }
          }
      })

      
  }

function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1).toLowerCase();
}