'use strict';

app.controller('weldEditorController', function ($scope, session, socket, $rootScope) {

	$scope.lastElementId = 0;
	$scope.selectedElement = null;

	// ----- Socket.io Communication -----

	// Need to keep track of my socket id for proper id generation of elements that
	// can be created by me and any other browser joined by the same session.
	socket.on('ws:assign-socket-id', function(socketId) {
		console.log('on ws:assign-socket-id', socketId);
		session.socketId = socketId;
	});

	// Outgoing
	$scope.createElement = function(payload) {
		//console.log('emit wc:create', payload);
		socket.emit('wc:create', payload);
		$scope.tools.selected = 'Select';
		$scope.$apply('menuSelected');
	};

	$scope.deleteElement = function(id) {
		//console.log('emit wc:delete', id);
		socket.emit('wc:delete', id);
	};

	$scope.elementPropertyChanged = function(element) {
		if (element) {
			//console.log('elementPropertyChanged', $scope.elementProperties);
			var payload = {
				id: element.attr('id'),
				properties: $scope.elementProperties,
				innerHTML: ((element.html() !== '' && element.html()[0] !== '<') ? element.html() : null), // TODO: trim HTML tags with certain classes, see issue #20
				parentId:  element.parent().attr('id')
				//properties: element.attributes
			};
			//console.log('emit wc:update', payload);
			//console.log(JSON.stringify(payload, null, '\t'));
			socket.emit('wc:update', payload);
		}
	};

	$scope.getNewElement = function () {
		$scope.lastElementId++;

		var elementData = null, id = null, createId = function(prefix) {
			return prefix + session.socketId + '-' + $scope.lastElementId;
		};
		switch ($scope.tools.selected) {
			// case 'Select':
			// 	id = "weld-selectionbox";
			// 	elementData = '<div id="' + id + '"></div>';
			// 	break;
			case 'Rectangle':
				id = createId('rectangle-');
				elementData = '<div class="weld-element weld-element-container weld-rectangle" id="' + id + '" style="background: #CCC;"></div>';
				break;
			case 'Text':
				id = createId('text-');
				elementData = '<span class="weld-element" style="position: absolute;" id="' + id + '"><span class="weld-text" ng-hide="isEditing">{{innerHTML}}</span><form ng-show="isEditing" ng-submit="endTextEditing($event)"><input type="text" class="weld-inline-editor" ng-model="innerHTML"></input></form></span>';
				break;
			case 'Image':
				id = createId('img-');
				//elementData = '<img class="weld-element" src="http://placekitten.com/g/300/300" style="position: absolute;" id="' + id + '"/>';
				elementData = '<div class="weld-element weld-image" id="' + id + '" style="background: #CCC;"><img class="weld-child" src="http://placekitten.com/g/300/300" id="' + id + '-img" /></div>';
				break;
			case 'Button':
				id = createId('button-');
				//elementData = '<div class="weld-element weld-button" id="' + id + '"><button class="weld-element" type="button" style="position: absolute;" id="' + id + '">Button</button>';
				elementData = '<div class="weld-element weld-button" id="' + id + '"><button class="weld-child" id="' + id + '-btn" style="position:absolute; margin:0; padding: 0;">Button</button></div>';
				break;
			case 'Input':
				id = createId('input-');
				//elementData = '<input class="weld-element" type="text" style="position: absolute;" id="' + id + '"></input>';
				elementData = '<div class="weld-element weld-text" id="' + id + '"><input class="weld-child" type="text" id="' + id + '"></input></div>';
				break;
			default:
				console.log("Can't draw - no valid tool selected.");
				break;
		}
		return { id: id, directive: elementData };
	};

	// ----- ToolBox -----

	$scope.tools = {
		categories: [
			{
				label: 'Basic',
				items: [
					{ id: 'select', label: 'Select', icon: 'toolicon_select' },
					{ id: 'rectangle', label: 'Rectangle', icon: 'toolicon_rectangle' },
					{ id: 'text', label: 'Text', icon: 'toolicon_text' }
					//{ id: 'table', label: 'Table' },
				]
			},
			{
				label: 'Experimental',
				items: [
					{ id: 'image', label: 'Image', icon: 'toolicon_image' },
					{ id: 'button', label: 'Button', icon: 'toolicon_button' },
					{ id: 'input', label: 'Input', icon: 'toolicon_input' }
				]
			}
			/*
			{
				label: 'Compound',
				items: [
					{ id: 'pageheader', label: 'Header' },
					{ id: 'youtube', label: 'YouTube' }
					//{ id: 'tool_bootstrap_jumbotron', label: 'Jumbotron' },
					//{ id: 'tool_bootstrap_navbar', label: 'NavBar' }
				]
			}
			*/
		],

		// Currently selected tool:
		selected: 'Select'
	};


	// ----- Element Properties -----

	$scope.elementProperties = {};
	$scope.appProperties = { showGrid: false };

	$scope.updatePropertiesFromElement = function (element) {
		// Clear old
		$scope.elementProperties = {};
		// Get new
		var cssProperties = [
			'position',
			'left',
			'top',
			'right',
			'bottom',
			'width',
			'height',
			'margin',
			'padding',
			'backgroundColor',
			'borderColor',
			'borderWidth',
			'borderRadius'
		];
		for (var p in cssProperties) {
			if (cssProperties.hasOwnProperty(p)) {
				$scope.elementProperties[cssProperties[p]] = element.cssProperty(cssProperties[p]);
			}
		}
		if (!$rootScope.$$phase) {
			$scope.$apply();
		} else {
			setTimeout(function() {
				$scope.$apply();
			});
		}
		//console.log('updatePropertiesFromElement:', $scope.selectedElement.attr('id'), '->', $scope.elementProperties['backgroundColor']);
	};

	// Receive 'ElementWasSelected' from child
	$scope.$on('ElementWasSelected', function(event, emitterElement, deselectOthers) {
		if (deselectOthers) {
			$scope.$broadcast('DeselectAllElements', emitterElement);
		}
		$scope.selectedElement = emitterElement;
		$scope.updatePropertiesFromElement(emitterElement);
	});

	// Receive 'ElementWasUpdated' from child
	$scope.$on('ElementWasUpdated', function(event, emitterElement) {
		// Update Properties Panel
		$scope.updatePropertiesFromElement(emitterElement);
		// Send to server
		$scope.elementPropertyChanged(emitterElement);
	});

	/**
	 * Returns true iff newVal OR oldVal are truthy (i.e. not null and not undefined) and they're different.
	 * The problem observed was that if newVal and oldVal were null and undefined respectively, we sent null
	 * to the server which ruined the server state.
	 */
	var propChanged = function(newVal, oldVal) {
		return (newVal || oldVal) && newVal !== oldVal;
	};

	// TODO: know _which_ property changed and use that
	var changeSelectedElementProperty = function(newVal, oldVal) {
		//console.log('changeSelectedElementProperty:', newVal, oldVal, propChanged(newVal, oldVal));
		if (propChanged(newVal, oldVal) && $scope.selectedElement) {
			// Set locally
			$scope.selectedElement.css($scope.elementProperties);
			// Send to server
			$scope.elementPropertyChanged($scope.selectedElement);
		}
	};

	var changeSelectedElementPosition = function(newVal, oldVal) {
		if ($scope.selectedElement) {
			changeSelectedElementProperty(newVal, oldVal);
			if (newVal === 'relative') {
				$scope.selectedElement.clearCssProperties(['left', 'top']);
			}
		}
	};

	$scope.$watch('elementProperties.position', changeSelectedElementPosition);

	$scope.$watch('elementProperties.left', changeSelectedElementProperty);
	$scope.$watch('elementProperties.top', changeSelectedElementProperty);
	$scope.$watch('elementProperties.marginLeft', changeSelectedElementProperty);
	$scope.$watch('elementProperties.marginTop', changeSelectedElementProperty);
	$scope.$watch('elementProperties.width', changeSelectedElementProperty);
	$scope.$watch('elementProperties.height', changeSelectedElementProperty);
	$scope.$watch('elementProperties.backgroundColor', changeSelectedElementProperty);
	$scope.$watch('elementProperties.borderColor', changeSelectedElementProperty);
	$scope.$watch('elementProperties.borderWidth', changeSelectedElementProperty);
	$scope.$watch('elementProperties.borderRadius', changeSelectedElementProperty);

});