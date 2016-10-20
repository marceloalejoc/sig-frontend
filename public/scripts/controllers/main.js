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
    var postGrupoUrl = ENV.localizaApi + ENV.localizaApiVersion + '/groups';

    Datos.session.ubicado = false;

    $scope.m = {
      dato: {
        usuarios: null,
        usFecha: '2016-01-01',
        usHora: '00:00:00',
        mensajes: null,
        msFecha: '2016-01-01',
        msHora: '00:00:00',
        usInfo: {}
      },
      ruta: {
        id: null
      },
      session: {
        idusuario: null,
        usuario: null,
        email: null,
        latlng: null,
        ubicado: false,
        img: null
      },
      api: {
        get:null,
        post:null,
        put:null,
        class:''
      },
      ajustes: {
        seguir: null,
        ubicacion: false
      }
    }
    console.log('MARCELO',$scope.m);




    //******************************************
    // Funciones para enviar ubicacion
    $scope.m.ajustes.gpsOptions = {
        enableHighAccuracy: true,
        maximumAge: 14000,
        timeout: 10000
      };

    var mostrarError = function(objError) {
      var msg = '';
      $scope.m.session.latlng = null;
      $scope.m.dato.info = ' ';
      $scope.m.dato.info = 'red-text';
      switch (objError.code)
      {
        case objError.PERMISSION_DENIED:
          msg = "No se ha permitido el acceso a la posición del usuario.";
        break;
        case objError.POSITION_UNAVAILABLE:
          msg = "No se ha podido acceder a la información de su posición.";
        break;
        case objError.TIMEOUT:
          msg = "El servicio ha tardado demasiado tiempo en responder.";
        break;
        default:
          msg = "Error desconocido.";
      }
      //Materialize.toast('Error de ubicación:<br>'+msg, 2000);
    }

    var ubicarMapa = function(objPosition) {
      $scope.m.session.latlng = [objPosition.coords.latitude, objPosition.coords.longitude];
      $scope.m.session.ubicado = true;
      $scope.m.dato.info = '';
      if(vTick==0) {
        if($scope.m.session.usuario && $scope.m.session.latlng) {
          $scope.m.api.postUbicacion($scope.m.session.latlng);
          var usuario = $scope.m.api.userMarker($scope.m.session.usuario, $scope.m.session.id);
          usuario.lat = $scope.m.session.latlng[0];
          usuario.lng = $scope.m.session.latlng[1];
        }
      }
    }

    var geolocalizar = function() {
      if (navigator.geolocation) {
        $scope.m.dato.info = 'blue-text';
        navigator.geolocation.getCurrentPosition(ubicarMapa, mostrarError, $scope.m.ajustes.gpsOptions);
      }
      else {
        console.log("El navegador no soporta Geolocalización.");
        alert("El navegador no soporta Geolocalización.");
      }
      return null;
    }

    var vTempo,vTick=0;
    var fTempo = function() {
      var usuario;
        if($scope.m.ajustes.ubicacion) {
          geolocalizar();
        } else {
          $scope.m.session.latlng = null;
          $scope.m.session.ubicado = false;
        }
        if($scope.m.session.usuario) {
          usuario = $scope.m.api.userMarker($scope.m.session.usuario, $scope.m.session.id);
          if($scope.m.session.latlng) {
            //$scope.m.api.getUsuarios($scope.m.session.usuario);
          }
          if(vTick==0)
            $scope.m.api.getUsuarios($scope.m.session.usuario);
          $scope.m.api.getMensajes($scope.m.session.usuario);
        }

      console.log('***********************',vTick,Date());
      console.log('ajustes', $scope.m.ajustes);
      console.log('api', $scope.m.api);
      console.log('dato', $scope.m.dato);
      console.log('ruta', $scope.m.ruta);
      console.log('session', $scope.m.session);
      console.log('markers',$scope.markers);
      vTick+=1;
      if(vTick>=4) {
        vTick=0
      }
    }

    vTempo = setInterval(fTempo, 15000);
    // Funciones para enviar ubicacion
    //******************************************


    // Se ejecuta cuando hay cambios en la URL
    $scope.$on('$routeChangeSuccess', function() {
      console.log('RUTA',$location.path(),$cookies.getObject('session'));
      if ($cookies.getObject('session')) {
        $scope.m.session = $cookies.getObject('session');
        if ($scope.m.session.id) {
          $scope.m.ajustes.ubicacion = true;
        }
        if ($location.path()=='/login/') {
          $location.path('/home/')
        }
        if ($routeParams.usuario) {
          cargarUsuarioInfo($routeParams.usuario);
        } else {
          ;//cargarUsuarios();
        }
        if (!$scope.m.session.id) {
          $location.path('/login/');
        }
      }

    });


    $scope.getVersion = function() {
      return ENV.version;
    };

    $scope.setUsuario = function(user) {
      $scope.m.ruta.id = user;
      $location.path('/usuarios/'+user+'/info');
    };

    var cargarUsuarioInfo = function(user) {
      var promises = [];
      promises.push($http.get(usuariosUrl+'/'+user+'/info' ));

      $q.all(promises).then(function(response) {
        $scope.m.dato.usuarios = response[0].data;
      }, function(error) {
        console.warn('Error al conectarse con la API: ',usuariosUrl);
      });
    };

    var cargarUsuarios = function() {
      var promises = [];
      if($scope.m.session.usuario) {
        promises.push($http.get(postUsuarioUrl, {a:1} ));
        promises.push($http.get(postMensajeUrl+'/'+$scope.m.session.usuario+'/', {} ));

        $q.all(promises).then(function(response) {
          $scope.m.dato.usuarios = response[0].data;
          $scope.m.dato.mensajes = response[1].data;

        }, function(error) {
          console.warn('Error al conectarse con la API: ',postUsuarioUrl);
        });
      }
    };


    //***********************************
    // funciones globales
    $scope.m.api.postUbicacion = function(latlong) {
      var datos = {
        'usuario': $scope.m.session.usuario,
        'latlng': latlong,
        'iddisp': $scope.m.session.id,
      }
      var promises = [];
      promises.push($http.post(postUbicacionUrl+'/'+$scope.m.session.usuario+'/', datos, Datos.http.config ));

      $q.all(promises).then(function(response) {
        console.log(1);
      }, function(error) {
        console.warn('Error al enviar ubicacion ');
      });
    }

    $scope.m.api.postMsg = function(latlong, msg) {
      var promises = [];
      var datos = {
        'id1': $scope.m.session.id_usuario,
        'user1': $scope.m.session.usuario,
        'latlng': latlong,
        'iddisp': $scope.m.session.id,
        'texto': msg
      }
      if($scope.m.ajustes.seguir) {
        datos.id2 = $scope.m.ajustes.seguir.user.id_usuario;
        datos.user2 = $scope.m.ajustes.seguir.user.usuario;
      }
      promises.push($http.post(postMensajeUrl+'/'+$scope.m.session.usuario+'/', datos, Datos.http.config ));

      $q.all(promises).then(function(response) {
        console.log(1);
      }, function(error) {
        console.warn('Error al enviar ubicacion ');
      });
    }


    $scope.m.api.postUsuario = function(datos) {
      var promises = [];
      promises.push( $http.post(postUsuarioUrl+'/register/'+datos.usuario+'/', datos, Datos.http.config) );
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

    $scope.m.api.getUsuarios = function(usuario) {
      var promises = [];
      var mensajes = document.getElementById('mensajes');
      var datos = {
        id: $scope.m.session.id_usuario,
        usuario: $scope.m.session.usuario,
        iddisp: $scope.m.session.id,
        seguir: $scope.m.ajustes.seguir
      }
      if($scope.m.session.usuario && mensajes) {
        promises.push($http.get(postUsuarioUrl, { 'usuario': 1 } ));

        $q.all(promises).then(function(response) {
          $scope.m.dato.usuarios = response[0].data;
          for (var id in $scope.m.dato.usuarios) {
            if ( $scope.m.dato.usuarios[id].lat && $scope.m.dato.usuarios[id].lng ) {
              var usuario = $scope.m.api.userMarker($scope.m.dato.usuarios[id].usuario, $scope.m.dato.usuarios[id].id_dispositivo);
              usuario.lat = $scope.m.dato.usuarios[id].lat;
              usuario.lng = $scope.m.dato.usuarios[id].lng;
              usuario.message = '<div class="marca-pedido"><b>'+$scope.m.dato.usuarios[id].usuario+'</b><hr>';
              if($scope.m.dato.usuarios[id].nombre) {
                usuario.message+= ' '+$scope.m.dato.usuarios[id].nombre;
              }
              if($scope.m.dato.usuarios[id].ap_paterno) {
                usuario.message+= ' '+$scope.m.dato.usuarios[id].ap_paterno;
              }
              if($scope.m.dato.usuarios[id].ap_materno) {
                usuario.message+= ' '+$scope.m.dato.usuarios[id].ap_materno;
              }
              usuario.message+= '<div class="fecha">'+$scope.m.dato.usuarios[id].fecha+' '+$scope.m.dato.usuarios[id].hora+'</div>';
              usuario.message+= '<a class="btn-flat cyan-text" onclick="Japi_chatUsuario('+id+')"><i class="material-icons">message</i></a>'
              usuario.message+= '<a class="btn-flat blue-text" onclick="Japi_pedidoUsuario('+id+')"><i class="material-icons">add_shopping_cart</i></a>'
              usuario.message+= '</div>';
              if($scope.m.dato.usuarios[id].img)
                usuario.icon.iconUrl = $scope.m.dato.usuarios[id].img;
            }
          }
        }, function(error) {
          console.warn('Error al conectarse con la API: ',postUsuarioUrl);
        });
      }
    }

    $scope.m.api.getMensajes = function(usuario) {
      var promises = [];
      var mensajes = document.getElementById('mensajes');
      var datos = {
        fecha: $scope.m.dato.msFecha,
        hora: $scope.m.dato.msHora,
        id: $scope.m.session.id_usuario,
        usuario: $scope.m.session.usuario,
        iddisp: $scope.m.session.id,
        seguir: $scope.m.ajustes.seguir
      }
      if($scope.m.session.usuario && mensajes) {
        //promises.push($http.post(postMensajeUrl+'/', datos, Datos.http.config ));
        Datos.http.config.method = "POST";
        Datos.http.config.url = postMensajeUrl+'/';
        Datos.http.config.data = datos;

        promises.push($http(Datos.http.config));

        $q.all(promises).then(function(response) {
          $scope.m.dato.mensajes = response[0].data;
          //mensajes.innerHTML = "";
          for (var id in $scope.m.dato.mensajes) {
            var fecha = $scope.m.dato.mensajes[id].fecha.substring(0,10);
            var hora = $scope.m.dato.mensajes[id].hora.substring(0,8);
            if ($scope.m.dato.msFecha+" "+$scope.m.dato.msHora < fecha+" "+hora) {
              $scope.m.dato.msFecha = fecha;
              $scope.m.dato.msHora = hora;
            }

            /*while($scope.m.dato.mensajes[id].mensaje.indexOf('\n')>=0) {
              $scope.m.dato.mensajes[id].mensaje = $scope.m.dato.mensajes[id].mensaje.replace('\n','<br>');
            }*/
            $scope.m.dato.mensajes[id].mensaje = $scope.m.dato.mensajes[id].mensaje.replace(/\n/gi,'<br>');
            $scope.m.dato.mostrarMensajes($scope.m.dato.mensajes[id].usuario1, $scope.m.dato.mensajes[id].mensaje, fecha+" "+hora);

          }
        }, function(error) {
          console.warn('Error al conectarse con la API: ',postUsuarioUrl);
        });

      }
    }

    $scope.m.api.infoUsuario = function(user) {
      if($scope.m.dato.usInfo && user.usuario == $scope.m.dato.usInfo.usuario) {
        $('#modalUsuario').openModal();
        return;
      }

      var datos = {
        id: $scope.m.session.id_usuario,
        usuario: $scope.m.session.usuario,
        iddisp: $scope.m.session.id,
        user: user
      };
      var promises = [];
      promises.push( $http.post(postUsuarioUrl+'/'+user.usuario+'/info', datos, Datos.http.config) );
      $q.all(promises).then(function(response) {
        if(response[0].data.status==200) {
          if(response[0].data.usuario) {
            $scope.m.dato.usInfo = response[0].data;
            $('#modalUsuario').openModal();
          }
        }
      }, function(error) {
        console.warn('Error info usuario');
      });
    }





    $scope.m.api.openProductos = function() {
      $('#modalProductos').openModal();
      $scope.m.dato.productos = null;
      var datos = {
        id: $scope.m.session.id_usuario,
        usuario: $scope.m.session.usuario,
        iddisp: $scope.m.session.id,
      };
      var promises = [];
      promises.push( $http.get(postProductoUrl+'/'+$scope.m.session.usuario+'/'+$scope.m.session.id_usuario, datos, Datos.http.config) );
      $q.all(promises).then(function(response) {
        if(response[0].data[0]) {
          $scope.m.dato.productos = response[0].data;
        }
      }, function(error) {
        console.warn('Error info producto');
      });
    }

    $scope.m.api.productoAdd = function() {
      $('#modalProducto').openModal();
    }

    $scope.m.api.postProducto = function(form) {
      form = document.getElementById(form);
      if(form && form.codigo.value && form.nombre.value) {
        var datos = {
          id_usuario: $scope.m.session.id_usuario,
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
          promises.push( $http.put(postProductoUrl+'/'+$scope.m.session.usuario+'/'+form.id_prod.value, datos, Datos.http.config) );
        } else {
          promises.push( $http.post(postProductoUrl+'/'+$scope.m.session.usuario+'/', datos, Datos.http.config) );
        }
        $q.all(promises).then(function(response) {
          if(form.id_prod.value && response[0].data.i) {
            var prod = $scope.m.dato.productos[response[0].data.i];
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
            $scope.m.dato.productos = [prod].concat($scope.m.dato.productos);
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

    $scope.m.api.productoEdit = function(index,prod,form) {
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

    $scope.m.api.productoDelete = function(index, prod) {
      if(confirm('Esta seguro de eliminar el producto')) {
        var datos = "id_usuario="+$scope.m.session.id_usuario+"&i="+index;
        var promises = [];
        promises.push( $http.delete(postProductoUrl+'/'+$scope.m.session.usuario+'/'+prod.id_producto, datos, Datos.http.config) );
        $q.all(promises).then(function(response) {
          if(response[0].data.status=='200' && response[0].data.id_producto) {
            $scope.m.dato.productos.splice(index,1)
          }
          $('#modalProducto').closeModal();
        }, function(error) {
          console.warn('Error info producto');
        });
      }
    }




    $scope.m.api.openPedidos = function() {
      $('#modalPedidos').openModal();
      var datos = {
        id: $scope.m.session.id_usuario,
        usuario: $scope.m.session.usuario,
        iddisp: $scope.m.session.id,
      };
      var promises = [];
      promises.push( $http.get(postPedidoUrl+'/'+$scope.m.session.usuario+'/to/'+$scope.m.session.id_usuario, datos, Datos.http.config) );
      $q.all(promises).then(function(response) {
        if(response[0].data[0] && response[0].data[0].id_pedido) {
          $scope.m.dato.pedidos = response[0].data;
        }
      }, function(error) {
        console.warn('Error lista pedidos');
      });
    }


    $scope.m.api.openMisPedidos = function() {
      $('#modalMisPedidos').openModal();
      var datos = {
        id: $scope.m.session.id_usuario,
        usuario: $scope.m.session.usuario,
        iddisp: $scope.m.session.id,
      };
      var promises = [];
      promises.push( $http.get(postPedidoUrl+'/'+$scope.m.session.usuario+'/'+$scope.m.session.id_usuario, datos, Datos.http.config) );
      $q.all(promises).then(function(response) {
        if(response[0].data[0] && response[0].data[0].id_pedido) {
          $scope.m.dato.pedidos = response[0].data;
        }
      }, function(error) {
        console.warn('Error lista pedidos');
      });
    }


    $scope.m.api.pedidoListProd = function() {
      $('#modalPedidoProductos').openModal();
      $scope.m.dato.productos = null;
      var datos = {
        id: $scope.m.session.id_usuario,
        usuario: $scope.m.session.usuario,
        iddisp: $scope.m.session.id,
      };
      var promises = [];
      promises.push( $http.get(postProductoUrl+'/'+$scope.m.session.usuario+'/'+$scope.m.dato.pedido.user.id_usuario, datos, Datos.http.config) );
      $q.all(promises).then(function(response) {
        if(response[0].data[0]) {
          $scope.m.dato.productos = response[0].data;
        } else {
          $scope.m.dato.productos = null;
        }
      }, function(error) {
        console.warn('Error pedido productos');
      });
    }

    $scope.m.api.pedidoAddProd = function(index,prod) {
      prod.pindex = index;
      prod.pcant = 1;
      if(!$scope.m.dato.pedido.productos.some(function(a){
        if(a.id_producto==prod.id_producto)return true;
      })) {
        $scope.m.dato.pedido.productos.push(prod);
      }
    }

    $scope.m.api.pedidoRemoveProd = function(pindex,prod) {
      $scope.m.dato.pedido.productos.splice(pindex, 1);
    }

    $scope.m.api.pedidoEnviar = function(form) {
      form = document.getElementById(form);
      if(form) {
        var datos = {
          id: $scope.m.session.id_usuario,
          usuario: $scope.m.session.usuario,
          iddisp: $scope.m.session.id,
          pedido: $scope.m.dato.pedido,
          lat: $scope.m.session.latlng[0],
          lng: $scope.m.session.latlng[1],
          nombres: form.nombres.value,
          email: form.email.value,
          direccion: form.direccion.value,
          detalles: form.detalles.value
        };
        var promises = [];
        promises.push( $http.post(postPedidoUrl+'/'+$scope.m.session.usuario+'/', datos, Datos.http.config) );
        $q.all(promises).then(function(response) {
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

    $scope.m.api.gruposAbrir = function() {
      $('#modalGrupos').openModal();
      var datos = {
        a: 1
      };
      var promises = [];
      promises.push( $http.get(postGrupoUrl+'/'+$scope.m.session.usuario+'/'+$scope.m.session.id_usuario, datos, Datos.http.config) );
      $q.all(promises).then(function(response) {
        $scope.m.dato.grupos = response[0].data;
      }, function(error) {
        console.warn('Error obtener grupos');
      });
    }



    $scope.m.api.openMisDatos = function() {
      if($scope.m.dato.usInfo && $scope.m.session.usuario == $scope.m.dato.usInfo.usuario) {
        $('#modalReg').openModal();
        return;
      }

      var datos = {
        id: $scope.m.session.id_usuario,
        usuario: $scope.m.session.usuario,
        iddisp: $scope.m.session.id,
        user: {
          id_usuario: $scope.m.session.id_usuario,
        }
      };
      var promises = [];
      promises.push( $http.post(postUsuarioUrl+'/'+$scope.m.session.usuario+'/info', datos, Datos.http.config) );
      $q.all(promises).then(function(response) {
        if(response[0].data.status==200) {
          if(response[0].data.usuario) {
            $scope.m.dato.usInfo = response[0].data;
            $('#modalReg').openModal();
          }
        }
      }, function(error) {
        console.warn('Error info usuario');
      });
    }

    $scope.m.api.saveMisDatos = function() {
      var promises = [];
      promises.push( $http.put(postUsuarioUrl+'/'+$scope.m.session.usuario+'/'+$scope.m.session.id_usuario, $scope.m.dato.usInfo, Datos.http.config) );
      $q.all(promises).then(function(response) {
        if(response[0].data.usuario) {
          if(response[0].data.status==200)
            Materialize.toast('Sus datos fueron registrados',2000);
            $('#modalReg').closeModal();
        } else {
          if(response[0].data.status==304)
            Materialize.toast('Solo esta registrado su dispositivo',2000);
        }
      }, function(error) {
        console.warn('Error al actualizar datos');
      });
    }




    $scope.m.api.getUsuario = function(datos) {
      $scope.m.api.class='text-blue';
      var promises = [];
      datos.latlng = $scope.m.session.latlng;
      promises.push( $http.post(Datos.postUsuarioUrl+'/login/'+datos.usuario+'/', datos, Datos.http.config) );
      $q.all(promises).then(function(response) {
        if(response[0].data.id_usuario) {
          $scope.m.session = response[0].data;
          $cookies.putObject('session',$scope.m.session);
          $location.path('/home/');
        } else if(response[0].data.info){
          Materialize.toast(response[0].data.info,2000);
        } else {
          Materialize.toast('Error usuario o contraseña',2000);
        }
        $scope.m.api.class='';
      }, function(error) {
        console.warn('Error al enviar ubicacion ');
        $scope.m.api.class='';
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
  .service('Datos', function($rootScope, ENV){
    return {
      postUsuarioUrl: ENV.localizaApi + ENV.localizaApiVersion + '/users',
      http: {
        config: {
                  headers : {
                      'Content-Type': 'application/json;charset=utf-8'
                  }
              }
      },
      session: {
        ubicado: false
      },
      ubicacion: true
    }
  });

var JDatos = {};

  var Japi_chatPedido = function(pedido) {
    //console.log(JDatos[pedido]);
    var $scope = $('[ng-controller="controladorPrincipal"]').scope();
    //$scope.m.api.seguirUsuario(user);
    $('#modalMsg').openModal();
    $('#mensajes').html('');
    $scope.m.dato.msFecha = '2016-01-01';
    $scope.m.dato.msHora = '00:00:00';
    $scope.m.api.getMensajes($scope.m.session.usuario);
  }

  var Japi_chatUsuario = function(userId) {
    //console.log(userId);
    var $scope = $('[ng-controller="controladorPrincipal"]').scope();
    $scope.m.api.chatUsuario($scope.m.dato.usuarios[userId]);
  }
  var Japi_pedidoUsuario = function(userId) {
    //console.log(userId);
    var $scope = $('[ng-controller="controladorPrincipal"]').scope();
    $scope.m.api.pedidoUsuario($scope.m.dato.usuarios[userId]);
  }
