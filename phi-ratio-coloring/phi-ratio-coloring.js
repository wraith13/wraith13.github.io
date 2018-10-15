'use strict'

var app = angular.module("phi-ratio-coloring", ['ui.router', "ui.bootstrap"]);
var phi = 1.618033988749894848204586834365;

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
		var toHex = function(i) {
			var result = ((255 *i) ^ 0).toString(16).toUpperCase();
			if (1 == result.length) {
				result = "0" +result;
			}
			return result;
		}
		var result = {
			"width": "calc(100vw / 3)",
			"height": "5vh",
			"background-color": "#"
				+toHex(r)
				+toHex(g)
				+toHex(b)
		};
		return result;
	};
	$scope.xyzToLength = function(xyz) {
		return Math.sqrt(Math.pow(xyz.x, 2) +Math.pow(xyz.y, 2) +Math.pow(xyz.z, 2));
	};
	$scope.rgbToXyz = function(expression) {
		return	{x:expression.r, y:expression.g, z:expression.b};
	};
	$scope.rgbToHue = function(expression) {
		var hueXy = {
			x: Math.sqrt(Math.pow(expression.g, 2) -Math.pow(expression.g /2, 2))
				-Math.sqrt(Math.pow(expression.b, 2) -Math.pow(expression.b /2, 2)),
			y: (expression.g /2) +(expression.b /2) -expression.r
		};
		return (Math.PI/2 -Math.atan2(hueXy.y, hueXy.x)) /Math.PI;
	};
	$scope.rgbToLightness = function(expression) {
		return	$scope.xyzToLength($scope.rgbToXyz(expression.r)) /
				$scope.xyzToLength({x:1.0, y:1.0, z:1.0});
	};
	$scope.rgbToSaturation = function(expression) {
		var lightness = $scope.rgbToLightness(expression);
		var green = {r:1.0, g:0.0, b:0.0};
		var greenLightness = $scope.rgbToLightness(fullGreen);
		return $scope.xyzToLength({x:expression.r -lightness, y:expression.g -lightness, z:expression.b -lightness}) / $scope.xyzToLength({x:green.r -greenLightness, y:green.g -greenLightness, z:green.b -greenLightness});
	};
	$scope.rgbToHsl = function(expression) {
		//	※座標空間敵に RGB 色空間の立方体の座標として捉えるので、本来であれば円筒形あるいは双円錐形の座標となる HLS (および HSV とも)厳密には異なるが、ここでは便宜上 HLS と呼称する。
		return {
			h: $scope.rgbToHue(expression),
			s: $scope.rgbToSaturation(expression),
			l: $scope.rgbToLightness(expression)
		}
	}
	$scope.hslToRgb = function(expression) {
		//	※座標空間敵に RGB 色空間の立方体の座標として捉えるので、本来であれば円筒形あるいは双円錐形の座標となる HLS (および HSV とも)厳密には異なるが、ここでは便宜上 HLS と呼称する。
		var red = 0.0;
		var green = 0.0;
		var blue = 0.0;
		return {
			r: red,
			g: green,
			b: blue
		}
	}
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
