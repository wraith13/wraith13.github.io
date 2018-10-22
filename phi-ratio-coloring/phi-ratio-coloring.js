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
		resolution: 13,
		hueStepUnit: Math.PI *2 / phi,
	};
	$scope.builtModel = {
		resolution: $scope.model.resolution,
		hueStepUnit: $scope.model.hueStepUnit,
		indexes: []
	};
	
	$scope.build = function() {
		$scope.clearAlert();
		try {
			$scope.builtModel.indexes = [];
			$scope.builtModel.resolution = $scope.model.resolution;
			$scope.builtModel.hueStepUnit = $scope.model.hueStepUnit;
			var i = 0;
			do {
				$scope.builtModel.indexes.push(i);
			} while(++i < $scope.model.resolution);
		} catch(e) {
            $scope.addAlert({ type: 'danger', msg: e.name +": "+ e.message });
		}
	};
	$scope.calcStyleBase = function(expression) {
		return {
			"width": "calc(100vw / 3)",
			"height": "5vh",
			"background-color": rgbForStyle(expression)
		};
	};
	$scope.calcLighterStyle = function(expression, i) {
		var ratio = Math.pow(phi, i);
		var lighter = function(x, ratio) {
			return 1.0 -((1.0 - x) / ratio);
		}
		return $scope.calcStyleBase({r:lighter(expression.r, ratio), g:lighter(expression.g, ratio), b:lighter(expression.b, ratio)});
	};
	$scope.calcDarkerStyle = function(expression, i) {
		var ratio = Math.pow(phi, i);
		var darker = function(x, ratio) {
			return x / ratio;
		}
		return $scope.calcStyleBase({r:darker(expression.r, ratio), g:darker(expression.g, ratio), b:darker(expression.b, ratio)});
	};
	$scope.calcHueStyle = function(expression, i) {
		var hsl = rgbToHsl(clipRgb(expression));
		hsl.h += parseFloat($scope.model.hueStepUnit) *i;
		return $scope.calcStyleBase(clipRgb(hslToRgb(regulateHsl(hsl))));
	};
	$scope.calcStyle = function(expression, l, h) {
		var hsl = rgbToHsl(clipRgb(expression));
		hsl.h += parseFloat($scope.model.hueStepUnit) *h;
		hsl.l = l < 0.0 ?
			hsl.l / Math.pow(phi, -l):
			1.0 -((1.0 - hsl.l) / Math.pow(phi, l));
		return $scope.calcStyleBase(clipRgb(hslToRgb(regulateHsl(hsl))));
	};
	$scope.makeRange = function(min, max, step) {
		if (undefined === step) {
			return $scope.makeRange(min, max, 1)
		} else {
			var result = [];
			var i = min;
			do {
				result.push(i);
				i += step;
			} while(i < max);
			result.push(max);
			return result;
		}
	}
});
