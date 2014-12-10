'use strict';

var User = require('../models/user');

module.exports = function(app, passport) {
  app.get('/api/users', passport.authenticate('basic', {session: false}), function(req, res) {
    res.json({jwt: req.user.generateToken(app.get('jwtSecret'))});
  });

  app.post('/api/users', function(req, res) {
    console.log(req.body);
    var email = new Buffer(req.body.email, 'base64').toString('ascii');
    var password = new Buffer(req.body.password, 'base64').toString('ascii');
    var passwordConfirmation = new Buffer(req.body.passwordConfirmation, 'base64').toString('ascii');
    console.log(email, password, passwordConfirmation);
    User.findOne({email: email}, function(err, user) {
      var regEx = /[\w]{5,}/;
      if (err) return res.status(500).send('server error');

      if (user) return res.status(500).send('cannot create that user');

      if (!regEx.test(req.body.password) || !req.body.password) return res.status(500).send('invalid password');

      if (password !== passwordConfirmation) return res.status(500).send('password does not match confirmation');

      if (req.body.admin) console.log('user is admin');

      var newUser = new User();

      newUser.basic.email = email;
      newUser.basic.password = newUser.generateHash(password);
      newUser.basic.admin = req.body.admin;
      newUser.save(function(err) {

        if (err) return res.status(500).send('server error');
        res.json({jwt: newUser.generateToken(app.get('jwtSecret'))});
      });
    });
  });
};
