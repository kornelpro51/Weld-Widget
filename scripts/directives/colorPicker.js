// Based on: http://plnkr.co/99HHNd

'use strict';

angular.module('WeldSparkApp').directive('colorPicker', function () {
	return {
		restrict: 'E',
		replace: true,
		scope: { colorVariable: '=' }, // TODO: replace with ngModel?
		
		template: '<div class="color-picker">'
				+ '<div ng-repeat="colorItem in colorList" class="color-box" ng-class="{selected: colorItem.isSelected}" style="background-color: {{colorItem.colorValue}}" ng-click="clickColor(colorItem)"></div>'
				+ '</div>',

		// TODO: consider refactoring to match style of other directives: http://stackoverflow.com/questions/14565121/whats-the-difference-between-the-2-postlink-functions-in-directive
		compile: function compile(tElement, tAttrs, transclude) {

			var colors = ["", "#000000", "#FFFFFF", "#CCCCCC", "#5484ED", "#A4BDFC", "#46D6DB", "#7AE7BF", "#51B749", "#FBD75B", "#FFB878", "#FF887C", "#DC2127", "#DBADFF"];

			return {

				post: function postLink(scope, iElement, iAttrs, controller) {
					scope.colorList = [];
					angular.forEach(colors, function(colVal) {
						scope.colorList.push({
							colorValue : colVal,
							isSelected : false
						});
					});
				}

			};
		},

		controller: function ($scope, $element, $timeout) {

			$scope.clickColor = function(color) {
				for (var i = 0; i < $scope.colorList.length; i++) {
					$scope.colorList[i].isSelected = false;
					if ($scope.colorList[i] === color) {
						$scope.colorVariable = color.colorValue;
						$scope.colorList[i].isSelected = true;
					}
				}
			};

			function componentToHex(c) {
				var hex = parseInt(c).toString(16).toLowerCase();
				return hex.length == 1 ? "0" + hex : hex;
			}

			function rgbToHex(r, g, b) {
				return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
			}

			function rgbStringToHex(rgbString) {
				if (!rgbString)
					return undefined;
				var valueStr = rgbString.substring(4, rgbString.length - 1);
				var values = valueStr.split(', ');
				return rgbToHex(values[0], values[1], values[2]);
			}

			function isSameColor(color1Str, color2Value) {
				if (!color2Value)
					return false;

		    	//console.log('isSameColor:', color1Str, '==', color2Value, rgbStringToHex(color2Value), (color1Str.toLowerCase() === color2Value.toLowerCase()), (color1Str.toLowerCase() === rgbStringToHex(color2Value)) );
		    	if (color1Str.toLowerCase() === color2Value.toLowerCase() // "#5484ed"
		    	 || color1Str.toLowerCase() === rgbStringToHex(color2Value)) { // rgb(84, 132, 237)
		    		return true;
		    	}
		    	else {
		    		return false;
		    	}
			}

			// When colorVariable changes externally, loop through colorList and find the matching color
			$scope.$watch('colorVariable', function(newVal, oldVal) {
				//console.log('colorVariable', newVal);
				for (var i = 0; i < $scope.colorList.length; i++) {
					$scope.colorList[i].isSelected = false;
					if (isSameColor($scope.colorList[i].colorValue, newVal)) {
						$scope.clickColor($scope.colorList[i]);
					}
				}
			});

		}

	};
});