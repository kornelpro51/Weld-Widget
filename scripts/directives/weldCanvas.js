'use strict';

angular.module('WeldSparkApp').directive('weldCanvas', function($compile, keyboardManager, weldGridManager, weldComService) {

	// http://stackoverflow.com/questions/16587961/is-there-already-a-canvas-drawing-directive-for-angularjs-out-there
	return {
		restrict: 'A',

		// About $scope vs. scope: http://www.thinkster.io/pick/aw9kWmdnik/angularjs-scope-vs-scope
		link: function(scope, element, attrs) {
			// variable that decides if something should be drawn on mousemove
			var isDrawing = false;
			// the last coordinates before the current move
			var startX;
			var startY;
			var newWeldElement, newWeldElementData;
//			var shiftKeyDown = false;

			// An element was created, need to add it to the canvas.
			var createAndAppend = function(payload) {
				//console.log('createAndAppend', payload);
				var newWeldElement = $compile(payload.directive)(scope);
				newWeldElement.css(payload.properties);
				element.append(newWeldElement);
			};

			var applyProperties = function(payload) {
				//console.log('applyProperties:', payload.id, payload);
				if (payload && payload.id) {
					var childElement = element.find('#' + payload.id);
					childElement.css(payload.properties);
					if (payload.innerHTML) {
						childElement.html(payload.innerHTML);
					}
					if (payload.parentId) {
						childElement.appendTo('#' + payload.parentId);
					}
				}
			};

			var deleteElement = function(id) {
				element.find('#' + id).remove();
			};

			weldComService.init(createAndAppend, applyProperties, deleteElement);

			element.css('cursor: crosshair;');

			element.bind('mousedown', function(event) {
				// Left mouse button only
				if (event.which === 1) {
					newWeldElementData = scope.getNewElement();
					if (newWeldElementData && newWeldElementData.directive) {
						isDrawing = true;
						startX = event.offsetX;
						startY = event.offsetY;
						var targetObj = $(event.target);
						// If clicked on other than #content (grid most likely)
						if (targetObj.attr('id') !== 'content') {
							startX = startX + targetObj.position().left;
						}
						newWeldElement = $compile(newWeldElementData.directive)(scope);
						element.append(newWeldElement);
						newWeldElement.css('position', 'absolute').css('left', startX + 'px').css('top', startY + 'px');
						//console.log('mousedown', targetObj, newWeldElement.cssProperty('left'), newWeldElement.cssProperty('top'));
						//newWeldElement.resizable();
					}
					else {
						isDrawing = false;
						scope.$broadcast('DeselectAllElements', null);
						// Create grid lines on click
						// if (shiftKeyDown) {
						// 	weldGridManager.addGridLine(null, event.offsetY + 'px');
						// } 
						// else {
						// 	//weldGridManager.addGridLine(event.offsetX + 'px', null);
						// 	weldGridManager.addGridLine((element.trueWidth() - event.offsetX) + 'px', null, true);
						// };
					}
				}
			});

			var calculateElementSize = function(event) {
				// Get current mouse position
				var currentX = event.offsetX;
				var currentY = event.offsetY;
				var width, height;
				// var width = currentX - startX;
				// var height = currentY - startY;

				//console.log('eventPhase', event.eventPhase);
				// eventPhase: 2 is event fired when dragging mouse outward
				// http://www.w3.org/TR/DOM-Level-3-Events/#event-flow
				if (event.eventPhase === 2) {
					width = currentX - startX;
					height = currentY - startY;
				}
				// eventPhase: 3 is event fired when dragging mouse inward
				if (event.eventPhase === 3) {
					width = currentX;
					height = currentY;
				}
				return {width: width, height: height};
			};

			element.bind('mousemove', function(event) {
				if (isDrawing) {
					var size = calculateElementSize(event);
					newWeldElement.css('width', size.width + 'px').css('height', size.height + 'px');
					//scope.$emit('AlignElement', newWeldElement, 'position');
				}
			});

			var updatePropertiesFromElement = function(payload) {
				var el = element.find('#' + payload.id);
				scope.updatePropertiesFromElement(el);
			};

			element.bind('mouseup', function(event) {
				// stop drawing
				isDrawing = false;
				if (newWeldElementData && newWeldElementData.directive) {
					var size = calculateElementSize(event),
						payload = {
							id: newWeldElementData.id,
							directive: newWeldElementData.directive,
							properties: {
								left: startX + 'px', top: startY + 'px', width: size.width + 'px', height: size.height + 'px'
							}
						};
					scope.createElement(payload);
					updatePropertiesFromElement(payload); // Just created the element, make sure the properties are in sync.
					newWeldElementData = null;
				}
			});

			// TODO: same as weldElement - merge?
			element.droppable({
				greedy: true,
				accept: ".weld-element",
				hoverClass: "ui-droppable-hover",
				activeClass: "ui-droppable-target",

				drop: function(event, ui) {
					var draggableName = ui.draggable.attr("id");
					var droppableName = $(this).attr("id");
					console.log("Dropped " + draggableName + " on " + droppableName);
					// Just drop if new parent
					if (ui.draggable.parent().attr('id') !== $(this).attr('id')) {
						ui.draggable.appendTo(this);
						ui.draggable.clearCssPosition();
						scope.$emit('ElementWasUpdated', ui.draggable);
					}
				}
			});

			// ----- Grid and Guidelines -----

			weldGridManager.setGridContainerElement(element);

			scope.toggleGrid = function () {
				if (weldGridManager.isGridVisible()) {
					weldGridManager.removeAllGridLines();
				}
				else {
					console.log('Creating grid');
					weldGridManager.createColumnGrid(12, 1.0, 0.5);
				}
			};

			// ----- UI Events -----

			scope.deleteSelectedElement = function () {
				console.log('DeleteElement');
				var id = scope.selectedElement.attr('id');
				scope.selectedElement.remove();
				scope.selectedElement = null;
				scope.deleteElement(id);
			};

			scope.duplicateSelectedElement = function () {
		        console.log('Duplicate');
			};

			// Receive 'AlignElement' from child
			scope.$on('AlignElement', function(event, childElement, changeDimension) {
				weldGridManager.alignElementToGrid(childElement, changeDimension);
			});

			scope.$watch('appProperties.showGrid', function(newVal, oldVal) {
				if (!newVal) {
					weldGridManager.removeAllGridLines();
				}
				else {
					console.log('Creating grid');
					weldGridManager.createColumnGrid(12, 1.0, 0.5);
				}
			});

			var changeCursor = function(newVal, oldVal) {
				switch (newVal) {
					case 'Select':
						element.css('cursor', 'pointer');
						break;
					case 'Text':
						element.css('cursor', 'text');
						break;
					default:
						element.css('cursor', 'crosshair');
				}
			};

			scope.$watch('tools.selected', changeCursor);

			// Keyboard shortcuts
			keyboardManager.bind('backspace', scope.deleteSelectedElement, { inputDisabled: true } );
			keyboardManager.bind('delete', scope.deleteSelectedElement, { inputDisabled: true } );
			keyboardManager.bind('ctrl+d', scope.duplicateSelectedElement, { inputDisabled: true } );
			keyboardManager.bind('meta+d', scope.duplicateSelectedElement, { inputDisabled: true } ); // Cmd+D on a Mac

			// Does nothing but required to refresh keyboardManagerService.isModifierKeyPressed values.
			keyboardManager.bind('alt', function () { });
			keyboardManager.bind('alt', function () { }, { type: 'keyup' });

			keyboardManager.bind('g', function () {
				/* //why not working?
				scope.appProperties.showGrid != scope.appProperties.showGrid;
				scope.$apply();
				console.log(scope.appProperties.showGrid);
				*/
				scope.toggleGrid();
			}, { inputDisabled: true } );

			keyboardManager.bind('shift+g', weldGridManager.removeAllGridLines, { inputDisabled: true });

			keyboardManager.bind('c', function () {
				console.log('Creating center grid');
				weldGridManager.removeAllGridLines();
				weldGridManager.addGridLine('50%', null);
				weldGridManager.addGridLine(null, '50%');
			}, { inputDisabled: true } );

		}
	};

});