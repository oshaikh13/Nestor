////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
//
//  This file, no kidding, is the heart of the application
//  It creates a so called structure, filled with thermostats
//  in the building. Pass it a nest username and password
//  and it does the rest. Sweet
//
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////


var nest = require('unofficial-nest-api');
// Credits to this guy, whoever he is :)

module.exports = function(username, password, io){

  // Class creation
  var structure = {};
  structure.username = username;
  structure.password = password;
  structure.thermostats = {};
  structure.connectedUsers = {};

  // Hit the thermostat. (In case someone manually changed it...)
  structure.updateThermostatData = function(min){
    var that = this;
    setInterval(function(){
      that.checkArgs(true);
    }, min * 60 * 1000);
  },

  // Emit the stats to every connected user
  structure.updateConnectedUsers = function(){
    for (var key in this.connectedUsers) {
      io.to(key).emit('thermoUpdate', structure.thermostats);
    }
  }

  // Check all the votes for every thermostat
  structure.checkVotes = function(){
    for (var deviceId in thermostats) {
      this.checkSubVotes(deviceId);
    }
  }

  // Check votes for a single thermostat
  // Analyze ballots and set a temperature if needed.
  structure.checkSubVotes = function(deviceId){
    var thermostat = this.thermostats[deviceId];

    // Create the hash table
    var bestResult = {

    };

    // Iterate over all the votes
    for (var i = 0; i < thermostat.votes.length; i++) {

      bestResult = {};

      var temp = thermostat.votes[i].temp;
      var range = thermostat.range;

  ////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////

  // EX temp = 73
      //upper = 75
      //lower = 70 

      var upper = temp  + range - temp % range;

      var lower = temp  - temp % range;

      var lookupKey = upper + "" + lower;

  ////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////

  // uses a hash table to store the temps that are in a range. eg (75 - 80)
  // 

      for (var j = 0; j < thermostat.votes.length; j++) {

        if (thermostat.votes[j].temp <= upper && thermostat.votes[j].temp >= lower) {
          if (!bestResult[lookupKey]){
            bestResult[lookupKey] = [];
          }
          bestResult[lookupKey].push(thermostat.votes[j].temp);
        }

      }

    }
  ////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////

    // Gets the most sensible range... Longest one

    optimumRange = [];
    for (var tempRange in bestResult) {
      if (bestResult[tempRange].length > optimumRange.length){
        optimumRange = bestResult[tempRange];
      }
    }

    // Must be > than 5. or vote change

    if (optimumRange.length < thermostat.voteChange) {
      console.log('returning');
      this.updateConnectedUsers();
      return;
    }

    // Calc and set avg.

    var average = 0;
    for (var i = 0; i < optimumRange.length; i++) {
      average += optimumRange[i];
    }

    thermostat.votes = [];

    average /= optimumRange.length;

    thermostat.lastResets.push(average);

    var mode = this.getMode(average, thermostat.targetTemp);

    thermostat.targetTemp = average;

    nest.setTemperature(deviceId, nest.ftoc(average));
    nest.setTargetTemperatureType(deviceId, mode);
    this.updateConnectedUsers();
    
  },

  structure.getMode = function(average, currentTemp){
    return average > currentTemp ? "heat" : "cool";
  }

  // Fetches # of thermostats, etc. Must be run on start.
  structure.subscribe = function() {
    nest.subscribe(this.subscribeDone, ['shared', 'energy_latest']);
  },

  // Run in tangent with subscribe. Same rules apply
  structure.subscribeDone = function(deviceId, data, type) {
    setTimeout(this.subscribe, 2000);
  },

  structure.vote = function(username, temp, thermostatId){
    this.thermostats[thermostatId].votes.push({username: username, temp: temp})
    this.checkSubVotes(thermostatId);
  },

  // Checks args and sets up base system.
  structure.checkArgs =  function(update, cb){

    var that = this;

    nest.login(this.username, this.password, function (err, data) {
      if (err) {
          console.log(err.message);
          return;
      }

      nest.fetchStatus(function (data) {
        for (var deviceId in data.device) {

          if (data.device.hasOwnProperty(deviceId)) {
            var device = data.shared[deviceId];
            // here's the device and ID
            if (!update) { 
              that.thermostats[deviceId] = {}
              that.thermostats[deviceId].votes = [];
              that.thermostats[deviceId].range = 5;
              that.thermostats[deviceId].voteChange = 5;
              that.thermostats[deviceId].lastResets = [];
              that.thermostats[deviceId].regTemp = 75;
              nest.setFanModeAuto(deviceId);
            }

            that.thermostats[deviceId].targetTemp = nest.ctof(device.target_temperature);
            that.thermostats[deviceId].currentTemp = nest.ctof(device.current_temperature);
            that.updateConnectedUsers();

            if (cb) {
              cb();
            }
          }
        }

        // subscribe each thermostat.
        if (!update) {
          that.subscribe();
        }
      });

    });

  }

  // Resets the temp, every x mins.
  structure.resetTemp = function(minutesOnReset, deviceId){
    var that = this;
    setInterval(function(){
      that.thermostats[deviceId].votes = [];

      if (!deviceId) {
        for (var deviceId in that.thermostats) {
          nest.setTemperature(deviceId, nest.ftoc(that.thermostats[deviceId].regTemp));
        }
      } else {
        nest.setTemperature(deviceId, nest.ftoc(that.thermostats[deviceId].regTemp));
      } 
      that.updateConnectedUsers();

    }, minutesOnReset * 60 * 1000)
  },


  structure.checkArgs(false, function(){   
    structure.updateThermostatData(1); 
    // Every one minute... In case there is some sort of problem...
    // structure.resetTemp(30);  Maybe Later
  });

  return structure;
}


