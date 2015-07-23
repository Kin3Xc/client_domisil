var app = angular.module('domisilapp.controllers', ['ui.router', 'ngAnimate', 'satellizer', 'LocalStorageModule', 'mgcrea.ngStrap'])


// home '/' controller
app.controller('HomeCtrl', ['$scope', 'localStorageService','Cuenta', '$auth', function($scope, localStorageService, Cuenta, $auth){
	var local = localStorageService.get('idUser');
	if (local != "") {
		Cuenta.getProfile()
			.success(function(data) {
	          $scope.user = data;
	          // console.log($scope.user[0].usuario);
	        });
	}
	$scope.autenticar = function() {
      return $auth.isAuthenticated();
    };
}]);


app.controller('PrivateController', ['$scope', '$auth', '$location', function($scope, $auth, $location){
	if (!$auth.isAuthenticated()) {
        console.log('no estas logueado');
        $scope.mensaje = 'No estas logueado, logueate';
        $location.url('/login');
    }else{
    	$scope.mensaje = 'ahora si';	
    }
	
}]);

// para enviar el token con cada peticion http
app.config(['$httpProvider', 'satellizer.config', function($httpProvider, config){
	$httpProvider.interceptors.push(['$q', function($q){
		var tokenName = config.tokenPrefix ? config.tokenPrefix + '_' + config.tokenName : config.tokenName;
		return {
			request: function(httpConfig){
				var token = localStorage.getItem(tokenName);
				if(token && config.httpInterceptor){
					token = config.authHeader === 'Authorization' ? 'Bearer' + token: token;
					httpConfig.headers[config.authHeader] = token;
				}
				return httpConfig;
			},
			responseError: function(response){
				return $q.reject(response);
			}
		};
	}]);
}]);

// Creo un controlador para manejar la parte de la cotización
// del usuario
app.controller('cotizadorController', ['$scope', '$http', 'Compra', '$location', 'geolocation','localStorageService', 'Empresa', function($scope, $http, Compra, $location, geolocation, localStorageService, Empresa){

	$scope.ver = false;
	geolocation.buscar();
		
	//Funcion para mostrar el mapa al hacer clic en Cotizar
	$scope.mostrarInfo = function(){
	  	$scope.ver = true;
	  	var oirigin =null;
	  	var destination = null;

	  	ruta = geolocation.buscar();
	  	console.log(ruta.origin);

	  	if (ruta.origin == "") {
	  		origin = $scope.origen + ' Bogota, Colombia';
	  	}else{
	  		origin = ruta.origin;
	  	}

	  	if (ruta.destination == "") {
	  		destination = $scope.destino + ' Bogota, Colombia';
	  	}else{
	  		destination = ruta.destination;
	  	}
	  	console.log(origin);
	  	console.log(destination);

	  	var request = {
	  		origin: origin,
	  		destination: destination,
	  		travelMode: google.maps.TravelMode.DRIVING,
	  		provideRouteAlternatives:true
	  	};

		directionsService.route(request, function(response, status){
			if (status == google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(response);
				$scope.distancia = response.routes[0].legs[0].distance.value/1000;
				console.log($scope.distancia);
				// var a = Math.round($scope.distancia);
			}else{
				alert('No existen rutas entre ambos puntos');
			}

			setTimeout(function(){
				$scope.$apply(function(){
					$scope.distancia=$scope.distancia;
				})
			}, 100);
		});



		//Peticion get a la API para traer todas las epmresas y sus tarifas 
	  $http.defaults.headers.common["X-Custom-Header"] = "Angular.js";
	  $http.get('http://localhost:8000/api/emp-domiciliarios').
	  	success(function(data, status, headers, config){
	  		$scope.empresas = data;
	  	});
	};

	//Funcion para pasar los datos del servicios seleccionado por
	//el usuario a la siguiente vista donde realizará la validación
	$scope.servicioSeleccionado = function (id, valor){
		localStorageService.set('idEmpresa', id);

		// Compra.servicio.empresa = "TUSDOMICILIOS.COM";
		Compra.servicio.valor = valor;
		Compra.servicio.origen = $scope.origen;
		Compra.servicio.destino = $scope.destino;
		Compra.servicio.estado = "En proceso";
		Compra.servicio.tipoPago = $scope.tipoPago;

		$location.url("/service");
	};

}]);
//Find controlador cotizacion


//Controlador para registrar una nueva empresa al sistema
app.controller('RegistroCtrl',['$scope', '$http', function($scope, $http){
	$scope.empresa = {};
	$scope.registrarEmpresa = function(){
		console.log($scope.empresa);
			$http.post('http://localhost:8000/api/emp-domiciliarios', $scope.empresa)
			.success(function(data) {
					//$scope.empresa = {}; // Borramos los datos del formulario
					$scope.empresas = data;
					$scope.respuesta = "El registro fue éxitoso!";
					console.log('Se guardo esto: '+ $scope.empresas);
				})
			.error(function(data) {
				$scope.respuesta = "Error en el registro!";
				console.log('Error: ' + data);
			});
	};
}]);
//Fin controller empresa


//Controlador para gestionar toda la parte del servicios hasta el envio del mismo
app.controller('ServiceCrtl', ['$scope', 'Compra', '$location', '$auth', 'Empresa', function($scope, Compra, $location, $auth, Empresa){
	$scope.mostrarLogin = true;

	//Valido que el user este logueado para mostrarle el login y el registro
	if ($auth.isAuthenticated()) {
		console.log('Aqui');
		$scope.mostrarLogin = false;
	}
	
	$scope.autenticar = function() {
      return $auth.isAuthenticated();
    };

	Empresa.getEmpresa()
		.success(function(data){
			console.log(data[0].nombreEmpresa);
			$scope.empresa= data[0].nombreEmpresa;
			
	});


	$scope.resumen = "Resumen del servicio";
	// $scope.empresa = Compra.servicio.empresa;
	$scope.valor = Compra.servicio.valor;
	$scope.origen = Compra.servicio.origen;
	$scope.destino = Compra.servicio.destino;
	
	// $scope.resumenFinal = function (){
	// 	Compra.servicio.empresa = "TUSDOMICILIOS.COM";
	// 	Compra.servicio.valor = "CO$20.000";
	// 	Compra.servicio.origen = $scope.origen;
	// 	Compra.servicio.destino = $scope.destino;
	// 	$location.url("/resumen");
	// };

	var vm = this;
	this.login = function(){
		console.log('LOGIN XD');
		$auth.login({
			usuario: vm.usuario,
			password: vm.password
		})
		.then(function(data){
			// si ha ingresado correctamente, lo tratamos aqui
			// podemos tambien redigirle a una ruta
			console.log('Tipo: '+ $scope.tipoPago);
			Compra.servicio.tipoPago = $scope.tipoPago;
			$location.path('/resumen');
		})
		.catch(function(response){
			// si ha habido errores 
			console.log("ERROR EN EL LOGIN: "+response);
		});

	};

		$scope.signup = function(){
		console.log('REGISTRO XD');
		$auth.signup({
			usuario: $scope.usuario,
			password: $scope.password
		})
		.then(function(){
			//si ha sido registrado correctamente 
			// redirigimos a otra parte
			console.log('Tipo: '+ $scope.tipoPago);
			Compra.servicio.tipoPago = $scope.tipoPago;
			$location.path('/resumen');
		})
		.catch(function(response){
			// si ha habido errors, llegaremos a esta función 
			console.log('ERROR');
		});
	}

	$scope.validarService = function(){
		console.log('Tipo: '+ $scope.tipoPago);
		Compra.servicio.tipoPago = $scope.tipoPago;
		$location.path('/resumen');
	}

}]);
//Fin controller servicio


//Controlador para mostrar el resumen final del servico
//y enviar el servicio para que sea procesado por la 
//empresa seleccionada
app.controller('ResumenCrtl', ['$scope', 'Compra', '$auth', '$location', 'Empresa', 'localStorageService', '$http', function($scope, Compra, $auth, $location, Empresa, localStorageService, $http){
	if (!$auth.isAuthenticated()) {
	    console.log('no estas logueado');
	    $location.url('/home');
    }else{

    	Empresa.getEmpresa()
		.success(function(data){
			console.log(data[0].nombreEmpresa);
			$scope.empresa= data[0].nombreEmpresa;
			
		});
	   
		$scope.titlePage = "Confirmación y envío del servicio";
		$scope.tipoPago = Compra.servicio.tipoPago;
		$scope.origen = Compra.servicio.origen;
		$scope.destino = Compra.servicio.destino;
		// $scope.empresa = Compra.servicio.empresa;
		$scope.valor = Compra.servicio.valor;
		$scope.estado = Compra.servicio.estado;

		var myService = {
			userId: localStorageService.get('idUser'),
			tipoDePago: $scope.tipoPago,
			valorPedido: $scope.valor,
			idEmpresa: localStorageService.get('idEmpresa'),
			estadoService: 'Esperando confirmacion',
			dirOrigen: $scope.origen,
			dirDestino: $scope.destino
		}

		$scope.sendService = function(){
			$http.post('http://localhost:8000/api/service', myService)
			.success(function(data) {
					//$scope.empresa = {}; // Borramos los datos del formulario
					// $scope.empresas = data;
					$scope.respuesta = "El registro fue éxitoso!";
					console.log('Se guardo esto: '+ myService);
				})
			.error(function(data) {
				$scope.respuesta = "Error en el registro!";
				console.log('Error: ' + data);
			});
		}

		
		$scope.print = function(div){
			var printContents = document.getElementById(div).innerHTML;
		  	var popupWin = window.open('', '_blank', 'width=600,height=600');
		  	popupWin.document.open()
		  	popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="css/main.css" /></head><body onload="window.print()">' + printContents + '</html>');
		  	popupWin.document.close();
		};
	}
}]);

// para registrar usuarios nuevos al sistema
app.controller('SignUpController', ['$scope', '$auth', '$location', function($scope, $auth, $location){
	var vm = this;
	this.signup = function(){
		$auth.signup({
			usuario: vm.usuario,
			password: vm.password
		})
		.then(function(){
			//si ha sido registrado correctamente 
			// redirigimos a otra parte
			$location.path('/home');
		})
		.catch(function(response){
			// si ha habido errors, llegaremos a esta función 
			console.log('ERROR');
		});
	}
}]);

// para ingresar al sistema sesión user
app.controller('LoginController', ['$scope', '$auth', '$location', 'Compra', 'localStorageService', '$alert', function($scope, $auth, $location, Compra, localStorageService, $alert){
	var vm = this;

	this.login = function(){
		$auth.login({
			usuario: vm.usuario,
			password: vm.password
		})
		.then(function(data){
			// si ha ingresado correctamente, lo tratamos aqui
			// podemos tambien redigirle a una ruta
			Compra.servicio.userLocal = vm.usuario;
			console.log(data.data.userId);
			localStorageService.set('idUser', data.data.userId);
			$location.path('/home');
		})
		.catch(function(response){
			// si ha habido errores 
			console.log(response.data.message);
		});

	}

	this.authenticate = function(provider) {
		console.log('Aqui');
      $auth.authenticate(provider)
        .then(function() {
        	// console.log('Ingresado');
          $alert({
            content: 'You have successfully logged in',
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
        })
        .catch(function(response) {
        	// console.log('Error');
        	console.log(response);
          $alert({
            content: response.data,
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
        });
    };

}]);

// para cerrar sesión user
app.controller('LogoutController', ['$scope', '$auth', '$location', 'localStorageService', function($scope, $auth, $location, localStorageService){
    if (!$auth.isAuthenticated()) {
        return;
    }

	$auth.logout()
		.then(function(){
			// desconectamos al usuario
			localStorageService.remove('idUser');
			localStorageService.remove('idEmpresa');
			$location.path('/');
		});

}]);
