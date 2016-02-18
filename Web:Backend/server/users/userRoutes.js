var userController = require('./userController.js'),
             helpers = require('../config/helpers.js');



module.exports = function (app) {
  // app === userRouter injected from middlware.js

  app.post('/signin', userController.signin);
  app.post('/signup', userController.signup);
  app.get('/signedin', userController.checkAuth);
  app.get('/hash', helpers.decode, userController.hash);
  app.get('/validhash', userController.validHash);
};
