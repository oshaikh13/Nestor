// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('nestor', 
  ['ionic',
   'nestor.login',
   'nestor.menu',
   'nestor.home',
   'nestor.services',
   'nestor.vote',
   'ngCordova',
   'ngStorage'
   ])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'menu/menu.html',
    controller: 'menuCtrl'
  })

  .state('login', {
    url: '/login',
    templateUrl: 'login/login.html',
    controller: 'loginCtrl'
  })

  .state('app.vote', {
    url: '/vote/:thermostatId',
    views :{
      'menuContent' : {
        templateUrl: 'vote/vote.html',
        controller: 'voteCtrl'
      }
    }
  })

  .state('app.home', {
    url: '/home',
    views :{
      'menuContent' : {
        templateUrl: 'home/home.html'
      }
    }
  })

})

.run(function($ionicPlatform, $localStorage, $state, $rootScope, $http, $ionicLoading, $cordovaNetwork) {
  $rootScope.uri = "http://nestorthermo.herokuapp.com"
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    $rootScope.socket = io($rootScope.uri);
    document.addEventListener("deviceready", onDeviceReady, false);

    function checkConnection(){
      if (!$cordovaNetwork.isOnline()) {
        $ionicLoading.show({
          template: 'No Internet Connection'
        });
      } else {
        $ionicLoading.hide({

        });
      }
    }

    checkConnection();

    function startEmit(){
      if ($localStorage.userData && $localStorage.userData.roomId) {
        $rootScope.socket.emit('startApp', {hash: $localStorage.userData.roomId});
      }
    }

    function onDeviceReady(){
      document.addEventListener("resume", function (event) {
        checkConnection();
        if ($localStorage.userData && $localStorage.userData.roomId) {
          startEmit();
        }
      });
    }

    startEmit();

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    if ($localStorage.userData) {
      $state.go('app.home');
    } else {
      $state.go('login');
    }
  });
});
