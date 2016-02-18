angular.module('nestor.services', [])

.factory('NestSettings', function ($http, $rootScope) {
  // Your code here

  var getHash = function () {
    return $http({
      method: 'GET',
      url:  $rootScope.uri + '/api/users/hash'
    })
    .then(function (resp) {
      return resp.data;
    });
  };

  return {
    getHash: getHash
  };
})