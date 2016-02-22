'use strict'

var app = angular.module("colordistribution", ['ui.router', "ui.bootstrap"]);

app.config(["$locationProvider", function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);

app.controller("colordistribution", function ($rootScope, $window, $scope, $http, $location, $filter) {

    $scope.alerts = [];
    $scope.clearAlert = function () {
		$scope.alerts = [];
	};
    $scope.addAlert = function (alert) {
        $scope.alerts.push(alert);
    };
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.app = {
        type: "app",
        name: "colordistribution",
        description: "このツールはどのように値域を分割すれば人の目で認識した場合の色差が均等になるかを確認する為のツールです。",
    };
    $rootScope.title = $scope.app.name;

	$scope.model = {
		expression: ["255*N","255*Math.sin((Math.PI/2) *N)"][1],
		resolution: 4,
	};
	$scope.buildModel = {
		resolution: $scope.model.resolution,
		levels: null
	}
	
	$scope.build = function() {
		$scope.clearAlert();
		try {
			$scope.buildModel.levels = [];
			$scope.buildModel.resolution = $scope.model.resolution;
			var i = 0;
			do {
				var N = (1 *i) /($scope.model.resolution -1);
				$scope.buildModel.levels.push(eval($scope.model.expression)|0);
			} while(++i < $scope.model.resolution);
		} catch(e) {
            $scope.addAlert({ type: 'danger', msg: e.name +": "+ e.message });
		}
	};
	$scope.calcStyle = function(s, x, y, z) {
		var size_unit = 100 / ($scope.buildModel.resolution *3);
		var toHex = function(i) {
			var result = i.toString(16).toUpperCase();
			if (1 == result.length) {
				result = "0" +result;
			}
			return result;
		}
		var table = [[x, y, z], [y, z, x], [z, x, y]][s];
		var result = {
			"width": size_unit +"vw",
			"height": size_unit +"vw",
			"background-color": "#" +toHex(table[0]) +toHex(table[1]) +toHex(table[2]),
		};
		return result;
	};

});
