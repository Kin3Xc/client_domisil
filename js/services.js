var app = angular.module('domisilapp.services', ['LocalStorageModule'])

//Servicio para consultar los datos de las cuentas de usuarios

app.factory('Cuenta', function($http, localStorageService) {
    return {
      getProfile: function() {
      	var id = localStorageService.get('idUser');
        return $http.get('http://localhost:8000/api/users/'+id);
      }
    };
});


app.factory('Empresa', function($http, localStorageService) {
    return {
      getEmpresa: function() {
      	var id = localStorageService.get('idEmpresa');
        return $http.get('http://localhost:8000/api/emp-domiciliarios/'+id);
      }
    };
});

//Servicio que es inyectado en varios controladores para
//poder tener acceso a los datos en diferentes vistas
app.factory("Compra", function() {
  return {
    servicio: {}
  };
});

//Servicio utilizado para consumir el API de google maps
app.factory('geolocation', function(){
	service = {};

	var originLatLon="";
	var destinyLatLon="";
	// var directionsService = null;
	// var directionsDisplay = null;

	service.buscar = function(){
		directionsService = new google.maps.DirectionsService();
		directionsDisplay = new google.maps.DirectionsRenderer();

		var options = {
		  componentRestrictions: {country: 'CO'}
		};

		var Origen = new google.maps.places.Autocomplete((document.getElementById('origen')),options);
		google.maps.event.addListener(Origen, 'place_changed', function() {
			var place = Origen.getPlace();
			originLatLon = place.geometry.location;
			console.log(originLatLon);
		});

		var Destino = new google.maps.places.Autocomplete((document.getElementById('destino')),options);
		google.maps.event.addListener(Destino, 'place_changed', function() {
			var place = Destino.getPlace();
			destinyLatLon = place.geometry.location;
			console.log(destinyLatLon);
		});
		return {origin:originLatLon, destination:destinyLatLon}
	}
	return service;
});
