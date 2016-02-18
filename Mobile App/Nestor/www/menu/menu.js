angular.module('nestor.menu', [])

.controller('menuCtrl', function ($localStorage, $state, $scope, $rootScope, $ionicLoading) {
  $ionicLoading.show({
    template: 'Syncing Thermostats...'
  });

  $scope.logout = function(){
    $localStorage.userData = undefined;
    $rootScope.socket.emit('disconnect');
    $rootScope.thermostats = {};
    $state.go('login');
  }


  $rootScope.socket.on('firstThermo', function(data){
    if ($localStorage.userData.format === "C") {
      console.log('Converting to CELCIUS --- FIRST RUN');
      data = convertToC(data);
    }

    $rootScope.thermostats = data;
    $ionicLoading.hide();
  })

  $rootScope.socket.on('thermoUpdate', function(data){
    console.log(data, "UPDATE");
    if ($localStorage.userData.format === "C") {
      console.log('Converting to CELCIUS');
      data = convertToC(data);
    }
    $rootScope.thermostats = data;
  });

  function convert(faren) {
    C = (faren - 32) * 5 / 9;
    return Math.round(C);
  }

  function convertToC(obj) {
    console.log(obj);
    for (var thermo in obj) {

      for (var key in obj[thermo]) {
        if (key === 'votes') {
          for (var i = 0; i < obj[thermo][key].length; i++) {
            obj[thermo][key][i].temp = convert(obj[thermo][key][i].temp);
          }
        }

        if (key === 'currentTemp' || key === 'regTemp' || key === 'targetTemp') {
          obj[thermo][key] = convert(obj[thermo][key]);
        }
      }
    }

    return obj;
  }

});

