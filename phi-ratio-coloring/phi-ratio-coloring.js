'use strict'

var app = angular.module("phi-ratio-coloring", ['ui.router', "ui.bootstrap"]);

app.config(["$locationProvider", function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);

app.controller("phi-ratio-coloring", function ($rootScope, $window, $scope, $http, $location, $filter) {

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
        name: "phi ratio coloring",
        description: "黄金比を利用したカラーテーブルを作成します。",
    };
    $rootScope.title = $scope.app.name;

	$scope.model = {
		expression: {
			r: 0.3,
			g: 0.9,
			b: 0.6
		},
		resolution: 4,
	};
	$scope.builtModel = {
		resolution: $scope.model.resolution,
		indexes: []
	};
	
	$scope.build = function() {
		$scope.clearAlert();
		try {
			$scope.builtModel.indexes = [];
			$scope.builtModel.resolution = $scope.model.resolution;
			var i = 0;
			do {
				$scope.builtModel.indexes.push(i);
			} while(++i < $scope.model.resolution);
		} catch(e) {
            $scope.addAlert({ type: 'danger', msg: e.name +": "+ e.message });
		}
	};
	$scope.calcStyleBase = function(r, g, b) {
		return {
			"width": "calc(100vw / 3)",
			"height": "5vh",
			"background-color": rgbForStyle({r, g, b})
		};
	};
	$scope.calcLighterStyle = function(expression, i) {
		var ratio = Math.pow(phi, i);
		var lighter = function(x, ratio) {
			return 1.0 -((1.0 - x) / ratio);
		}
		return $scope.calcStyleBase(lighter(expression.r, ratio), lighter(expression.g, ratio), lighter(expression.b, ratio));
	};
	$scope.calcDarkerStyle = function(expression, i) {
		var ratio = Math.pow(phi, i);
		var darker = function(x, ratio) {
			return x / ratio;
		}
		return $scope.calcStyleBase(darker(expression.r, ratio), darker(expression.g, ratio), darker(expression.b, ratio));
	};
	$scope.calcHueStyle = function(expression, i) {
		var v = Math.sqrt((expression.r *expression.r) +(expression.g *expression.g), (expression.b *expression.b));
		var angle = phi *i;
		return $scope.calcStyleBase(expression.r, expression.g, expression.b);
	};
});
