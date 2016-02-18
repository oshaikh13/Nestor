angular.module('nestor.login', [])

.controller('loginCtrl', function($scope, $rootScope, $cordovaBarcodeScanner, $ionicPopup, $state, $localStorage, $http) {

  $scope.scanCode = function(){
    $cordovaBarcodeScanner
      .scan()
      .then(function(barcodeData) {
        if (barcodeData.format === "QR_CODE" && !barcodeData.cancelled) {
          console.log(barcodeData, 'READ DATA');
          $http.get($rootScope.uri + "/api/users/validhash?url=" + barcodeData.text)
            .then(
              function(){
                $localStorage.userData = {}
                $localStorage.userData.roomId = barcodeData.text;
                var PromptPopup = $ionicPopup.show({
                  title: 'Select a temperature format',
                  scope: $scope,
                  buttons: [
                    { 
                      text: 'Farenheight',
                      type: 'button-positive',
                      onTap: function(e) {
                        $localStorage.userData.format = 'F';
                        $rootScope.socket.emit('startApp', {hash: barcodeData.text});
                        $state.go('app.home')
                      }          

                    },

                    {
                      text: 'Celciuis',
                      type: 'button-positive',
                      onTap: function(e) {
                        $localStorage.userData.format = 'C';
                        $rootScope.socket.emit('startApp', {hash: barcodeData.text});
                        $state.go('app.home')
                      }
                    }
                  ]
                });
              },

              function(){
                showAlert('Invalid QR Code', '<center>Try Again</center>');
              }
            );
        } else {
          console.log('User Error')
          showAlert('Something went wrong');
        }

      }, function(error) {
        console.log(error);
        showAlert('Something went wrong');
      });
  }

  var showAlert = function(title, template){
    var alertPopup = $ionicPopup.alert({
      title: title,
      template: template
    });

    alertPopup.then(function(res) {
    });
  }

})
