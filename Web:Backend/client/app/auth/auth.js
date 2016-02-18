// do not tamper with this code in here, study it, but do not touch
// this Auth controller is responsible for our client side authentication
// in our signup/signin forms using the injected Auth service
angular.module('shortly.auth', [])

.controller('AuthController', function ($scope, $window, $location, Auth) {
  $scope.user = {};

  $scope.signin = function () {
    console.log($scope.user);
    Auth.signin($scope.user)
      .then(function (token) {
        $window.localStorage.setItem('com.votestat', token);
        $location.path('/links');
      })
      .catch(function (error) {
        alert("Somethings wrong with your credentials");
      });
  };

  $scope.signup = function () {
    Auth.signup($scope.user)
      .then(function (token) {
        $window.localStorage.setItem('com.votestat', token);
        $location.path('/links');
      })
      .catch(function (error) {
        alert("Somethings wrong with your credentials");
      });
  };
});
