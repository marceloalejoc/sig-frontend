'use strict';

/**
 * @ngdoc overview
 * @name localizaFrontendApp
 * @description
 * # modulo localizaFrontendApp
 *
 * Main module of the application.
 */

angular
  .module('localizaFrontendApp', ['config','ngRoute', 'ngCookies','leaflet-directive'])
  .config(function($routeProvider, $httpProvider){

    $httpProvider.defaults.useXDomain = true;
    $httpProvider.interceptors.push('authInterceptor');
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $routeProvider
      .when('/login/',{
        templateUrl: 'views/login.html'
      })
      .when('/home/', {
        templateUrl: 'views/principal.html'
      })
      .when('/contacto/:usuario/info', {
        templateUrl: 'views/principal.html'
      })
      .when('/usuarios/:usuario/info', {
        templateUrl: 'views/usuario.html'
      })
      .otherwise({
        redirectTo: '/login/'
      });
  });
