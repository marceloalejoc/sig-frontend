'use strict';

/**
 * @ngdoc function
 * @name localizaFrontendApp.controller:controladorPrincipal
 * @description
 * # controladorPrincipal
 * Controller of the localizaFrontendApp
 */
angular.module('localizaFrontendApp')
  //.controller('controladorPrincipal', function ($scope, $http, $q, $routeParams, $location, ENV, Dpa, BreadcrumbFactory) {
  .controller('controladorPrincipal', function ($scope, $http, $q, $routeParams, $location, $cookies, ENV) {

    var postUbicacionUrl = ENV.localizaApi + ENV.localizaApiVersion + '/ubicacion';
    var postMensajeUrl = ENV.localizaApi + ENV.localizaApiVersion + '/mensaje';
    var postUsuarioUrl = ENV.localizaApi + ENV.localizaApiVersion + '/users';

    $scope.dato = {
      usuarios: null,
      mensajes: null,
    }
    $scope.ruta = {
      id: null
    }
    $scope.session = {
      idusuario: null,
      usuario: null,
      email: null,
      latlng: null,
      img: null
    }
    $scope.api = {
      get:null,
      post:null,
      put:null
    };

    $scope.ajustes = {
      ubicacion: false,
      seguir: null
    }

    // Se ejecuta cuando hay cambios en la URL
    $scope.$on('$routeChangeSuccess', function() {
      if ($cookies.getObject('session')) {
        $scope.session = $cookies.getObject('session');
        if ($scope.session.id) {
          $scope.ajustes.ubicacion = true;
        }
        if ($location.path()=='/login/') {
          $location.path('/home/')
        }
        if ($routeParams.usuario) {
          cargarUsuarioInfo($routeParams.usuario);
        } else {
          ;//cargarUsuarios();
        }
      }
      if (!$scope.session.id) {
        $location.path('/login/');
      }
      console.log('ABC:',$location.path());
    });

    $scope.api.logout = function() {
      $cookies.remove('session');
      $scope.session = {};
    }

    $scope.getVersion = function() {
      return ENV.version;
    };

    $scope.setUsuario = function(user) {
      $scope.ruta.id = user;
      $location.path('/usuarios/'+user+'/info');
    };

    var cargarUsuarioInfo = function(user) {
      var promises = [];
      promises.push($http.get(usuariosUrl+'/'+user+'/info' ));

      $q.all(promises).then(function(response) {
        $scope.dato.usuarios = response[0].data;
      }, function(error) {
        console.warn('Error al conectarse con la API: ',usuariosUrl);
      });
    };

    var cargarUsuarios = function() {
      var promises = [];
      if($scope.session.usuario) {
        promises.push($http.get(postUsuarioUrl, {a:1} ));
        promises.push($http.get(postMensajeUrl+'/'+$scope.session.usuario+'/', {} ));

        $q.all(promises).then(function(response) {
          $scope.dato.usuarios = response[0].data;
          $scope.dato.mensajes = response[1].data;
          console.log('Usuario:',$scope.dato.usuarios);
        }, function(error) {
          console.warn('Error al conectarse con la API: ',postUsuarioUrl);
        });
      }
    };


    //***********************************
    // funciones globales
    $scope.api.postUbicacion = function(latlong) {
      var config = {
                headers : {
                    'Content-Type': 'application/json;charset=utf-8' //'application/x-www-form-urlencoded;charset=utf-8'
                }
            };
      var datos = {
        'usuario': $scope.session.usuario,
        'latlng': latlong,
        'iddisp': $scope.session.id,
      }
      var promises = [];
      promises.push($http.post(postUbicacionUrl+'/'+$scope.session.usuario+'/', datos, config ));

      $q.all(promises).then(function(response) {
        console.log(1);
      }, function(error) {
        console.warn('Error al enviar ubicacion ');
      });
    }

    $scope.api.postMsg = function(latlong, msg) {
      var config = {
                headers : {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            }
      var promises = [];
      var datos = {
        'id1': $scope.session.id_usuario,
        'user1': $scope.session.usuario,
        'latlng': latlong,
        'iddisp': $scope.session.id,
        'texto': msg
      }
      if($scope.ajustes.seguir) {
        datos.id2 = $scope.ajustes.seguir.user.id_usuario;
        datos.user2 = $scope.ajustes.seguir.user.usuario;
      }
      promises.push($http.post(postMensajeUrl+'/'+$scope.session.usuario+'/', datos, config ));

      $q.all(promises).then(function(response) {
        console.log(1);
      }, function(error) {
        console.warn('Error al enviar ubicacion ');
      });
    }


    $scope.api.getUsuario = function(datos) {
      var config = {
                headers : {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            }
      var promises = [];
      promises.push( $http.post(postUsuarioUrl+'/login/'+datos.usuario+'/', datos, config) );
      $q.all(promises).then(function(response) {
        if(response[0].data.id_usuario) {
          $scope.session = response[0].data;
          $cookies.putObject('session',$scope.session);
          $location.path('/home/');
        } else {
          Materialize.toast('Error usuario o contraseña',2000);
        }
      }, function(error) {
        console.warn('Error al enviar ubicacion ');
      });
    }


    $scope.api.postUsuario = function(datos) {
      var config = {
                headers : {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            }
      var promises = [];
      promises.push( $http.post(postUsuarioUrl+'/register/'+datos.usuario+'/', datos, config) );
      $q.all(promises).then(function(response) {
        if(response[0].data.usuario) {
          if(response[0].data.status==200)
            Materialize.toast('Sus datos fueron registrados',2000);
            $('#modalReg').closeModal();
        } else {
          if(response[0].data.status==304)
            Materialize.toast('El usuario ya existe',2000);
        }
      }, function(error) {
        console.warn('Error al enviar ubicacion ');
      });
    }

    $scope.api.getUsuarios = function(usuario) {
      var config = {
                headers : {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            }
      var promises = [];
      var mensajes = document.getElementById('mensajes');
      var datos = {
        id: $scope.session.id_usuario,
        usuario: $scope.session.usuario,
        iddisp: $scope.session.id,
        seguir: $scope.ajustes.seguir
      }
      if($scope.session.usuario && mensajes) {
        promises.push($http.get(postUsuarioUrl, { 'usuario': 1 } ));

        $q.all(promises).then(function(response) {
          $scope.dato.usuarios = response[0].data;
          for (var id in $scope.dato.usuarios) {
            if ( $scope.dato.usuarios[id].lat && $scope.dato.usuarios[id].lng ) {
              //console.log('Usuario:',$scope.dato.usuarios[id]);
              var usuario = $scope.api.userMarker($scope.dato.usuarios[id].usuario, $scope.dato.usuarios[id].id_dispositivo);
              usuario.lat = $scope.dato.usuarios[id].lat;
              usuario.lng = $scope.dato.usuarios[id].lng;
              if($scope.dato.usuarios[id].img)
                usuario.icon.iconUrl = $scope.dato.usuarios[id].img;
            }
          }
        }, function(error) {
          console.warn('Error al conectarse con la API: ',postUsuarioUrl);
        });
      }
    }

    $scope.api.getMensajes = function(usuario) {
      var config = {
                headers : {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            }
      var promises = [];
      var mensajes = document.getElementById('mensajes');
      var datos = {
        id: $scope.session.id_usuario,
        usuario: $scope.session.usuario,
        iddisp: $scope.session.id,
        seguir: $scope.ajustes.seguir
      }
      if($scope.session.usuario && mensajes) {
        promises.push($http.post(postMensajeUrl+'/', datos, config ));

        $q.all(promises).then(function(response) {
          $scope.dato.mensajes = response[0].data;
          mensajes.innerHTML = "";
          for (var id in $scope.dato.mensajes) {
            var fecha = $scope.dato.mensajes[id].fecha.substring(0,10);
            fecha += " "+$scope.dato.mensajes[id].hora.substring(0,8);
            $scope.dato.mostrarMensajes($scope.dato.mensajes[id].usuario1, $scope.dato.mensajes[id].mensaje, fecha);
          }
        }, function(error) {
          console.warn('Error al conectarse con la API: ',postUsuarioUrl);
        });
      }
    }

    $scope.api.infoUsuario = function(user) {
      if($scope.dato.infoUsuario && user.usuario == $scope.dato.infoUsuario.usuario) {
        $('#modalUsuario').openModal();
        return;
      }
      console.log(user);
      var config = {
                headers : {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            }
      var datos = {
        id: $scope.session.id_usuario,
        usuario: $scope.session.usuario,
        iddisp: $scope.session.id,
        user: user
      };
      var promises = [];
      promises.push( $http.post(postUsuarioUrl+'/'+user.usuario+'/info', datos, config) );
      $q.all(promises).then(function(response) {
        if(response[0].data.status==200) {
          if(response[0].data.usuario) {
            $scope.dato.infoUsuario = response[0].data;
            console.log('RESP:',$scope.dato.infoUsuario);
            $('#modalUsuario').openModal();
          }
        }
      }, function(error) {
        console.warn('Error info usuario');
      });
    }


  });


/*
  var config1 = {
            headers : {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        }
*/

angular.module('localizaFrontendApp')
  .controller('controladorLogin', function ($scope) {
    if(!$scope.session.id) {
      $( document ).ready(function(){
        // Initialize collapse button
        $(".button-collapse").sideNav({closeOnClick:true});
        $('.modal-trigger').leanModal();
        $('#modalLeame').openModal();
      });
    }
  });
