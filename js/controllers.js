var app = angular.module('domisilapp.controllers', ['ui.router', 'ngAnimate', 'satellizer', 'LocalStorageModule', 'mgcrea.ngStrap'])


// home '/' controller
app.controller('HomeCtrl', ['$scope', 'localStorageService','Cuenta', '$auth', '$http', function($scope, localStorageService, Cuenta, $auth, $http){
	// Cuenta.getProfile()
	// 	.success(function(data) {
 //          $scope.user = data;
 //          // console.log($scope.user[0].usuario);
 //    	});

	var id = localStorageService.get('idUser');
	if (id != null) {
		$http.get('https://api-domi.herokuapp.com/api/users/'+id)
			.success(function(data) {
				$scope.user = data;
		    })
			.error(function(data) {
					// $scope.respuesta = "Error en la actualización!";
					console.log('Error: ' + data);
			});
	}

	$scope.autenticar = function() {
      return $auth.isAuthenticated();
    };
}]);

// controlador para la administración de la cuenta de usuario
app.controller('PerfilCtrl',['$scope', 'Cuenta', '$http', 'localStorageService', function($scope, Cuenta, $http, localStorageService){
	$scope.ver_clave = true;

	// cargo los datos del usuario
	var id = localStorageService.get('idUser');
	if (id != null) {
		$http.get('https://api-domi.herokuapp.com/api/users/'+id)
			.success(function(data) {
          // $scope.user = data;
          $scope.usuario = data[0].usuario;
          $scope.nombre = data[0].nombre;
          $scope.email = data[0].email;
          $scope.telefono = data[0].telefono;
          $scope.facebook = data[0].facebook;
          console.log($scope.facebook);
        if ($scope.facebook != undefined) {
        	$scope.ver_clave = false;
        }else{
        	$scope.ver_clave = true;
        }
        })
		.error(function(data) {
				// $scope.respuesta = "Error en la actualización!";
				console.log('Error: ' + data);
		});

		}

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


// controlador para gestionar el acceso a las empresas al sistema
app.controller('EmpresaCtrl', ['$scope', 'perfilEmpresa', '$auth', 'localStorageService', '$location', '$http', function($scope, perfilEmpresa, $auth, localStorageService, $location, $http){
	    // traigo los datos de la empresa
	perfilEmpresa.getEmpresa()
		.success(function(data){
			// console.log(data);
			$scope.empresa = data;
	});

	$scope.autenticar = function() {
      return $auth.isAuthenticated();
    };

    $scope.login = function(){
		console.log($scope.password);
		$auth.login({
			usuario: $scope.usuario,
			password: $scope.password,
			roll: 'Empresa'
		})
		.then(function(data){
			// si ha ingresado correctamente, lo tratamos aqui
			// podemos tambien redigirle a una ruta
			// Compra.servicio.userLocal = vm.usuario;
			$scope.empresa = data.data.empresa;
			console.log(data);
			console.log('ID: '+data.data.empresa._id);
			localStorageService.set('empresaId', data.data.empresa._id);
			$location.path('/empresa');
		})
		.catch(function(response){
			// si ha habido errores
			console.log(response.data.message);
			console.log(response.data.result);
			console.log(response.data.pwd);
			console.log(response.data.llega);
		});

	}

	var id = localStorageService.get('empresaId');
	if (id != null) {
		$http.get('https://api-domi.herokuapp.com/api/servicesAsignar/'+id)
			.success(function(data) {
				// console.log(data);
				// console.log('Servicios Pendientes: '+data.pendientes);
				// console.log('Servicios Asignados: '+data.asignados);
				$scope.pendientes = data.pendientes;
				$scope.asignados = data.asignados;
				console.log(data.dataAsignados);
				$scope.serviciosPendientes = data.data;
				$scope.serviciosAsignados = data.dataAsignados;
		    })
			.error(function(data) {
					// $scope.respuesta = "Error en la actualización!";
					console.log('Error');
					console.log(data);
			});
	}

	// traigo todos los domisiliarios disponibles
	var id = localStorageService.get('empresaId');
	if (id != null) {
		$http.get('https://api-domi.herokuapp.com/api/domiEstado/'+id)
			.success(function(data) {
				// console.log(data);
				$scope.domiDisponibles = data.data;
		    })
			.error(function(data) {
					// $scope.respuesta = "Error en la actualización!";
					console.log('Error');
					console.log(data);
			});
	}

	$scope.asignarDomi = function(id){
		// idSerice = id;
		localStorageService.set('idService', id);
	};

	// funcion para asignar el servicio a un domisiliario
	$scope.asignarService = function(){
		var idService = localStorageService.get('idService');
		console.log(idService);
		var service = {
			estadoService: 'Asignado',
			idDomisiliario: idService
		};
		$http.put('https://api-domi.herokuapp.com/api/service/' + idService, service)
			.success(function(data){
				console.log('Actualizo');
				console.log(data);
			})
			.error(function(err){
				console.log(err);
			});
	};

	
}]);//fin controlador empresa

// controlador para gestionar los domisiliarios por empresas
app.controller('DomisiliariosCtrl', ['$scope', '$http', 'localStorageService', function($scope, $http,localStorageService){
	// cargo los domisiliarios de la empresa
	var idEmpresa = localStorageService.get('empresaId');
	if (idEmpresa != null) {
		$http.get('https://api-domi.herokuapp.com/api/domiciliariosEmpresa/'+idEmpresa)
			.success(function(data){
				// console.log(data.data);
				$scope.domi = data.domisiliarios;
				$scope.domisiliarios = data.data;
			})
			.error(function(err){
				console.log(err);
			});
	}

	// funcion para registrar un domisiliario
	$scope.ver = false;
	$scope.addDomisiliario = function(){
		var file = $scope.foto;
		var idEmpresa = localStorageService.get('empresaId');
		var domisiliario = {
			nombre: $scope.nombre,
			numCedula: $scope.numCedula,
			email: $scope.email,
			telefono: $scope.telefono,
			idEmpresa: idEmpresa,
			foto: file.name
		};

		var file = $scope.foto;
        // console.log(file.name);
        var fd = new FormData();
        // fd.append('nombreEmpresa', $scope.nombreEmpresa);
        // fd.append('nitEmpresa', $scope.nitEmpresa);
        // fd.append('tarifaKm', $scope.tarifaKm);
        // fd.append('telefono', $scope.telefono);
        // fd.append('email', $scope.email);
        // fd.append('roll', $scope.roll);
        fd.append('logoEmpresa', file);

		// petición al api para regstrar domisiliario
		$http.post('https://api-domi.herokuapp.com/api/domiciliarios', domisiliario)
			// si todo sale bein
			.success(function(data) {
				upload(fd);
				$scope.ver = true;
				$scope.respuesta = "Los datos fueron registrados!";
				// console.log(data);

			})
			// si hay error
			.error(function(data) {
				$scope.respuesta = "Error en el registro!";
				console.log('Error: ' + data);
			});



	}; // fin funcion addDomisisliario
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


	// funcion para editar un domisiliario por medio de su ID
	$scope.editarDomisiliario = function(domisiliario){
		$scope.nombre_domi = domisiliario.nombre;
		$scope.numCedula_domi = domisiliario.numCedula;
		$scope.email_domi = domisiliario.email;
		$scope.telefono_domi = domisiliario.telefono;
		$scope.foto = domisiliario.foto;

		console.log('Nombre: '+$scope.nombre_domi);
	};
}]); //fin controlador de domisiliarios


// controlador para gestionar el informe de servicios 
app.controller('InformeServiceCtrl', ['$scope', function($scope){

}]);//fin controlador informe servicio





// controlador para la gestion y control de servicios realizados por el usuario
app.controller('MyservicesCtrl', ['$scope', 'ServicioUser', '$location', function($scope, ServicioUser, $location){
	// traigo todos los servicios del usuario actual
	$scope.hayserives = true;
	ServicioUser.getServiceUser()
		.success(function(servicios){
			$scope.services = servicios;
			if (servicios !="") {$scope.hayserives=false};
		});

		$scope.newService = function(){
			$location.url('/home');
		}

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
	$scope.ver_otro = false;
	geolocation.buscar();
	$scope.activo = false;
	// $scope.selected = 'Sobre';

	// Validación de la ciudad
	// if ($scope.ciudad !== undefined) {
	// 	console.log('ciudad: '+ $scope.ciudad);
	// }
	var origen = '';
 	// obtener posición del usuario

 	$scope.view_position = function(){
 		// setTimeout(function(){
 		// $scope.$apply(function(){
 		// $scope.origen = '';
 		console.log('Aqui voy');
 		  	if (navigator.geolocation) {
	  		var geocoder = new google.maps.Geocoder();
	  		navigator.geolocation.getCurrentPosition(function(position){
	  			var lat = position.coords.latitude;
	  			var lng = position.coords.longitude;
	  			console.log('LAT: ' + lat + ' LON: ' + lng);

	  			var latlng = new google.maps.LatLng(lat, lng);
	  			geocoder.geocode({'latLng': latlng}, function(results, status){
	  				if (status == google.maps.GeocoderStatus.OK) {
	  					if (results[0]) {
	  						// console.log('Dirección: ' +results[0].formatted_address);
	  						var origen = results[0].formatted_address;
	  						console.log('origen: '+origen);

	  						if ($scope.activo) {
	  						// setTimeout(function(){
	  						// 	$scope.$apply(function(){
	  						// 		$scope.origen = origen;
	  						// 	});
	  						// }, 100);
	  						
	  						$scope.$apply(function(){
	  						$scope.origen = origen;

	  						});

	  					}else{
	  						$scope.$apply(function(){
	  						$scope.origen = '';

	  						});
	  					}
	  					}
	  				}
	  			});
	  		});
	  	}
	  	// })
	  	// }, 500);
 	}	

	// Validación de tipo de serivicio - cuando el usuario selecciona otro
	// le deberia mostrar la opcion para ingresar el tipo de servicio
	$scope.otroServicio = function(){
		if ($scope.tipoServicio == 'Otro') {
			console.log($scope.tipoServicio);
			$scope.ver_otro = true;
			// $scope.tipoServicio = $scope.otro;
		}else{
			$scope.ver_otro = false;
		}
	}

		
	//Funcion para mostrar el mapa al hacer clic en Cotizar
	$scope.mostrarInfo = function(){
		
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
				$scope.distancia = $scope.distancia;
		  		$scope.tipoServicio = $scope.tipoServicio;
		  		$scope.destino = $scope.destino;
		  		$scope.origen = $scope.origen;
				$scope.ver = true;
			})
		}, 200);
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
	$scope.servicioSeleccionado = function (id, valor, tipo){
		// creo un objeto con el servicio para almacenarlo en el localstorage

		if ($scope.otro !== "") {
			$scope.tipoServicio = $scope.otro;
		}

		console.log($scope.tipoServicio);

		var service = {
			tipoServicio: $scope.tipoServicio,
			idEmpresa: id,
			estado: "En proceso",
			origen: $scope.origen,
			destino: $scope.destino,
			valorService: valor
		};
		console.log(service)

		// almeceno el servicio en el navegador del cliente
		localStorageService.set('service', service);
		$location.url("/service");
	};

}]);
//Find controlador cotizacion


//Controlador para registrar una nueva empresa al sistema
app.controller('RegistroCtrl',['$scope', '$http', '$location', 'localStorageService', '$auth', function($scope, $http, $location, localStorageService, $auth){
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
		
		$scope.roll = "Empresa";

        var file = $scope.logoEmpresa;
        console.log(file.name);
        var fd = new FormData();
        // fd.append('nombreEmpresa', $scope.nombreEmpresa);
        // fd.append('nitEmpresa', $scope.nitEmpresa);
        // fd.append('tarifaKm', $scope.tarifaKm);
        // fd.append('telefono', $scope.telefono);
        // fd.append('email', $scope.email);
        // fd.append('roll', $scope.roll);
        fd.append('logoEmpresa', file);

        var empresa = {
        	usuario: $scope.usuarioEmpresa,
        	password: $scope.passwordEmpresa,
        	nombreEmpresa: $scope.nombreEmpresa,
        	nitEmpresa: $scope.nitEmpresa,
        	tarifaKm: $scope.tarifaKm,
        	telefono: $scope.telefono,
        	email: $scope.email,
        	logoEmpresa: file.name,
        	roll: 'Empresa'
        };

        // console.log(empresa);
        // $http.post('https://api-domi.herokuapp.com/api/emp-domiciliarios', fd, {
        $auth.signup(empresa)
            .then(function(response){
            	// console.log(response.data.empresa);
            	// console.log(response.empresa.logoEmpresa);
                //Guardamos la url de la imagen y hacemos que la muestre.
                // fd.append('nombre', response.empresa.logoEmpresa);
				// console.log('Logo: '+response.data.logoEmpresa);
				// var pathimg = response.data.logoEmpresa;
                upload(fd);
                $scope.img=true;
                // $scope.empresas = data;
                // $scope.emp = response.data.empresa;
                $scope.estado = true;
				$scope.respuesta = "El registro fue éxitoso!";
				localStorageService.set('empresaId', response.data.empresa._id);
				// $location.url('/empresa');

            })
            .catch(function(response){	
			// si ha habido errors, llegaremos a esta función 
			console.log('ERROR');
			});
        // });
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
app.controller('ServiceCrtl', ['$scope', '$location', '$auth', 'Empresa', 'localStorageService', 'Cuenta', '$http', function($scope, $location, $auth, Empresa, localStorageService, Cuenta, $http){
	$scope.mostrarLogin = true;
	$scope.mail_face = false;

	var id = localStorageService.get('idUser');
		if (id != null) {
			$http.get('https://api-domi.herokuapp.com/api/users/'+id)
				.success(function(data) {
					console.log(data);
			        $scope.facebook = data[0].facebook;
			      	console.log('ID de facebook '+$scope.facebook);
			    	if ($scope.facebook != undefined) {
			    		$scope.mail_face = true;
			    		$scope.fb_email = data[0].email;
			        }else{
			        	$scope.mail_face = false;
			        }
			    })
				.error(function(data) {
						// $scope.respuesta = "Error en la actualización!";
						console.log('Error: ' + data);
				});
		}

	// Cuenta.getProfile()
		

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
	$scope.tipo = service.tipoServicio;
	// $scope.ciudad = service.ciudad;
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
			usuario: $scope.usuario_up,
			password: $scope.password_up
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
		// if ($scope.tipoPago == "") {};

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
		if ($scope.fb_email != '') {
			var email = {
				email: $scope.fb_email
			}
			var id = localStorageService.get('idUser');
			$http.put('https://api-domi.herokuapp.com/api/useremail/'+id, email)
			.success(function(data) {
				$scope.respuesta = "Email actualizado!";
				console.log(data);
				localStorageService.set('tipoPago',$scope.tipoPago);
				$location.path('/resumen');

			})
			.error(function(data) {
				$scope.respuesta = "Error en la actualización!";
				console.log('Error: ' + data);
			});
		}
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

		var id = localStorageService.get('idUser');
		if (id != null) {
			$http.get('https://api-domi.herokuapp.com/api/users/'+id)
				.success(function(data) {
					$scope.usuario = data;
			    })
				.error(function(data) {
						// $scope.respuesta = "Error en la actualización!";
						console.log('Error: ' + data);
				});
		}
		
		// Cuenta.getProfile()
		// 	.success(function(data) {
	 //          $scope.usuario = data;
	 //        });
	    

		var service = localStorageService.get('service');
		var tipoPago = localStorageService.get('tipoPago');
	   
		$scope.titlePage = "Confirmación y envío del servicio";
		$scope.tipo = service.tipoServicio;
		// $scope.ciudad = service.ciudad;
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
			dirDestino: $scope.destino,
			comentario: '',
			tipoServicio: service.tipoServicio
		}

		$scope.ver = false;
		// funcion para enviar el servicio al server
		$scope.sendService = function(){
			myService.comentario = $scope.comentario;
			console.log($scope.comentario);
			$scope.ver = true;
			$http.post('https://api-domi.herokuapp.com/api/service', myService)
			.success(function(data) {
				$scope.respuesta = "Su servicio se envío éxitosamente!";
				console.log(data);

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
			localStorageService.remove('empresaId');
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