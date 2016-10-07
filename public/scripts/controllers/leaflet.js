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
  .controller('controladorLeaflet', function ($scope, $http, $q, $routeParams, $location, ENV) {

    $scope.definedLayers = {
      osm: {
        name: 'OpenStreetMap',
        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        type: 'xyz',
        visible: true
      },
      arcgis: {
        name: 'ArcGIS World Imagery',
        url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        type: 'xyz',
        visible: true
      }
    };


    angular.extend($scope, {
      defaults: {
        maxZoom: 18,
        minZoom: 10
      },
      center: {
        lat: -16.5286043,
        lng: -68.1798767,
        zoom: 10,
      },
      markers: {
        /*malejo: {
          lat: -16.5286043,
          lng: -68.1798767,
          message: "<b>malejo</b><br>Aqui hay basura hace una semana",
          focus: false,
          draggable: false,
        },
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
          osm: $scope.definedLayers.osm,
          arcgis: $scope.definedLayers.arcgis
        }
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

    // Crear markador de usuario
    $scope.api.userMarker = function(usu,iddisp) {
      var usuaux = usu;
      if(iddisp)
        usuaux += iddisp;
      var usuario = $scope.markers[usuaux];
      if(!usuario) {
        $scope.markers[usuaux] = {
          lat: -16.5276043,
          lng: -68.1798767,
          message: "<b>"+usu+"</b><br>",
          focus: false,
          draggable: false,
          icon: {
            //iconUrl: 'img/png/carro_repartidor.png',
            iconSize: [40, 25],
            iconAnchor: [20, 0],
            popupAnchor: [0, 0],
            shadowSize: [20, 30],
            shadowAnchor: [10, 15]
          }
        }
      }
      return $scope.markers[usuaux];
    }

    //******************************************
    // Funciones para enviar ubicacion
    var options = {
        enableHighAccuracy: false,
        maximumAge: 20000,
        timeout: 15000
      };

    var mostrarError = function(objError) {
      var msg = '';
      $scope.session.latlng = null;
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
      Materialize.toast('Error de ubicación:<br>'+msg, 2000);
    }

    var ubicarMapa = function(objPosition) {
      $scope.session.latlng = [objPosition.coords.latitude, objPosition.coords.longitude];
      Materialize.toast('Ubicado', 1000)
      if($scope.session.usuario && $scope.session.latlng) {
        $scope.api.postUbicacion($scope.session.latlng);
        var usuario = $scope.api.userMarker($scope.session.usuario, $scope.session.id);
        usuario.lat = $scope.session.latlng[0];
        usuario.lng = $scope.session.latlng[1];
      }
    }

    var geolocalizar = function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(ubicarMapa, mostrarError, options);
      }
      else {
        console.log("El navegador no soporta Geolocalización.");
        alert("El navegador no soporta Geolocalización.");
      }
      return null;
    }

    var vTempo;
    var fTempo = function() {
      var usuario;
      if($scope.ajustes.ubicacion) {
        geolocalizar();
      } else {
        $scope.session.latlng = null;
      }
      if($scope.session.usuario) {
        usuario = $scope.api.userMarker($scope.session.usuario, $scope.session.id);
        if($scope.session.latlng) {
          //$scope.api.getUsuarios($scope.session.usuario);
        }
        $scope.api.getUsuarios($scope.session.usuario);
        $scope.api.getMensajes($scope.session.usuario);
      }
    }

    vTempo = setInterval(fTempo, 30000);




    //******************************************
    // Funciones para enviar mensaje
    var tmsg = '';

    var ubicarMsgMapa = function(objPosition) {
      var usuario = $scope.api.userMarker($scope.session.usuario, $scope.session.id);
      $scope.session.latlng = [objPosition.coords.latitude, objPosition.coords.longitude];
      $scope.api.postMsg($scope.session.latlng, tmsg.value);
      if($scope.session.latlng) {
        usuario.lat = $scope.session.latlng[0];
        usuario.lng = $scope.session.latlng[1];
        usuario.message = "<b>"+$scope.session.usuario+"</b><br>" + tmsg.value;
        usuario.focus = true;
      }
      tmsg.value = '';
    }

    var mostrarMsgError = function(objError) {
      $scope.session.latlng = null;
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

    $scope.api.enviarMensaje1 = function(msg) {
      tmsg = document.getElementById(msg);
      if (tmsg.value) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(ubicarMsgMapa, mostrarMsgError, options);
        }
        else {
          console.log("El navegador no soporta Geolocalización.");
          alert("El navegador no soporta Geolocalización.");
        }
      }
      return null;
    }

    $scope.api.enviarMensaje = function(msg) {
      tmsg = document.getElementById(msg);
      if (tmsg.value) {
        if ($scope.session.latlng) {
          $scope.api.postMsg($scope.session.latlng, tmsg.value);
          tmsg.value = '';
        }
        else {
          console.log("No se ha podido ubicar su posición.");
          Materialize.toast('Información:<br>No se ha podido ubicar su posición.', 2000)
        }
      }
      return null;
    }

    $scope.api.login = function() {
      var datos = {};
      var form = document.getElementById('login');
      $scope.ajustes.ubicacion=true;
      datos.usuario = form.usuario.value;
      datos.password = form.password.value;
      datos.latlong = [$scope.center.lat,$scope.center.lng];
      new Fingerprint2().get(function(r,c){
        datos.iddisp = r; //a hash, representing your device fingerprint
        if (datos.usuario!="" && datos.password!="") {
          $scope.api.getUsuario(datos);
        }
      });
    }

    $scope.api.registrarse = function() {
      if(!$scope.session.latlng)
        return;
      var form = document.getElementById('registrarse');
      var datos = {};
      if(form.usuario.value=="") { Materialize.toast('Falta campo usuario', 2000); return; }
      if(form.password.value=="") { Materialize.toast('Falta campo contraseña', 2000); return; }
      if(form.negocio.value=="") { Materialize.toast('Falta campo descripción negocio', 2000); return; }
      if(form.siglas.value=="") { Materialize.toast('Falta campo siglas', 2000); return; }
      if(form.email.value=="") { Materialize.toast('Falta campo email', 2000); return; }
      if(form.nombre.value=="") { Materialize.toast('Falta campo nombres', 2000); return; }
      if(form.appaterno.value=="") { Materialize.toast('Falta campo ap. paterno', 2000); return; }
      if(form.apmaterno.value=="") { Materialize.toast('Falta campo ap. materno', 2000); return; }
      if(form.dia.value=="") { Materialize.toast('Falta campo día', 2000); return; }
      if(form.mes.value=="") { Materialize.toast('Falta campo mes', 2000); return; }
      if(form.ano.value=="") { Materialize.toast('Falta campo año', 2000); return; }

      datos.usuario = form.usuario.value;
      datos.password = form.password.value;
      datos.negocio = form.negocio.value;
      datos.siglas = form.siglas.value;
      datos.email = form.email.value;
      datos.nombre = form.nombre.value;
      datos.appaterno = form.appaterno.value;
      datos.apmaterno = form.apmaterno.value;
      datos.dia = form.dia.value;
      datos.mes = form.mes.value;
      datos.ano = form.ano.value;
      datos.latlng = $scope.session.latlng;

      new Fingerprint2().get(function(r,c){
        datos.iddisp = r; //a hash, representing your device fingerprint
        if (datos.usuario!="" && form.password.value!="" && form.negocio.value!="") {
          //Materialize.toast(datos, 1000)
          $scope.api.postUsuario(datos);
        }
      });
    }


    //************
    $scope.dato.mostrarMensajes = function(usuario, txtMensaje, txtFecha) {
      //console.log('mostrarMensajes');
      var mensajes = document.getElementById('mensajes');
      var mensaje = document.createElement('DIV');
      var titulo = document.createElement('DIV');
      var texto = document.createElement('DIV');
      var fecha = document.createElement('DIV');
      //console.log(mensajes);
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
      if($scope.session.usuario==usuario) {
        mensaje.className += " yop";
      }
      mensajes.appendChild(mensaje);
      mensajes.scrollTop = mensajes.scrollHeight - mensajes.clientHeight;
    }


    $scope.api.seguirUsuario = function(usuario) {
      $scope.center.lat = usuario.lat;
      $scope.center.lng = usuario.lng;
      console.log(usuario);
      var usuaux = usuario.usuario;
      if(usuario.id_dispositivo)
        usuaux += usuario.id_dispositivo;
      if ($scope.markers[usuaux]) {
        if ($scope.ajustes.seguir) {
          $scope.ajustes.seguir.focus = false;
        }
        $scope.markers[usuaux].focus = true;
        $scope.ajustes.seguir = {
          user: usuario,
          marker:$scope.markers[usuaux]
        }
      }
    }


    $scope.api.chatUsuario = function(user) {
      $scope.api.seguirUsuario(user);
      $('#modalMsg').openModal();
      $('#mensajes').html('');
      $scope.api.getMensajes($scope.session.usuario);
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
