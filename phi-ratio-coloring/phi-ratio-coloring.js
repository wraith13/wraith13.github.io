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
		cssExpression: "xxxxxx",
		expression: {
			r: 0.3,
			g: 0.9,
			b: 0.6
		},
		combination: "hue * saturation",
		hueResolution: 13,
		hueStep: "phi ratio",
		lightnessResolution: 6,
		lightnessStep: "phi ratio",
	};
	
	$scope.calcStyleBase = function(expression) {
		return {
			"width": "calc(100vw / 3)",
			"height": "5vh",
			"background-color": rgbForStyle(expression)
		};
	};
	$scope.calcStyle = function(expression, l, h) {
		var hsl = rgbToHsl(clipRgb(expression));
		if ("phi ratio" === $scope.model.hueStep)
		{
			hsl.h += Math.PI *2 / phi *h;
		}
		else
		{
			hsl.h += Math.PI *2 *h /$scope.model.hueResolution;
		}
		if ("phi ratio" === $scope.model.lightnessStep)
		{
			hsl.l = l < 0.0 ?
			hsl.l / Math.pow(phi, -l):
			1.0 -((1.0 - hsl.l) / Math.pow(phi, l));
		}
		else
		{
			//	lightness を均等割する場合、lightness の初期値はガン無視する
			var lightnessResolution = parseInt($scope.model.lightnessResolution);
			hsl.l = (lightnessResolution +l +1.0) / ((lightnessResolution *2.0) +2.0);
		}
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
