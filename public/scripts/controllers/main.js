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
  .controller('controladorPrincipal', function ($scope, $http, $q, $routeParams, $location, $cookies, ENV, Datos) {

    var postUbicacionUrl = ENV.localizaApi + ENV.localizaApiVersion + '/ubicacion';
    var postMensajeUrl = ENV.localizaApi + ENV.localizaApiVersion + '/mensaje';
    var postUsuarioUrl = ENV.localizaApi + ENV.localizaApiVersion + '/users';
    var postPedidoUrl = ENV.localizaApi + ENV.localizaApiVersion + '/pedidos';
    var postProductoUrl = ENV.localizaApi + ENV.localizaApiVersion + '/products';

    Datos.session.ubicado = false;
    $scope.dato = {
      usuarios: null,
      usFecha: '2016-01-01',
      usHora: '00:00:00',
      mensajes: null,
      msFecha: '2016-01-01',
      msHora: '00:00:00'
    }
    $scope.ruta = {
      id: null
    }
    $scope.session = {
      idusuario: null,
      usuario: null,
      email: null,
      latlng: null,
      ubicado: false,
      img: null
    }
    $scope.api = {
      get:null,
      post:null,
      put:null
    };

    $scope.ajustes = {
      seguir: null,
      ubicacion: false
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
      $scope.markers = {};
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
      datos.latlng = $scope.session.latlng;
      promises.push( $http.post(postUsuarioUrl+'/login/'+datos.usuario+'/', datos, config) );
      $q.all(promises).then(function(response) {
        if(response[0].data.id_usuario) {
          $scope.session = response[0].data;
          $cookies.putObject('session',$scope.session);
          $location.path('/home/');
        } else {
          Materialize.toast('Error usuario o contraseña',2000);
        }
        if(response[0].data.info){
          Materialize.toast(response[0].data.info,2000);
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
        fecha: $scope.dato.msFecha,
        hora: $scope.dato.msHora,
        id: $scope.session.id_usuario,
        usuario: $scope.session.usuario,
        iddisp: $scope.session.id,
        seguir: $scope.ajustes.seguir
      }
      if($scope.session.usuario && mensajes) {
        promises.push($http.post(postMensajeUrl+'/', datos, config ));

        $q.all(promises).then(function(response) {
          $scope.dato.mensajes = response[0].data;
          //mensajes.innerHTML = "";
          for (var id in $scope.dato.mensajes) {
            var fecha = $scope.dato.mensajes[id].fecha.substring(0,10);
            var hora = $scope.dato.mensajes[id].hora.substring(0,8);
            if ($scope.dato.msFecha+" "+$scope.dato.msHora < fecha+" "+hora) {
              $scope.dato.msFecha = fecha;
              $scope.dato.msHora = hora;
            }

            while($scope.dato.mensajes[id].mensaje.indexOf('\n')>=0) {
              $scope.dato.mensajes[id].mensaje = $scope.dato.mensajes[id].mensaje.replace('\n','<br>');
            }
            $scope.dato.mostrarMensajes($scope.dato.mensajes[id].usuario1, $scope.dato.mensajes[id].mensaje, fecha+" "+hora);

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





    $scope.api.openProductos = function() {
      $('#modalProductos').openModal();
      var config = {
                headers : {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            }
      var datos = {
        id: $scope.session.id_usuario,
        usuario: $scope.session.usuario,
        iddisp: $scope.session.id,
      };
      var promises = [];
      promises.push( $http.get(postProductoUrl+'/'+$scope.session.usuario+'/'+$scope.session.id_usuario, datos, config) );
      $q.all(promises).then(function(response) {
        if(response[0].data[0]) {
          $scope.dato.productos = response[0].data;
        }
        console.log('RESP:',response[0]);
      }, function(error) {
        console.warn('Error info producto');
      });
    }

    $scope.api.productoAdd = function() {
      $('#modalProducto').openModal();
    }

    $scope.api.postProducto = function(form) {
      form = document.getElementById(form);
      if(form && form.codigo.value && form.nombre.value) {
        var config = {
                  headers : {
                      'Content-Type': 'application/json;charset=utf-8'
                  }
              }
        var datos = {
          id_usuario: $scope.session.id_usuario,
          codigo: form.codigo.value,
          nombre: form.nombre.value,
          detalle: form.detalle.value,
          precio: form.precio.value,
          cant: form.cantidad.value
        };
        var promises = [];
        if(form.id_prod.value) {
          datos.i = form.divindex.value;
          datos.id_prod = form.id_prod.value;
          promises.push( $http.put(postProductoUrl+'/'+$scope.session.usuario+'/'+form.id_prod.value, datos, config) );
        } else {
          promises.push( $http.post(postProductoUrl+'/'+$scope.session.usuario+'/', datos, config) );
        }
        $q.all(promises).then(function(response) {
          console.log('RESP:',response[0]);
          if(form.id_prod.value && response[0].data.i) {
            var prod = $scope.dato.productos[response[0].data.i];
            prod.codigo = form.codigo.value;
            prod.nombre = form.nombre.value;
            prod.detalle = form.detalle.value;
            prod.precio = form.precio.value;
            prod.cant = form.cantidad.value;
          } else {
            var prod = {
              id_producto: response[0].data.id_producto,
              codigo: form.codigo.value,
              nombre: form.nombre.value,
              detalle: form.detalle.value,
              precio: form.precio.value,
              cant: form.cantidad.value,
              fecha: response[0].data.fecha,
              hora: response[0].data.hora
            }
            $scope.dato.productos = [prod].concat($scope.dato.productos);
            console.log('NUEVO:',prod, [prod].concat($scope.dato.productos));
          }
          $(form).find('input').val('');
          $(form).find('textarea').val('');
          $('#modalProducto').closeModal();
        }, function(error) {
          console.warn('Error info producto');
        });
      } else {
        Materialize.toast('Complete',2000);
      }
    }

    $scope.api.productoEdit = function(index,prod,form) {
      $('#modalProducto').openModal();
      $('#modalProducto .title').html('Modificar producto');
      var form = document.getElementById(form);
      if(form) {
        form.divindex.value = index;
        form.id_prod.value = prod.id_producto;
        form.codigo.value = prod.codigo;
        form.nombre.value = prod.nombre;
        form.detalle.value = prod.detalle;
        form.precio.value = prod.precio;
        form.cantidad.value = prod.cantidad;
      }
    }

    $scope.api.productoDelete = function(index, prod) {
      if(confirm('Esta seguro de eliminar el producto')) {
        var config = {
                  headers : {
                      'Content-Type': 'application/json;charset=utf-8'
                  }
              }
        var datos = "id_usuario="+$scope.session.id_usuario+"&i="+index;
        var promises = [];
        promises.push( $http.delete(postProductoUrl+'/'+$scope.session.usuario+'/'+prod.id_producto, datos, config) );
        $q.all(promises).then(function(response) {
          console.log('RESP:',response[0]);
          if(response[0].data.status=='200' && response[0].data.id_producto) {
            //delete( $scope.dato.productos[index] );\
            console.log('ELIMINA',$scope.dato.productos.splice(index,1));
          }
          $('#modalProducto').closeModal();
        }, function(error) {
          console.warn('Error info producto');
        });
      }
    }





    $scope.api.openPedidos = function() {
      $('#modalPedidos').openModal();
      var config = {
                headers : {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            }
      var datos = {
        id: $scope.session.id_usuario,
        usuario: $scope.session.usuario,
        iddisp: $scope.session.id,
      };
      var promises = [];
      promises.push( $http.get(postPedidoUrl+'/'+$scope.session.usuario+'/'+$scope.session.id_usuario, datos, config) );
      $q.all(promises).then(function(response) {
        console.log('RESP:',response[0]);
        if(response[0].data[0] && response[0].data[0].id_pedido) {
          $scope.dato.pedidos = response[0].data;
        }
      }, function(error) {
        console.warn('Error lista pedidos');
      });
    }


    $scope.api.pedidoListProd = function() {
      $('#modalPedidoProductos').openModal();
      var config = {
                headers : {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            }
      var datos = {
        id: $scope.session.id_usuario,
        usuario: $scope.session.usuario,
        iddisp: $scope.session.id,
      };
      var promises = [];
      promises.push( $http.get(postProductoUrl+'/'+$scope.session.usuario+'/'+$scope.dato.pedido.user.id_usuario, datos, config) );
      //promises.push( $http.get(postProductoUrl+'/'+$scope.session.usuario+'/prod/'+1, datos, config) );
      //promises.push( $http.put(postProductoUrl+'/'+$scope.session.usuario+'/'+1, datos, config) );
      //promises.push( $http.delete(postProductoUrl+'/'+$scope.session.usuario+'/'+1, datos, config) );
      $q.all(promises).then(function(response) {
        if(response[0].data[0]) {
          $scope.dato.productos = response[0].data;
        } else {
          $scope.dato.productos = null;
        }
        console.log('RESP:',response[0]);
      }, function(error) {
        console.warn('Error pedido productos');
      });
    }

    $scope.api.pedidoAddProd = function(index,prod) {
      console.log('AddProd:',index,prod);
      prod.pindex = index;
      prod.pcant = 1;
      if(!$scope.dato.pedido.productos.some(function(a){
        if(a.id_producto==prod.id_producto)return true;
      })) {
        $scope.dato.pedido.productos.push(prod);
      }
    }

    $scope.api.pedidoRemoveProd = function(pindex,prod) {
      console.log(pindex,prod)
      $scope.dato.pedido.productos.splice(pindex, 1);
    }

    $scope.api.pedidoEnviar = function(form) {
      form = document.getElementById(form);
      if(form) {
        var config = {
                  headers : {
                      'Content-Type': 'application/json;charset=utf-8'
                  }
              }
        var datos = {
          id: $scope.session.id_usuario,
          usuario: $scope.session.usuario,
          iddisp: $scope.session.id,
          pedido: $scope.dato.pedido,
          lat: $scope.session.latlng[0],
          lng: $scope.session.latlng[1],
          detalle: form.detalles.value
        };
        var promises = [];
        promises.push( $http.post(postPedidoUrl+'/'+$scope.session.usuario+'/', datos, config) );
        $q.all(promises).then(function(response) {
          console.log('ENVIAR PEDIDO RESP:',response[0]);
          if(response[0].data.status=='403')
          { Materialize.toast('Error registrar pedido',2000); }
          else if(response[0].data.status=='500')
          { Materialize.toast('Error de consulta',2000); }
          else if(response[0].data.status=='501')
          { Materialize.toast('Error registrar productos',2000); }
          else {
            Materialize.toast('Pedido registrado',2000);
          }
        }, function(error) {
          console.warn('Error enviar pedido');
        });
      }
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
  .controller('controladorLogin', function ($scope, Datos) {
    console.log('LOGIN',Datos,$scope.session);
    if(!$scope.session.id) {
      $( document ).ready(function(){
        // Initialize collapse button
        $(".button-collapse").sideNav({closeOnClick:true});
        $('.modal-trigger').leanModal();
        $('#modalLeame').openModal();
      });
    }
  });




angular.module('localizaFrontendApp')
  .service('Datos', function($rootScope){
    return {
      session: {
        ubicado: false
      },
      ubicacion: true
    }
  });
