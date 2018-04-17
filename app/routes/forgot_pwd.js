const connection = require('../../config/db')
const nodemailer = require('nodemailer')
var bcrypt = require('bcrypt-nodejs');
// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
forgot_pwd = (req, res) => {
  let {login, email} = req.body
  let id
  let check = () => {
    connection.query("SELECT * FROM users WHERE login = ? AND email = ?",[login, email], (err, rows) => {
      if (err) throw err;
      else if (!rows.length) {
        req.flashAdd('tabError', 'Les informations que vous venez d\'envoyer sont incorrectes.')
        res.redirect('back')
      }
      else {
        id = rows[0].id
        let newpwd = generatePassword()
        let newpwd_crypt = bcrypt.hashSync(newpwd, bcrypt.genSaltSync(9))
        connection.query("UPDATE users SET password = ? WHERE id = ?",[newpwd_crypt, id], (err, rows) => {
          if (err) throw err;
          else go("Reinitialisation Mot de Passe", newpwd, newpwd, email)
        })
      }
    })
  }

  let go = (subj, msgtext, msghtml, towho) => {
    nodemailer.createTestAccount((err, account) => {
    if (err) {
      console.error('Failed to create a testing account. ' + err.message);
      return process.exit(1);
    }

    // console.log('Credentials obtained, sending message...');

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        port: 1050,
        ignoreTLS : true
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Victor Foo 👻" <foo@example.com>', // sender address
        to: towho, // list of receivers
        subject: subj, // Subject line
        text: msgtext, // plain text body
        html: msghtml // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          // console.log('Error occurred. ' + err.message);
          return process.exit(1);
        }
        // console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        req.flashAdd('tabSuccess', 'Felicitatiions, votre nouveau mot de passe vient de vous etre envoye!')
        res.redirect('/')

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
  });
  }
  check()
}

module.exports = forgot_pwd

let generatePassword = () => {
  var length = 12,
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}