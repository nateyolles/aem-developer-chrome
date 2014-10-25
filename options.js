var app = angular.module('OptionsApp', ['ngStorage']);

app.controller('OptionsController', function($scope, $localStorage){

  $scope.options = $localStorage.$default({
    servers: [
      {name: 'Local Author', url: 'http://localhost:4502/'},
      {name: 'Local Publish', url: 'http://localhost:4503/'}
    ]
  });

  $scope.remove = function(index) {
    $scope.options.servers.splice(index, 1);
  };

  $scope.add = function() {
    $scope.options.servers.push({name: $scope.newServer.name, url: $scope.newServer.url});
    $scope.newServer.name = '';
    $scope.newServer.url = '';
  };
});


function saveOption(key, value) {
  localStorage[key] = value;
  return value;
}

function clearOption(key) {
  localStorage.removeItem[key];
  return null;
}

function getOption(key, defaultValue) {
  var value = localStorage[key];

  if (typeof value === 'undefined' || !value) {
    if (value) {
      value = defaultValue;
    } else {
      value = null;
    }
  }

  return value;
}