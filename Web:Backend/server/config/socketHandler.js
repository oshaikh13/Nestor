// TODO: Transfer all this memory shit to redis.
// Learn how to make this scale. ASAP.
var structures = {};
var socketList = {};
var nestHelp = require('./nestHelp.js');
var user = require('../users/userModel.js')
//creates a new client

module.exports = function (io, client) {

  // Redis testing :)
  // client.get('structures', function(reply){
  //   console.log(reply, "REDIS");
  // });

  io.on('connection', function(socket){

    console.log(socket.id + " connected!");

    socket.on('startApp', function(data){

      // Personalize each users socket on their connection
      socketList[socket.id] = {};
      socketList[socket.id].name = data.name || 'Anonymous';
      socketList[socket.id].urlHash = data.hash;

      console.log(data);

      // Get the creators nest username and password.
      user.findOne({url: data.hash}, function(err, res){
        // Create a structure instance if it doesnt already exist... 
        if (err || !res) {
          console.log(err);
        } else {
          if (!structures[data.hash]) {
            console.log('NO PRIOR STRUCTURE... CREATING ONE');
            structures[data.hash] = nestHelp(res.nestUsername, res.nestPassword, io, socketList);
          }
          
          structures[data.hash].connectedUsers[socket.id] = socketList[socket.id].name;
          // ..and use it.
          io.to(socket.id).emit('firstThermo', structures[data.hash].thermostats);
        }
      });

    });


    socket.on('vote', function(data){
      console.log(data);
      if (data.hash && structures[data.hash]) {
        structures[data.hash].vote(data.username, data.temp, data.thermoId);
      }
    })

    socket.on('disconnect', function(){
      // Delete all traces of the user...
      if (socketList[socket.id]) {
        console.log('DELETING ALL TRACES...')
        if (structures[socketList[socket.id]]) {
          delete structures[socketList[socket.id].urlHash].connectedUsers[socket.id];
        }
        delete socketList[socket.id];
      }
      // Wow. That felt good.
    })

  });
}