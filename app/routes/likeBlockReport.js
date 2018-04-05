const connection = require('../../config/db')

exports.like = (req, res) => {
  let user_id = req.user.id
  let bg_id = req.body.bg_id
  console.log(user_id+" - "+bg_id)
  function match () {
      connection.query('INSERT INTO matchs VALUES (?, ?)', [user_id, bg_id], (err) => {
          if (err) console.error(err);
          connection.query('INSERT INTO matchs VALUES (?, ?)', [bg_id, user_id], (err) => {
              if (err) console.error(err);
              req.flashAdd('tabSuccess', 'Nouveau Match :) !');
              res.redirect('back')
          });
      });
      
  }
  function unMatch () {
      connection.query('DELETE FROM matchs WHERE user_id = ? AND bg_id = ?', [user_id, bg_id], (err) => {
          if (err) console.error(err);
          connection.query('DELETE FROM matchs WHERE user_id = ? AND bg_id = ?', [bg_id, user_id], (err) => {
              if (err) console.error(err);
              req.flashAdd('tabSuccess', 'Unmatch :( !');
              res.redirect('back')
          });
      });
  }
  function unlike () {
      connection.query('DELETE FROM likes WHERE user_id = ? AND bg_id = ?', [user_id, bg_id], (err) => {
          if (err) console.error(err);
          connection.query("SELECT * FROM likes WHERE user_id = ? AND bg_id = ?", [bg_id, user_id], (err, rows) => {
              if (err) throw err;
              if (rows.length) unMatch()
              else {
                  req.flashAdd('tabSuccess', 'Unlike :( !');
                  res.redirect('back')
              }
          });
      });
  }
  function like () {
      connection.query('INSERT INTO likes VALUES (?, ?)', [user_id, bg_id], (err) => {
          if (err) console.error(err);
          connection.query("SELECT * FROM likes WHERE user_id = ? AND bg_id = ?", [bg_id, user_id], (err, rows) => {
              if (err) throw err;
              if (rows.length) match()
              else {
                  req.flashAdd('tabSuccess', 'Like :) !');
                  res.redirect('back')
              }
          });
      });
  }
  connection.query("SELECT * FROM likes WHERE user_id = ? AND bg_id = ?", [user_id, bg_id], (err, rows) => {
      if (err) throw err;
      if (rows.length) unlike()
      else like()
  });
}

exports.block = (req, res) => {
  let user_id = req.user.id
  let bg_id = req.body.bg_id

  function unblock () {
      connection.query('DELETE FROM blocks WHERE user_id = ? AND bg_id = ?', [user_id, bg_id], (err) => {
          if (err) console.error(err);
          req.flashAdd('tabSuccess', 'Debloque !');
          res.redirect('back')
      });
  }
  function block () {
      connection.query('INSERT INTO blocks VALUES (?, ?)', [user_id, bg_id], (err) => {
          if (err) console.error(err);
          req.flashAdd('tabSuccess', 'Bloque !');
          res.redirect('back')
      });
  }
  connection.query("SELECT * FROM blocks WHERE user_id = ? AND bg_id = ?", [user_id, bg_id], (err, rows) => {
      if (err) throw err;
      if (rows.length) unblock()
      else block()
  });
}

exports.report = (req, res) => {
  let user_id = req.user.id
  let bg_id = req.body.bg_id

  function unreport () {
      connection.query('DELETE FROM reports WHERE user_id = ? AND bg_id = ?', [user_id, bg_id], (err) => {
          if (err) console.error(err);
          req.flashAdd('tabSuccess', 'Signalement supprime !');
          res.redirect('back')
      });
  }
  function report () {
      connection.query('INSERT INTO reports VALUES (?, ?)', [user_id, bg_id], (err) => {
          if (err) console.error(err);
          req.flashAdd('tabSuccess', 'Signale !');
          res.redirect('back')
      });
  }
  connection.query("SELECT * FROM reports WHERE user_id = ? AND bg_id = ?", [user_id, bg_id], (err, rows) => {
      if (err) throw err;
      if (rows.length) unreport()
      else report()
  });
}