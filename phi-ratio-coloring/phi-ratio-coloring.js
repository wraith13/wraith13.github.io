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
		var model = $location.search();
		setTimeout
		(
			function()
			{
				if (model && model.colorSource)
				{
					$scope.model.colorSource = $scope.model.colorSource;
					$scope.model.colorCode = model.colorCode;
					$scope.model.r = parseInt(model.r);
					$scope.model.g = parseInt(model.g);
					$scope.model.b = parseInt(model.b);
					$scope.model.h = parseFloat(model.h);
					$scope.model.s = parseFloat(model.s);
					$scope.model.l = parseFloat(model.l);
					$scope.model.combination = model.combination;
					$scope.model.hueResolution = parseInt(model.hueResolution);
					$scope.model.hueStep = model.hueStep;
					$scope.model.saturationResolution = parseInt(model.saturationResolution);
					$scope.model.saturationStep = model.saturationStep;
					$scope.model.lightnessResolution = parseInt(model.lightnessResolution);
					$scope.model.lightnessStep = model.lightnessStep;
					$scope.model.textColor = model.textColor;
					$scope.model.separatorColor = model.separatorColor;
					$scope.model.showStyle = model.showStyle;
				}
				switch($scope.model.colorSource)
				{
				case "code":
					$scope.changeCode();
					break;
				case "rgb":
					$scope.changeRgb();
					break;
				case "hsl":
					$scope.changeHsl();
					break;
				}
				$scope.$apply();
				$scope.changeShowStyle();
			},
			0
		)
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
		pi: Math.PI,
		phi: phi,
    };
    $rootScope.title = $scope.app.name;

	$scope.model = {
		colorSource: "hsl",
		colorCode: "#xxxxxx",
		r: 0,
		g: 0,
		b: 0,
		h: 2.399963229728654,
		s: 0.254644007500070,
		l: 0.381966011250105,
		combination: "hue * lightness",
		hueResolution: 13,
		hueStep: "phi ratio",
		saturationResolution: 6,
		saturationStep: "phi ratio",
		lightnessResolution: 6,
		lightnessStep: "phi ratio",
		textColor: "auto",
		separatorColor: "none",
		showStyle: "default"
	};

	$scope.getRgb  = function() {
		return clipRgb({r:$scope.model.r /255.0, g:$scope.model.g /255.0, b:$scope.model.b /255.0});
	};
	$scope.setRgb = function(rgb) {
		$scope.model.r = ((rgb.r *255) ^ 0);
		$scope.model.g = ((rgb.g *255) ^ 0);
		$scope.model.b = ((rgb.b *255) ^ 0);
	}
	$scope.getHsl  = function() {
		return regulateHsl({h:$scope.model.h, s:$scope.model.s, l:$scope.model.l});
	};
	$scope.setHsl = function(hsl) {
		$scope.model.h = hsl.h;
		$scope.model.s = hsl.s;
		$scope.model.l = hsl.l;
	};

	$scope.updateUrl = function() {
		$location.search($scope.model);
	};

	$scope.updateCodeFromRgb  = function() {
		$scope.model.colorCode = rgbForStyle($scope.getRgb());
	};
	$scope.updateRgbFromCode  = function() {
		$scope.setRgb(rgbFromStyle($scope.model.colorCode));
	};
	$scope.updateHslFromRgb  = function() {
		$scope.setHsl(rgbToHsl($scope.getRgb()));
	};
	$scope.updateRgbFromHsl  = function() {
		$scope.setRgb(hslToRgb($scope.getHsl()));
	};

	$scope.changeCode = function() {
		$scope.model.colorSource = "code";
		$scope.updateRgbFromCode();
		$scope.updateHslFromRgb();
	};
	$scope.changeRgb = function() {
		$scope.model.colorSource = "rbg";
		$scope.updateCodeFromRgb();
		$scope.updateHslFromRgb();
	};
	$scope.changeHsl = function() {
		$scope.model.colorSource = "hsl";
		$scope.updateRgbFromHsl();
		$scope.updateCodeFromRgb();
	};
	$scope.changeShowStyle = function() {
		document.body.classList.toggle("full-screen", "full screen" === $scope.model.showStyle);
	};
	$scope.clickColorTable = function() {
		if ("full screen" === $scope.model.showStyle)
		{
			$scope.model.showStyle = "default";
			$scope.changeShowStyle();
		}
	};
	
	$scope.calcHsl = function(h, s, l) {
		var hsl = $scope.getHsl();
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
				var saturationResolution = Math.abs(parseInt($scope.model.saturationResolution));
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
				var lightnessResolution = Math.abs(parseInt($scope.model.lightnessResolution));
				hsl.l = (lightnessResolution +l +1.0) / ((lightnessResolution *2.0) +2.0);
			}
		}
		return regulateHsl(hsl);
	};
	$scope.getTextColor = function(expression) {
		switch($scope.model.textColor)
		{
		case "auto":
			return expression.l <= 0.5 ? "#FFFFFF": "#000000";
		case "none":
			return "rgba(0,0,0,0)"
		default:
			return $scope.model.textColor;
		}
	};
	$scope.getBorder = function() {
		switch($scope.model.separatorColor)
		{
		case "none":
			return "none"
		default:
			return "4px solid " +$scope.model.separatorColor;
		}
	};
	$scope.calcStyleBase = function(expression) {
		return {
			"color": $scope.getTextColor(expression),
			"background-color": rgbForStyle(clipRgb(hslToRgb(expression))),
			"border": $scope.getBorder()
		};
	};
	$scope.calcStyle = function(h, s, l) {
		return $scope.calcStyleBase($scope.calcHsl(h, s, l));
	};
	$scope.calcCode = function(h, s, l) {
		return "none" === $scope.model.textColor ?
			"":
			rgbForStyle(clipRgb(hslToRgb($scope.calcHsl(h, s, l))));
	};
	$scope.makeRange = function(min, max, step) {
		if (undefined === step) {
			return $scope.makeRange(min, max, 1)
		} else {
			var result = [];
			var i = min;
			if (min !== max)
			{
				if (min <= max)
				{
					do {
						result.push(i);
						i += step;
					} while(i < max);
				}
				else
				{
					do {
						result.push(i);
						i -= step;
					} while(max < i);
				}
			}
			result.push(max);
			return result;
		}
	}
});
