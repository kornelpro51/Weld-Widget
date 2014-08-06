'use strict';

app.directive('weldOnOffSwitch', function () {

	return {
		template: '<div class="onoffswitch">'
				+ '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch">'
				+ '<label class="onoffswitch-label" for="myonoffswitch">'
				+ '<div class="onoffswitch-inner"></div>'
				+ '<div class="onoffswitch-switch"></div>'
				+ '</label>'
				+ '</div>',
		
		restrict: 'E',
		scope: { ngModel: '=' },

		link: function postLink (scope, element, attrs) {

			element.bind('click', function () {
				if (element.find('.onoffswitch-switch').css('right') === '38px') {
					scope.ngModel = true;
				}
				else {
					scope.ngModel = false;
				}
				scope.$apply();
			});

		}
	};

});