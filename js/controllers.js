var app = angular.module('domisilapp.controllers', ['ui.router', 'ngAnimate', 'satellizer', 'LocalStorageModule', 'mgcrea.ngStrap'])


// home '/' controller
app.controller('HomeCtrl', ['$scope', 'localStorageService','Cuenta', '$auth', function($scope, localStorageService, Cuenta, $auth){
	Cuenta.getProfile()
		.success(function(data) {
          $scope.user = data;
          // console.log($scope.user[0].usuario);
    	});

	$scope.autenticar = function() {
      return $auth.isAuthenticated();
    };
}]);

// controlador para la administración de la cuenta de usuario
app.controller('PerfilCtrl',['$scope', 'Cuenta', '$http', 'localStorageService', function($scope, Cuenta, $http, localStorageService){
	// cargo los datos del usuario
	Cuenta.getProfile()
		.success(function(data) {
          // $scope.user = data;
          $scope.usuario = data[0].usuario;
          $scope.nombre = data[0].nombre;
          $scope.email = data[0].email;
          $scope.telefono = data[0].telefono;
        });

    $scope.editPerfile = function(){
    	var user = {
    		usuario: $scope.usuario,
    		password: $scope.password,
    		nombre: $scope.nombre,
    		email: $scope.email,
    		telefono: $scope.telefono
    	};
    console.log(user);

    var id = localStorageService.get('idUser');
    $http.put('https://api-domi.herokuapp.com/api/users/'+id, user)
    	.success(function(data){
    		console.log(data);
    	});
    };

}]);

// controlador para la gestion y control de servicios realizados por el usuario
app.controller('MyservicesCtrl', ['$scope', 'ServicioUser', function($scope, ServicioUser){
	// traigo todos los servicios del usuario actual
	$scope.hayserives = true;
	ServicioUser.getServiceUser()
		.success(function(servicios){
			$scope.services = servicios;
			if (servicios !="") {$scope.hayserives=false};
		});
}]);//fin controlador MyservicesCtrl

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
app.controller('cotizadorController', ['$scope', '$http', '$location', 'geolocation','localStorageService', 'Empresa', function($scope, $http, $location, geolocation, localStorageService, Empresa){

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
	  $http.get('https://api-domi.herokuapp.com/api/emp-domiciliarios').
	  	success(function(data, status, headers, config){
	  		$scope.empresas = data;
	  	});
	};

	//Funcion para pasar los datos del servicios seleccionado por
	//el usuario a la siguiente vista donde realizará la validación
	$scope.servicioSeleccionado = function (id, valor){
		// creo un objeto con el servicio para almacenarlo en el localstorage
		var service = {
			idEmpresa: id,
			estado: "En proceso",
			origen: $scope.origen,
			destino: $scope.destino,
			valorService: valor
		};

		// almeceno el servicio en el navegador del cliente
		localStorageService.set('service', service);
		$location.url("/service");
	};

}]);
//Find controlador cotizacion


//Controlador para registrar una nueva empresa al sistema
app.controller('RegistroCtrl',['$scope', '$http', function($scope, $http){
	$scope.empresa = {};
	$scope.registrarEmpresa = function(){
		// console.log('Logo: '+$scope.empresa.logoEmpresa);
		// $http.post('https://api-domi.herokuapp.com/api/emp-domiciliarios', $scope.empresa)
		// 	.success(function(data) {
		// 		//$scope.empresa = {}; // Borramos los datos del formulario
		// 		$scope.empresas = data;
		// 		$scope.respuesta = "El registro fue éxitoso!";
		// 		console.log($scope.empresas);
		// 	})
		// .error(function(data) {
		// 	$scope.respuesta = "Error en el registro!";
		// 	console.log('Error: ' + data);
		// });

        var file =$scope.logoEmpresa;
        var fd = new FormData();
        fd.append('nombreEmpresa', $scope.nombreEmpresa);
        fd.append('nitEmpresa', $scope.nitEmpresa);
        fd.append('tarifaKm', $scope.tarifaKm);
        fd.append('telefono', $scope.telefono);
        fd.append('email', $scope.email);
        fd.append('logoEmpresa', file);

        // console.log(fd);
        $http.post('https://api-domi.herokuapp.com/api/emp-domiciliarios', fd, {
            transformRequest: angular.identity, 
            headers: {'Content-Type': undefined}
            })
            .success(function(response){
                //Guardamos la url de la imagen y hacemos que la muestre.
                fd.append('nombre', response.data.logoEmpresa);
				console.log('Logo: '+response.data.logoEmpresa);
				// var pathimg = response.data.logoEmpresa;
                upload(fd);
                $scope.img=true;
                // $scope.empresas = data;
				$scope.respuesta = "El registro fue éxitoso!";
            })
            .error(function(response){

        });
	};

	function upload (form) {
		$http.post('http://domisil.co/uploads.php',form, {
		    transformRequest: angular.identity, 
            headers: {'Content-Type': undefined}
            })
            .success(function(response){
				console.log('Respuesta: '+response);
            })
            .error(function(response){
        });
	};

}]);
//Fin controller empresa


//Controlador para gestionar toda la parte del servicios hasta el envio del mismo
app.controller('ServiceCrtl', ['$scope', '$location', '$auth', 'Empresa', 'localStorageService', function($scope, $location, $auth, Empresa, localStorageService){
	$scope.mostrarLogin = true;

	//Valido que el user este logueado para mostrarle el login y el registro
	if ($auth.isAuthenticated()) {
		$scope.mostrarLogin = false;
	}
	
	// funcion para verificar que hay un usuario logueado
	$scope.autenticar = function() {
      return $auth.isAuthenticated();
    };

    // traigo los datos de la empresa
	Empresa.getEmpresa()
		.success(function(data){
			$scope.empresa= data[0].nombreEmpresa;
	});

	service = localStorageService.get('service');
	$scope.resumen = "Resumen del servicio";
	// $scope.empresa = Compra.servicio.empresa;
	$scope.valor = service.valorService;
	$scope.origen = service.origen;
	$scope.destino = service.destino;
	$scope.estado = service.estado;

	// var vm = this;
	$scope.login = function(){
		$auth.login({
			usuario: $scope.usuario,
			password: $scope.password
		})
		.then(function(data){
			// si ha ingresado correctamente, lo tratamos aqui
			// podemos tambien redigirle a una ruta
			localStorageService.set('tipoPago',$scope.tipoPago);
			localStorageService.set('idUser', data.data.userId);
			$location.path('/resumen');
		})
		.catch(function(response){
			// si ha habido errores 
			console.log("ERROR EN EL LOGIN: "+response);
		});

	};

	$scope.signup = function(){
		$auth.signup({
			nombre: $scope.nombre,
			email: $scope.email,
			telefono: $scope.telefono,
			usuario: $scope.usuario,
			password: $scope.password
		})
		.then(function(data){
			//si ha sido registrado correctamente 
			// redirigimos a otra parte
			localStorageService.set('tipoPago',$scope.tipoPago);
			localStorageService.set('idUser', data.data.userId);
			$location.path('/resumen');
		})
		.catch(function(response){
			// si ha habido errors, llegaremos a esta función 
			console.log('ERROR');
		});
	}

	// login facebook
	$scope.loginFace = function(provider) {
		app.config(function($authProvider){
			$authProvider.loginRedirect = '/resumen';
			$authProvider.baseUrl = '/resumen';
		});
		// defino ruta para retornar si el login es éxitoso

    	$auth.authenticate(provider)
	        .then(function(data) {
	          // console.log(data.data.userId);
			localStorageService.set('idUser', data.data.userId);//almaceno el id del usuario en el localstorage
			localStorageService.set('tipoPago',$scope.tipoPago);
	          // $alert({
	          //   content: 'You have successfully logged in',
	          //   animation: 'fadeZoomFadeDown',
	          //   type: 'material',
	          //   duration: 3
	          // });
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

	$scope.validarService = function(){
		localStorageService.set('tipoPago',$scope.tipoPago);
		$location.path('/resumen');
	}

}]);
//Fin controller servicio


//Controlador para mostrar el resumen final del servico
//y enviar el servicio para que sea procesado por la 
//empresa seleccionada
app.controller('ResumenCrtl', ['$scope', '$auth', '$location', 'Empresa', 'localStorageService', '$http', 'Cuenta', function($scope, $auth, $location, Empresa, localStorageService, $http, Cuenta){
	if (!$auth.isAuthenticated()) {
	    $location.url('/home');
    }else{


    	// si no existe un servicio lo redirijo al home de la pagina
    	if (localStorageService.get('service') == null) {
    		$location.url('/home');
    	}else{

    	// traigo los datos de la empresa
    	Empresa.getEmpresa()
		.success(function(data){
			$scope.empresa= data[0].nombreEmpresa;
			
		});

		// traigo los datos del usuario
		
		Cuenta.getProfile()
			.success(function(data) {
	          $scope.usuario = data;
	        });
	    

		var service = localStorageService.get('service');
		var tipoPago = localStorageService.get('tipoPago');
	   
		$scope.titlePage = "Confirmación y envío del servicio";
		$scope.tipoPago = tipoPago;
		$scope.origen = service.origen;
		$scope.destino = service.destino;
		$scope.valor = service.valorService;
		$scope.estado = service.estado;

		// preparo el servicio para enviarlo al server
		var myService = {
			userId: localStorageService.get('idUser'),
			tipoDePago: $scope.tipoPago,
			valorPedido: $scope.valor,
			idEmpresa: service.idEmpresa,
			estadoService: 'Esperando confirmacion',
			dirOrigen: $scope.origen,
			dirDestino: $scope.destino
		}

		$scope.ver = false;
		// funcion para enviar el servicio al server
		$scope.sendService = function(){
			$scope.ver = true;
			$http.post('https://api-domi.herokuapp.com/api/service', myService)
			.success(function(data) {
				$scope.respuesta = "Su servicio se envío éxitosamente!";

			})
			.error(function(data) {
				$scope.respuesta = "Error en el registro!";
				console.log('Error: ' + data);
			});
		}


		// funcion para imprimir
		// AUN NO ESTA TERMINADA
		$scope.print = function(div){
			var printContents = document.getElementById(div).innerHTML;
		  	var popupWin = window.open('', '_blank', 'width=600,height=600');
		  	popupWin.document.open()
		  	popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="css/main.css" /></head><body onload="window.print()">' + printContents + '</html>');
		  	popupWin.document.close();
		};
		}
	}
}]);

// para registrar usuarios nuevos al sistema
app.controller('SignUpController', ['$scope', '$auth', '$location', 'localStorageService', function($scope, $auth, $location, localStorageService){
	var vm = this;
	this.signup = function(){
		$auth.signup({
			nombre: vm.nombre,
			email: vm.email,
			telefono: vm.telefono,
			usuario: vm.usuario,
			password: vm.password
		})
		.then(function(data){
			//si ha sido registrado correctamente 
			// redirigimos a otra parte
			console.log(data.data.userId);
			localStorageService.set('idUser', data.data.userId);
			$location.path('/home');
		})
		.catch(function(response){
			// si ha habido errors, llegaremos a esta función 
			console.log('ERROR');
		});
	}

	this.ver_registro = function(){
		$location.path('/registro');
	}
}]);

// para ingresar al sistema sesión user
app.controller('LoginController', ['$scope', '$auth', '$location', 'localStorageService', '$alert', function($scope, $auth, $location, localStorageService, $alert){
	var vm = this;

	this.login = function(){
		console.log(vm.password);
		$auth.login({
			usuario: vm.usuario,
			password: vm.password
		})
		.then(function(data){
			// si ha ingresado correctamente, lo tratamos aqui
			// podemos tambien redigirle a una ruta
			// Compra.servicio.userLocal = vm.usuario;
			console.log(data.data.userId);
			localStorageService.set('idUser', data.data.userId);
			$location.path('/home');
		})
		.catch(function(response){
			// si ha habido errores
			console.log(response.data.message);
			console.log(response.data.result);
			console.log(response.data.pwd);
			console.log(response.data.llega);
		});

	}

	this.authenticate = function(provider) {
      $auth.authenticate(provider)
        .then(function(data) {
        	// console.log(data.data.userId);
			localStorageService.set('idUser', data.data.userId);//almaceno el id del usuario en el localstorage
			console.log(data);
			console.log(data.data.message);

          // $alert({
          //   content: 'You have successfully logged in',
          //   animation: 'fadeZoomFadeDown',
          //   type: 'material',
          //   duration: 3
          // });
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
			localStorageService.remove('service');
			localStorageService.remove('tipoPago');
			$location.path('/');
		});

}]);

// directiva para enviar la imagen al server
// esto deberia estar en un archivo independiente, es solo que es mi primera directiva xD
app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
 
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}])