
var app = angular.module('domisilapp', ['domisilapp.controllers', 'domisilapp.services']);

//Configuración de rutas de la aplicacion web
app.config(function($stateProvider, $authProvider, $urlRouterProvider){

	// parametros de configuracion
	$authProvider.loginUrl = "http://localhost:8000/auth/login";
	$authProvider.signupUrl = "http://localhost:8000/auth/signup";

	$authProvider.tokenName = "token";
	$authProvider.tokenPrefix = "Domisil_App";

	// defino rutas 
	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: 'partials/home.html',
			controller: 'HomeCtrl'
			// resolve: {
	  //         authenticated: function($q, $location, $auth) {
	  //           var deferred = $q.defer();

	  //           if (!$auth.isAuthenticated()) {
	  //             $location.path('/login');
	  //           } else {
	  //             deferred.resolve();
	  //           }
	  //           return deferred.promise;
	  //         }
	  //       }
		})

		.state('registro',{
			url: '/registro',
			templateUrl: 'partials/registro.html',
			controller: 'RegistroCtrl'
		})

		.state('service',{
			url: '/service',
			templateUrl: 'partials/service.html',
			controller: 'ServiceCrtl',
			controllerAs: 'login'
		})

		.state('resumen',{
			url:'/resumen',
			templateUrl: 'partials/resumen.html',
			controller: 'ResumenCrtl'
		})
		.state('login', {
			url:'/login',
			templateUrl: 'partials/login.html',
			controller: 'LoginController',
			controllerAs: 'login'
		})

		.state('signup', {
			url: '/signup',
			templateUrl: 'partials/signup.html',
			controller: 'SignUpController',
			controllerAs: 'signup'
		})
		.state('logout', {
			url: '/logout',
			templateUrl: null,
			controller: 'LogoutController'
		})
		.state('private', {
			url: '/private',
			templateUrl: 'partials/private.html',
			controller: 'PrivateController',
			controllerAs: 'private'
		});

		$urlRouterProvider.otherwise('/');

		$authProvider.facebook({
	      clientId: '104801699865242'
	    });
});



















