angular.module('shortly.links', [])

.controller('LinksController', function ($scope, NestSettings, Auth) {
  // Your code here

  $scope.data = {};
  $scope.getdata = function () {
    NestSettings.getHash()
      .then(function (userHash) {
        $scope.data.hash = userHash;
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.logout = function(){
    Auth.signout();
  }

  $scope.getdata();

});
