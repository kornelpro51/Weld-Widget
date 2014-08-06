'use strict';

angular.module('WeldSparkApp').directive('weldListMenu', function() {

	var menuTemplate = '<div class="ui_panel">' +
		'<h1>&gt; Header</h1>' +
		'<div ng-repeat="category in menuItems.categories">' +
		'<h2>{{category.label}}</h2>' +
		'<a ng-repeat="item in category.items" ng-click="selectMenuItem(item.label)" ng-class="{selected: item.label==menuItems.selected}" class="tool_button" id="tool_{{item.id}}"><img alt="{{item.label}}" src="../images/{{item.icon}}.png"/><span class="tool_button_label">{{item.label}}</span></a>' +
		'</div>' +
		'</div>';

	return {
		restrict: 'A',
		replace: true,
		template: menuTemplate,
		scope: {
			headerText: '=weldListMenu',
			menuItems: '=',
			menuSelected: '=',
			showLogo: '='
		},
		
		controller: function($scope) {
			//console.log($scope.selectedMenuItem);
			$scope.selectMenuItem = function(menuItemLabel) {
				$scope.menuItems.selected = menuItemLabel;
			};
		},

		link: function(scope, element) {
			if (scope.showLogo) {
				element.prepend('<div class="weld_logo"></div>');
			}

			// When value is changed
			scope.$watch('menuSelected', function(val) {
                //console.log('menuSelected', val);
            });

		}
	};

});