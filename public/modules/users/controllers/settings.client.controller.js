'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$timeout','$location', 'Users', 'Authentication',  'Databases', '$modal',
	function($scope, $http, $timeout, $location, Users, Authentication, Databases, $modal) {

		$scope.accountResult = false;
		$scope.user ={};
		angular.copy(Authentication.user, $scope.user); //Deep copy so that changes can be reverted

		$scope.originalUser = {}; //Keep the original copy of the user
		angular.copy($scope.user, $scope.originalUser);
		
		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		$scope.authentication = Authentication;

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid){
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);
	
				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		$scope.cancelChanges = function(){
			Authentication.user = $scope.originalUser;
		};

		// Redirect to View profile page after a certain number of ms
		$scope.redirectToViewProfile = function(ms){
			$timeout(function(){
					$location.path('/settings/profile');
				},ms);
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		//Modal settings and functions
		$scope.open = function (size) {
			  $scope.modalInstance = $modal.open({
		      templateUrl: 'delete-modal.client.view.html',
		      controller: 'SettingsController',
		      size: size,
		      scope: $scope
		   	 });
		};

		$scope.deleteAccount = function(passwordModal){
			//Need backend function to verify password
			$scope.success = $scope.error = null;
			$http.post('/users/verify', $scope.passwordModal).success(function(response) {
				
				//console.log($scope.authentication.user);
				Authentication.user = response;
				$scope.modalInstance.dismiss('delete');
				// Redirect to the sign in page
				$location.path('/');

				//Need to pass value that tells backend user has deleted account
				//Sign user out..?
			}).error(function(response) {
				//console.log($scope.credentials);
				//console.log($scope.authentication.user);
				$scope.error = 'Please enter the correcttt password';
			});
		};

		// Find existing Database in Porfolio
		$scope.findAll = function() {		
			
			for(var i = 0; i < $scope.user.portfolios.length; i++)
			{
				console.log($scope.user);
				$scope.user.portfolios[i] = Databases.get({databaseId: Authentication.user.portfolios[i]});
			}
		};

	}
]);




