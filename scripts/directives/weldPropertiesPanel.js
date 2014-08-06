'use strict';

app.directive('weldPropertiesPanel', function () {
	return {
		template: '<div id="properties" class="ui_panel">'
		+ '<p>Weld Sketch v0.2.0</p>'
		+ '<label for="grid-switch">Grid:</label>'
		+ ''
		+ '<weld-on-off-switch id="grid-switch" ng-model="appProperties.showGrid"></weld-on-off-switch>'
		// + '<p>G: Create column grid</p>'
		// + '<p>C: Create center grid</p>'
		// + '<p>Shift-G: Clear grid</p>'
		+ '<fieldset>'
		+ '<label for="position-selector">Flow or Set Position:</label>'
		+ '<select id="position-selector" ng-model="elementProperties.position" ng-options="p.value as p.name for p in positions"></select>'
		//+ '<select id="origin-selector" ng-model="elementProperties.origin" ng-options="o.value as o.name for o in origins"></select>'
		+ '<label for="left">X:</label>'
		+ '<input id="left" placeholder="X" ng-model="elementProperties.left"></input>'
		+ '<label for="top">Y:</label>'
		+ '<input id="top" placeholder="Y" ng-model="elementProperties.top"></input>'
		+ '<label for="width">W:</label>'
		+ '<input id="width" placeholder="Width" ng-model="elementProperties.width"></input>'
		+ '<label for="height">H:</label>'
		+ '<input id="height" placeholder="Height" ng-model="elementProperties.height"></input>'
		//+ '<input id="margin-left" placeholder="margin-left" ng-model="elementProperties.marginLeft"></input>'
		//+ '<input id="margin-top" placeholder="margin-top" ng-model="elementProperties.marginTop"></input>'
		+ '</fieldset>'
		+ '<fieldset>'
		+ '<label for="background-color-picker">Background:</label>'
		+ '<color-picker id="background-color-picker" color-variable="elementProperties.backgroundColor"></color-picker>'
		+ '<label for="border-color-picker">Border:</label>'
		+ '<select id="border-width-selector" ng-model="elementProperties.borderWidth" ng-options="w.value as w.name for w in borderWidths"></select>'
		+ '<color-picker id="border-color-picker" color-variable="elementProperties.borderColor"></color-picker>'
		+ '<label for="border-radius-selector">Border radius:</label>'
		+ '<select id="border-radius-selector" ng-model="elementProperties.borderRadius" ng-options="r.value as r.name for r in borderRadiuses"></select>'
		+ '</fieldset>'
		+ '</div>',
		restrict: 'A',
		scope: { elementProperties: '=', appProperties: '=' },

		link: function postLink (scope, element, attrs) {
			//element.text('this is the weldPropertiesPanel directive');
			//console.log('weldPropertiesPanel', scope.elementProperties);

			scope.origins = [
				{ name: 'Top-Left', value: 'top-left' },
				{ name: 'Center-Middle', value: 'center-middle' },
				{ name: 'Bottom-Right', value: 'bottom-right' },
			];
			scope.positions = [ 
				{ name: 'Free-flow', value: 'relative' }, 
				{ name: 'Position', value: 'absolute' },
			];
			scope.borderWidths = [
				{ name: 'None', value: '0' },
				{ name: '1px', value: '1px' },
				{ name: '2px', value: '2px' },
				{ name: '5px', value: '5px' },
				{ name: '10px', value: '10px' },
			];
			scope.borderRadiuses = [
				{ name: 'None', value: '0' },
				{ name: '2px', value: '2px' },
				{ name: '4px', value: '4px' },
				{ name: '8px', value: '8px' },
				{ name: '16px', value: '16px' },
				{ name: '20%', value: '20%' },
				{ name: '50%', value: '50%' },
			];

		}
	};
});