angular.module('nestor.vote', [])

.controller('voteCtrl', function ($scope, $state, $rootScope, $stateParams, $ionicPopup, $localStorage) {
  
  $scope.thermoId = $stateParams.thermostatId;

  $rootScope.socket.on('thermoUpdate', function(){
    console.log('UPDATING');
    $scope.$apply();
  });

  $scope.data = {};

  $scope.vote = function(){
    var alertStr;
    if ($localStorage.userData.format === "C") {
      alertStr = 'Make sure the temperature is between ' + convert(60) + ' to ' + convert(90) + ' degrees';
    } else {
      alertStr = 'Make sure the temperature is between ' + 60 + ' to ' + 90 + ' degrees';
    }

    var myPopup = $ionicPopup.show({
      template: '<input type="number" ng-model="data.userTemp">',
      title: 'Enter a temperature',
      subTitle: alertStr,
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Vote!</b>',
          type: 'button-positive',
          onTap: function(e) {
            return $scope.data.userTemp;
          }
        }
      ]
    });

    myPopup.then(function(res){
      if (res === undefined) {
        return;
      }

      if (validTemp(res)) {   

        if ($localStorage.userData.format === "C") {
          res = convert(res, true);
        }  

        $rootScope.socket.emit('vote', {
          hash: $localStorage.userData.roomId, 
          thermoId: $stateParams.thermostatId, 
          username: $localStorage.userData.username || 'Anonymous',
          temp: res
        });
      } else {
        showAlert('Whoa', '<center>Something was wrong with what you typed.</center>');
      }
    })

  }

  function showAlert(title, template){
    var alertPopup = $ionicPopup.alert({
      title: title,
      template: template
    });

    alertPopup.then(function(res) {
    });
  }
  

  function convert(temp, isF) {
    var conv;
    if (!isF) {
      conv = (temp - 32) * 5 / 9;
    } else {
      conv = temp * 9 / 5 + 32
    }

    return Math.round(conv);
  }

  function validTemp(res) {
    if ($localStorage.userData.format === "C") {    
      if (res >= convert(60) && res <= convert(90)) {
        return true;
      } else {
        return false;
      }
    } else {
      if (res >= 60 && res <= 90) {
        return true;
      } else {
        return false;
      }
    }
  }

});