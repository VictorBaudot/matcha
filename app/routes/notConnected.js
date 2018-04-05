exports.forgot_pwd = (req, res) => {
  res.render("NotConnected/forgot_pwd.ejs")
}

exports.signin = ({ body, session }, res) => {

  if (body.remember) {
      session.cookie.maxAge = 1000 * 60 * 3;
  } else {
      session.cookie.expires = false;
  }
  res.json({ loggedin: true });
  res.redirect('/');
};