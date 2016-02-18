var User = require('./userModel.js'),
    Q    = require('q'),
    jwt  = require('jwt-simple'),
    crypto = require('crypto');
module.exports = {
  signin: function (req, res, next) {
    var username = req.body.username,
        password = req.body.password;

    var findUser = Q.nbind(User.findOne, User);
    findUser({username: username})
      .then(function (user) {
        if (!user) {
          next(new Error('User does not exist'));
        } else {
          return user.comparePasswords(password)
            .then(function(foundUser) {
              if (foundUser) {
                var token = jwt.encode(user, 'secret');
                res.json({token: token});
              } else {
                return next(new Error('No user'));
              }
            });
        }
      })
      .fail(function (error) {
        next(error);
      });
  },

  signup: function (req, res, next) {
    var username  = req.body.username,
        password  = req.body.password,
        nestUsername = req.body.nestUsername,
        nestPassword = req.body.nestPassword,
        create,
        newUser;

    console.log(nestUsername)
    console.log(nestPassword)

    var findOne = Q.nbind(User.findOne, User);

    // check to see if user already exists
    findOne({username: username})
      .then(function(user) {
        if (user) {
          next(new Error('User already exist!'));
        } else {
          var shasum = crypto.createHash('sha1');
          shasum.update(username);
          var qrHash = shasum.digest('hex').slice(0, 5);
          // make a new user if not one
          create = Q.nbind(User.create, User);
          newUser = {
            username: username,
            password: password,
            nestUsername: nestUsername,
            nestPassword: nestPassword,
            url: qrHash
          };
          return create(newUser);
        }
      })
      .then(function (user) {
        var token = jwt.encode(user, 'secret');
        res.json({token: token});
      })
      .fail(function (error) {
        next(error);
      });
  },

  checkAuth: function (req, res, next) {
    // checking to see if the user is authenticated
    // grab the token in the header is any
    // then decode the token, which we end up being the user object
    // check to see if that user exists in the database
    var token = req.headers['x-access-token'];
    if (!token) {
      next(new Error('No token'));
    } else {
      var user = jwt.decode(token, 'secret');
      var findUser = Q.nbind(User.findOne, User);
      findUser({username: user.username})
        .then(function (foundUser) {
          if (foundUser) {
            res.send(200);
          } else {
            res.send(401);
          }
        })
        .fail(function (error) {
          next(error);
        });
    }
  },


  hash: function(req, res) {

    var findUser = Q.nbind(User.findOne, User);
    findUser({username: req.user.username})
      .then(function (foundUser) {
        if (foundUser) {
          res.send(foundUser.url);
        } else {
          res.send(401);
        }
      });
  },

  validHash: function(req, res) {
    var findUser = Q.nbind(User.findOne, User);
    findUser({url: req.query.url})
      .then(function(foundUser) {
        if (foundUser) {
          res.send(200);
        } else {
          res.send(400);
        }
      })
  }
  
};












