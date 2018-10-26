'use strict'

var app = angular.module("phi-ratio-coloring", ['ui.router', "ui.bootstrap"]);

app.config(["$locationProvider", function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);

app.controller("phi-ratio-coloring", function ($rootScope, $window, $scope, $http, $location, $filter) {

	$scope.init = function() {
		$scope.changeRgb();
	};
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
		r: 0.3,
		g: 0.9,
		b: 0.6,
		h: 0.0,
		s: 0.0,
		l: 0.0,
		combination: "hue * lightness",
		hueResolution: 13,
		hueStep: "phi ratio",
		saturationResolution: 6,
		saturationStep: "phi ratio",
		lightnessResolution: 6,
		lightnessStep: "phi ratio",
	};

	$scope.changeCss = function() {
	};
	$scope.changeRgb = function() {
		var hsl = rgbToHsl(clipRgb({r:$scope.model.r, g:$scope.model.g, b:$scope.model.b}));
		$scope.model.h = hsl.h;
		$scope.model.s = hsl.s;
		$scope.model.l = hsl.l;
	};
	$scope.changeHsl = function() {
		var rgb = hslToRgb(regulateHsl({h:$scope.model.h, s:$scope.model.s, l:$scope.model.l}));
		$scope.model.r = rgb.r;
		$scope.model.g = rgb.g;
		$scope.model.b = rgb.b;
	};
	
	$scope.calcStyleBase = function(expression) {
		return {
			"width": "calc(100vw / 3)",
			"height": "5vh",
			"background-color": rgbForStyle(expression)
		};
	};
	$scope.calcStyle = function(expression, h, s, l) {
		var hsl = rgbToHsl(clipRgb(expression));
		if (undefined !== h)
		{
			if ("phi ratio" === $scope.model.hueStep)
			{
				hsl.h += Math.PI *2 / phi *h;
			}
			else
			{
				hsl.h += Math.PI *2 *h /$scope.model.hueResolution;
			}
		}
		if (undefined !== s)
		{
			if ("phi ratio" === $scope.model.saturationStep)
			{
				hsl.s = s < 0.0 ?
					hsl.s / Math.pow(phi, -s):
					colorHslSMAx -((colorHslSMAx - hsl.s) / Math.pow(phi, s));
			}
			else
			{
				//	saturation を均等割する場合、saturation の初期値はガン無視する
				var saturationResolution = parseInt($scope.model.saturationResolution);
				hsl.s = ((saturationResolution +s +1.0) / ((saturationResolution *2.0) +2.0)) *colorHslSMAx;
			}
		}
		if (undefined !== l)
		{
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
