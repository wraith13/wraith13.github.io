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
		expression: {
			r: ["255*N","255*Math.sin((Math.PI/2) *N)"][1],
			g: ["255*N","255*Math.sin((Math.PI/2) *N)"][1],
			b: ["255*N","255*Math.sin((Math.PI/2) *N)"][1]
		},
		resolution: 4,
	};
	$scope.builtModel = {
		resolution: $scope.model.resolution,
		levels: {
			r: [],
			g: [],
			b: [],
		},
		indexes: []
	};
	
	$scope.build = function() {
		$scope.clearAlert();
		try {
			$scope.builtModel.levels.r = [];
			$scope.builtModel.levels.g = [];
			$scope.builtModel.levels.b = [];
			$scope.builtModel.indexes = [];
			$scope.builtModel.resolution = $scope.model.resolution;
			var i = 0;
			do {
				var N = (1 *i) /($scope.model.resolution -1);
				$scope.builtModel.levels.r.push(eval($scope.model.expression.r)|0);
				$scope.builtModel.levels.g.push(eval($scope.model.expression.g)|0);
				$scope.builtModel.levels.b.push(eval($scope.model.expression.b)|0);
				$scope.builtModel.indexes.push(i);
			} while(++i < $scope.model.resolution);
		} catch(e) {
            $scope.addAlert({ type: 'danger', msg: e.name +": "+ e.message });
		}
	};
	$scope.calcStyle = function(s, x, y, z) {
		var size_unit = 100 / ($scope.builtModel.resolution *3);
		var toHex = function(i) {
			var result = i.toString(16).toUpperCase();
			if (1 == result.length) {
				result = "0" +result;
			}
			return result;
		}
		var table = [[ x, y, z], [y, z, x], [z, x, y]][s];
		var result = {
			"width": size_unit +"vw",
			"height": size_unit +"vw",
			"background-color": "#"
				+toHex($scope.builtModel.levels.r[table[0]])
				+toHex($scope.builtModel.levels.g[table[1]])
				+toHex($scope.builtModel.levels.b[table[2]])
		};
		return result;
	};
});
