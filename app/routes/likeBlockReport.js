const connection = require('../../config/db')


exports.block = (req, res) => {
  let user_id = req.user.id
  let bg_id = req.body.bg_id
//   console.log(user_id+" - "+bg_id)
function unMatch () {
    console.log("Unmatch")
    connection.query('DELETE FROM matchs WHERE user_id = ? AND bg_id = ?', [user_id, bg_id], (err) => {
        if (err) throw err
        connection.query('DELETE FROM matchs WHERE user_id = ? AND bg_id = ?', [bg_id, user_id], (err) => {
            if (err) throw err
            else res.redirect('back')
        });
    });
}
function unlike () {
    console.log("Unlike")
    connection.query('DELETE FROM likes WHERE user_id = ? AND bg_id = ?', [user_id, bg_id], (err) => {
        if (err) throw err
        connection.query("SELECT * FROM likes WHERE user_id = ? AND bg_id = ?", [bg_id, user_id], (err, rows) => {
            if (err) throw err;
            if (rows.length) unMatch()
            else res.redirect('back')
        });
    });
}
  function unblock () {
      connection.query('DELETE FROM blocks WHERE user_id = ? AND bg_id = ?', [user_id, bg_id], (err) => {
          if (err) throw err
        //   req.flashAdd('tabSuccess', 'Debloque !');
          res.redirect('back')
      });
  }
  function block () {
    connection.query("SELECT * FROM users WHERE id = ? AND id != ?", [bg_id, user_id], (err, rows) => {
        if (err) throw err;
        if (rows.length) {
            connection.query('INSERT INTO blocks VALUES (?, ?)', [user_id, bg_id], (err) => {
                if (err) throw err
                // req.flashAdd('tabSuccess', 'Bloque !');
                unlike ()
            });
        } else res.redirect('back')
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

  function unMatch () {
    connection.query('DELETE FROM matchs WHERE user_id = ? AND bg_id = ?', [user_id, bg_id], (err) => {
        if (err) throw err
        connection.query('DELETE FROM matchs WHERE user_id = ? AND bg_id = ?', [bg_id, user_id], (err) => {
            if (err) throw err
            else res.redirect('back')
        });
    });
    }

    function unlike () {
        connection.query('DELETE FROM likes WHERE user_id = ? AND bg_id = ?', [user_id, bg_id], (err) => {
            if (err) throw err
            connection.query("SELECT * FROM likes WHERE user_id = ? AND bg_id = ?", [bg_id, user_id], (err, rows) => {
                if (err) throw err;
                if (rows.length) unMatch()
                else res.redirect('back')
            });
        });
    }
  function unreport () {
      connection.query('DELETE FROM reports WHERE user_id = ? AND bg_id = ?', [user_id, bg_id], (err) => {
          if (err) throw err
        //   req.flashAdd('tabSuccess', 'Signalement supprime !');
          res.redirect('back')
      });
  }

  function report () {
    connection.query("SELECT * FROM users WHERE id = ? AND id != ?", [bg_id, user_id], (err, rows) => {
        if (err) throw err;
        if (rows.length) {
            connection.query('INSERT INTO reports VALUES (?, ?)', [user_id, bg_id], (err) => {
                if (err) throw err
                // req.flashAdd('tabSuccess', 'Signale !');
                unlike ()
            });
        } else res.redirect('back')
        });
  }
  connection.query("SELECT * FROM reports WHERE user_id = ? AND bg_id = ?", [user_id, bg_id], (err, rows) => {
      if (err) throw err;
      if (rows.length) unreport()
      else report()
  });
}