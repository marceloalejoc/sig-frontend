'use strict';

/**
 * @ngdoc function
 * @name localizaFrontendApp.controller:controladorLeaflet
 * @description
 * # controladorLeaflet
 * Controller of the localizaFrontendApp
 */
angular.module('localizaFrontendApp')
  //.controller('controladorPrincipal', function ($scope, $http, $q, $routeParams, $location, ENV, Dpa, BreadcrumbFactory) {
  .controller('controladorLeaflet', function ($scope, $http, $q, $location, $cookies, ENV, Datos) {
//console.log('LEAF',$scope.m.session);
    var bounds = {
        london: {
            northEast: {
                lat: 51.51280224425956,
                lng: -0.11681556701660155
            },
            southWest: {
                lat: 51.50211782162702,
                lng: -0.14428138732910156
            }
        },
        warszawa: {
            southWest: {
                lat: 52.14823737817847,
                lng: 20.793685913085934
            },
            northEast: {
                lat: 52.31645452105213,
                lng: 21.233139038085938
            }
        },
        bolivia: {
            southWest: {
                lat: -23.073668,
                lng: -69.719238
            },
            northEast: {
                lat:  -9.640828,
                lng: -57.381592
            }
        }
    }

    $scope.definedLayers = {
      osm: {
        name: 'OpenStreetMap',
        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        type: 'xyz',
        layerOptions: {
          //attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
          subdomains: ['a','b','c'],
        },
        visible: false
      },
      arcgis: {
        name: 'ArcGIS World Imagery',
        url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        type: 'xyz',
        visible: false
      },
      open: {
        name: 'OpenStreetLocal',
        url: 'http://192.168.3.33/osm/service?',
        type: 'wms',
        visible: true,
        layerParams: {
          layers: 'openstreet',
          format: "image/png",
          transparent: true,
          //crs: L.CRS.EPSG4326,
          //version: '1.1.1',
        }
      },
      mapbox_wheat: {
                    name: 'Mapbox Wheat Paste',
                    url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                    type: 'xyz',
                    layerOptions: {
                        apikey: 'pk.eyJ1IjoiYnVmYW51dm9scyIsImEiOiJLSURpX0pnIn0.2_9NrLz1U9bpwMQBhVk97Q',
                        mapid: 'bufanuvols.lia35jfp'
                    }
                },
    };

    $scope.definedOverlays = {
    hillshade: {
        name: 'Hillshade Europa',
        type: 'wms',
        url: 'http://129.206.228.72/cached/hillshade',
        visible: true,
        layerOptions: {
            layers: 'europe_wms:hs_srtm_europa',
            format: 'image/png',
            opacity: 0.25,
            attribution: 'Hillshade layer by GIScience http://www.osm-wms.de',
            crs: L.CRS.EPSG900913
        }
    }
};


    angular.extend($scope, {
      maxbounds: bounds.bolivia,
      defaults: {
        maxZoom: 18,
        minZoom: 5
      },
      center: {
        lat: -16.5286043,
        lng: -68.1798767,
        zoom: 10,
      },
      markers: {
        prueba_xyz83: {
          lat: -16.5286043,
          lng: -68.1798767,
          message: "<b>LATLONG</b><br>Obtenerpos",
          focus: false,
          draggable: true,
          opacity: 0.5,
          title: 'as',
          icon: {
            iconUrl: 'img/png/carro_repartidor.png',
            iconSize: [40,24],
            shadowUrl: 'img/png/position_marker_shadow.png',
            shadowAnchor: [20, 24]
          }
        }/*,
        usuario: {
          lat: -16.5288043,
          lng: -68.1796767,
          message: "<b>usuario</b><br>Necesito unas cocacolas",
          focus: false,
          draggable: false,
          icon: {
            iconUrl: 'img/png/carro_repartidor.png',
            iconSize: [40, 25],
            iconAnchor: [20, 0],
            popupAnchor: [0, 0],
            shadowSize: [20, 30],
            shadowAnchor: [10, 15]
          }
        },
        carro_basurero: {
          lat: -16.5284043,
          lng: -68.1801767,
          message: "<b>carro_basurero</b><br>En camino",
          focus: false,
          draggable: false,
          icon: {
            iconUrl: 'img/png/carro_basurero.png',
            iconSize: [40, 25],
            iconAnchor: [20, 0],
            popupAnchor: [0, 0],
            shadowSize: [20, 30],
            shadowAnchor: [10, 15]
          }
        }*/
      },
      layers: {
        baselayers: {
          open: $scope.definedLayers.open,
          osm: $scope.definedLayers.osm,
          arcgis: $scope.definedLayers.arcgis,
          //mapbox_wheat: $scope.definedLayers.mapbox_wheat,
        },
        //overlays: {
        //               hillshade: $scope.definedOverlays.hillshade
        //           }
      },
    });

    $scope.toggleLayer = function(layerName) {
      var baselayers = $scope.layers.baselayers;
      if (baselayers.hasOwnProperty(layerName)) {
        delete baselayers[layerName];
      } else {
        baselayers[layerName] = $scope.definedLayers[layerName];
      }
    };

    /*$scope.$watch("center.zoom", function(zoom) {
      $scope.layers.baselayers = {};
      if (zoom < 16) {
        $scope.layers.baselayers['arcgis'] = $scope.definedLayers['arcgis'];
      } else {
        $scope.layers.baselayers['osm'] = $scope.definedLayers['osm'];
      }
    });*/

    $scope.$on('leafletDirectiveMarker.mimapa.dragend',function(e,args){
      args.model.message = "<b>LATLONG</b><br>["+args.model.lat+","+args.model.lng+"]";
      $scope.markers[args.modelName].lat = args.model.lat;
      $scope.markers[args.modelName].lng = args.model.lng;
      $scope.markers[args.modelName].message = "<b>LATLONG</b><br>lat: "+args.model.lat+"<br>lng: "+args.model.lng+"";
      console.log('marker:',args);
    });


    // Crear markador de usuario
    $scope.m.api.userMarker = function(usu,iddisp) {
      var usuaux = usu;
      if(iddisp)
        usuaux += iddisp;
      var usuario = $scope.markers[usuaux];
      if(!usuario) {
        $scope.markers[usuaux] = {
          lat: -16.0,
          lng: -68.0,
          message: "<b>"+usu+"</b>",
          focus: false,
          draggable: false,
          icon: {
            //iconUrl: 'img/png/carro_repartidor.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -25],
            shadowUrl: 'img/png/position_marker_shadow.png',
            shadowSize: [32, 16],
            shadowAnchor: [8, 16]
          },
          markid: usuaux
        }
      }
      return $scope.markers[usuaux];
    }



    //******************************************
    // Funciones para enviar mensaje
    var tmsg = '';

    var ubicarMsgMapa = function(objPosition) {
      var usuario = $scope.m.api.userMarker($scope.m.session.usuario, $scope.m.session.id);
      $scope.m.session.latlng = [objPosition.coords.latitude, objPosition.coords.longitude];
      $scope.m.api.postMsg($scope.m.session.latlng, tmsg.value);
      if($scope.m.session.latlng) {
        usuario.lat = $scope.m.session.latlng[0];
        usuario.lng = $scope.m.session.latlng[1];
        usuario.message = "<b>"+$scope.m.session.usuario+"</b><br>" + tmsg.value;
        usuario.focus = true;
      }
      tmsg.value = '';
    }

    var mostrarMsgError = function(objError) {
      $scope.m.session.latlng = null;
      switch (objError.code)
      {
        case objError.PERMISSION_DENIED:
          console.log("No se ha permitido el acceso a la posición del usuario.");
        break;
        case objError.POSITION_UNAVAILABLE:
          console.log("No se ha podido acceder a la información de su posición.");
        break;
        case objError.TIMEOUT:
          console.log("El servicio ha tardado demasiado tiempo en responder.");
        break;
        default:
          console.log("Error desconocido.");
      }
      Materialize.toast('Error de ubicación:<br>'+msg, 2000)
    }

    $scope.m.api.enviarMensaje1 = function(msg) {
      tmsg = document.getElementById(msg);
      if (tmsg.value) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(ubicarMsgMapa, mostrarMsgError, $scope.m.ajustes.gpsOptions);
        }
        else {
          console.log("El navegador no soporta Geolocalización.");
          alert("El navegador no soporta Geolocalización.");
        }
      }
      return null;
    }

    $scope.m.api.enviarMensaje = function(msg) {
      tmsg = document.getElementById(msg);
      if (tmsg.value) {
        if ($scope.m.session.latlng) {
          $scope.m.api.postMsg($scope.m.session.latlng, tmsg.value);
          tmsg.value = '';
        }
        else {
          console.log("No se ha podido ubicar su posición.");
          Materialize.toast('Información:<br>No se ha podido ubicar su posición.', 2000)
        }
      }
      return null;
    }

    $scope.m.api.login = function() {
      var datos = {};
      var form = document.getElementById('login');
      $scope.m.ajustes.ubicacion=true;
      datos.usuario = form.usuario.value.replace(/[^a-z0-9\_]/gi,'').substr(0,32);
      datos.password = form.password.value;
      datos.latlong = [$scope.center.lat,$scope.center.lng];
      new Fingerprint2().get(function(r,c){
        datos.iddisp = r; //a hash, representing your device fingerprint
        if ( datos.usuario!="" ) {
          $scope.m.api.getUsuario(datos);
        }
      });
    }

    $scope.m.api.logout = function() {
      $cookies.remove('session');
      $scope.m.session = {
        idusuario: null,
        usuario: null,
        email: null,
        latlng: null,
        ubicado: false,
        img: null
      };
      $scope.markers = {};
      setTimeout("document.location='/'",500);
      console.log('logout:',$scope.m);
    }


    var formValidaCampo = function(objForm,inputName,objDatos,msgError) {
      if(objForm) {
        if(msgError && objForm[inputName].value=="") {
          Materialize.toast(msgError, 2000);
          return false;
        } else {
          objDatos[inputName] = (objForm[inputName].value)? objForm[inputName].value: null;
        }
        return true;
      }
      return false;
    }


    $scope.m.api.registrarse = function() {
      if(!$scope.m.session.latlng)
        return;
      var form = document.getElementById('registrarse');
      var datos = {};

      if( !formValidaCampo(form,'usuario',datos,'Complete el campo Usuario') ||
      !formValidaCampo(form,'password',datos,'Complete el campo Contraseña') ||
      !formValidaCampo(form,'descripcion',datos,'Complete el campo Descripción') ||
      !formValidaCampo(form,'claves',datos) ||
      !formValidaCampo(form,'sitio',datos) ||
      !formValidaCampo(form,'email',datos) ||
      !formValidaCampo(form,'direccion',datos) ||
      !formValidaCampo(form,'zona',datos) ||
      !formValidaCampo(form,'tipo',datos) ||
      !formValidaCampo(form,'nombre',datos,'Complete el campo Nombre') ||
      !formValidaCampo(form,'appaterno',datos,'Complete el campo Apellido Paterno') ||
      !formValidaCampo(form,'apmaterno',datos,'Complete el campo Apellido Materno') ) {
        return;
      }

      datos.latlng = $scope.m.session.latlng;

      new Fingerprint2().get(function(r,c){
        datos.iddisp = r; //a hash, representing your device fingerprint
        if (datos.usuario!="" && form.password.value!="" && form.descripcion.value!="") {
          $scope.m.api.postUsuario(datos);
        }
      });
    }


    //************
    $scope.m.dato.mostrarMensajes = function(usuario, txtMensaje, txtFecha) {
      var mensajes = document.getElementById('mensajes');
      var mensaje = document.createElement('DIV');
      var titulo = document.createElement('DIV');
      var texto = document.createElement('DIV');
      var fecha = document.createElement('DIV');

      titulo.innerHTML = "<b>"+usuario+"</b><br>";
      titulo.className = "titulo";
      texto.innerHTML = ""+txtMensaje;
      texto.className = "texto";
      fecha.innerHTML = ""+txtFecha;
      fecha.className = "fecha";
      mensaje.appendChild(titulo);
      mensaje.appendChild(texto);
      mensaje.appendChild(fecha);
      mensaje.className = "mensaje";
      if($scope.m.session.usuario==usuario) {
        mensaje.className += " yop";
      }
      mensajes.appendChild(mensaje);
      mensajes.scrollTop = mensajes.scrollHeight - mensajes.clientHeight;
    }


    $scope.m.api.seguirUsuario = function(usuario) {

      console.log('seguirUsuario:',usuario);
      $scope.center.lat = usuario.lat;
      $scope.center.lng = usuario.lng;

      for (var id in $scope.markers) {
        $scope.markers[id].focus = false;
      }
      var usuaux = usuario.usuario;
      if(usuario.id_dispositivo)
        usuaux += usuario.id_dispositivo;
      if ($scope.markers[usuaux]) {
        $scope.markers[usuaux].focus = true;
        $scope.m.ajustes.seguir = {
          user: usuario,
          marker:$scope.markers[usuaux]
        }
      }
    }


    $scope.m.api.pedidoSeguir = function(pedido) {
      var marcador = $scope.m.api.userMarker('0__el_pedido_qwerty_aserty');
      if(!(pedido.lat&&pedido.lng)){
        delete $scope.markers['0__el_pedido_qwerty_aserty'];
        return;
      }

      marcador.message = '<div class="marca-pedido"><b>Ubicación </b>'
      if(pedido.usuario2) {
        marcador.message+= '<b>de mi compra<br>realizado a '+pedido.usuario2+':</b>';
        marcador.icon.iconUrl = 'img/png/carrito_compra2.png';
        $scope.m.ajustes.seguir = {
          user: {id_usuario:pedido.id_usuario2,usuario:pedido.usuario2},
          marker:$scope.markers['0__el_pedido_qwerty_aserty']
        }
      }
      if(pedido.usuario1) {
        marcador.message+= '<b>del pedido de '+pedido.usuario1+':</b>';
        marcador.icon.iconUrl = 'img/png/carrito_compra2.png';
        $scope.m.ajustes.seguir = {
          user: {id_usuario:pedido.id_usuario1,usuario:pedido.usuario1},
          marker:$scope.markers['0__el_pedido_qwerty_aserty']
        }
      }
      if(pedido.detalle) {
        marcador.message+= '<div class="detalle">'+pedido.detalle+'</div>';
      }
      marcador.message+= '<div class="fecha">'+pedido.fecha+' '+pedido.hora+'</div>';
      marcador.message+= '<a class="btn-flat cyan-text" onclick="jApi_chatPedido(\'pedido\')"><i class="material-icons">message</i></a>'
      //marcador.message+= '<a class="btn-flat blue-text" onclick="jApi_pedidoUsuario(pedido)"><i class="material-icons">add_shopping_cart</i></a>'
      JDatos.pedido = pedido;
      marcador.message+= '</div>';
      marcador.lat = pedido.lat;
      marcador.lng = pedido.lng;
      $scope.center.lat = pedido.lat;
      $scope.center.lng = pedido.lng;
      for (var id in $scope.markers) {
        $scope.markers[id].focus = false;
      }
      marcador.focus = true;
    }


    $scope.m.api.pedidoSeguirRepartidor = function(pedido) {
      var marcador = $scope.m.api.userMarker(pedido.usuarior,pedido.id_dispr);

      if(!(pedido.lat&&pedido.lng)){
        //delete $scope.markers['0__el_pedido_qwerty_aserty'];
        return;
      }
      //marcador.message+= '<a class="btn-flat cyan-text" onclick="jApi_chatPedido(\'pedido\')"><i class="material-icons">message</i></a>'
      //marcador.message+= '<a class="btn-flat blue-text" onclick="jApi_pedidoUsuario(pedido)"><i class="material-icons">add_shopping_cart</i></a>'
      JDatos.pedido = pedido;
      if(pedido.ulat && pedido.ulng) {
        marcador.lat = pedido.ulat;
        marcador.lng = pedido.ulng;
      }
      $scope.center.lat = marcador.lat;
      $scope.center.lng = marcador.lng;

      for (var id in $scope.markers) {
        $scope.markers[id].focus = false;
      }
      marcador.focus = true;
    }


    $scope.m.api.chatUsuario = function(user) {
      $scope.m.api.seguirUsuario(user);
      $('#modalMsg').openModal();
      $('#mensajes').html('');
      $scope.m.dato.msFecha = '2016-01-01';
      $scope.m.dato.msHora = '00:00:00';
      $scope.m.api.getMensajes($scope.m.session.usuario);
    }


    $scope.m.api.pedidoUsuario = function(user) {
      if(!$scope.m.dato.pedido || $scope.m.dato.pedido.user!=user)
          $scope.m.dato.pedido = {user:user, productos:[]};
      $('#modalPedido').openModal();
    }


    // Funciones para DEBUG
    var _nuevaPos = function() {
      var slat = parseInt(Math.random()*3) -1;
      var slong = parseInt(Math.random()*3) -1;
      var lat = parseInt(Math.random()*1000000)/10000000000;
      var long = parseInt(Math.random()*1000000)/10000000000;
      return [lat*slat, long*slong];
    }

  });
