	'use strict';

angular.module('WeldSparkApp').directive('weldElement', function($compile, $rootScope, keyboardManager) {

	// Drag-and-drop from scratch: http://stackoverflow.com/questions/1039986/how-to-implement-a-drag-and-drop-div-from-scratch

	return {
		restrict: 'C',

		scope: { }, // isolate scope

		link: function(scope, element) {

			// Unclear why I need this...but for a text edit submit it seems to fall back on the async solution...hmm
			// It feels like a cop out.
			var apply = function() {
				if (!$rootScope.$$phase) {
					scope.$apply();
				} else {
					setTimeout(function() {
						scope.$apply();
					});
				}
			};

			// Select current Element
			scope.toggleSelectElement = function() {
				scope.isSelected = !scope.isSelected;
				if (scope.isSelected) {
					scope.selectElement();
				}
				else {
					scope.deselectElement();
				}
            };

			scope.selectElement = function() {
				// Broadcast to all other elements to de-select
				
				scope.$emit('ElementWasSelected', element);

				if (!element.hasClass('selected')) {

					// Set as selected
					element.addClass('selected');

					// Draggable: drag to move position
					element.draggable({
						start: function(event, ui) {
							element.tempZ = element.css('z-index');
							element.css('z-index', 100);
							if (element.hasCssProperty('right')) {
								element.css('width', element.width() + 'px');
								element.clearCssProperties(['right']);
							}
						},
						drag: function(event, ui) {
							// propertiesPanel.updateValuesFromSelected();
							scope.$emit('AlignElement', element, 'position');
							scope.$emit('ElementWasUpdated', element);
						},
						stop: function(event, ui) {
							element.css('z-index', element.tempZ);
							// propertiesPanel.updateValuesFromSelected();
							scope.$emit('AlignElement', element, 'position');
							scope.$emit('ElementWasUpdated', element);
						},
						cancel:false
					});
					

					// Resizable element
					element.append('<div class="ui-resizable-handle ui-resizable-nw" id="nwgrip"></div>');
					element.append('<div class="ui-resizable-handle ui-resizable-ne" id="negrip"></div>');
					element.append('<div class="ui-resizable-handle ui-resizable-sw" id="swgrip"></div>');
					element.append('<div class="ui-resizable-handle ui-resizable-se" id="segrip"></div>');
					element.append('<div class="ui-resizable-handle ui-resizable-n"  id="ngrip"></div>');
					element.append('<div class="ui-resizable-handle ui-resizable-s"  id="sgrip"></div>');
					element.append('<div class="ui-resizable-handle ui-resizable-e"  id="egrip"></div>');
					element.append('<div class="ui-resizable-handle ui-resizable-w"  id="wgrip"></div>');

					element.resizable({
						//handles: "n, e, s, w",
						//handles: 'all',
						handles: {
							'nw': '#nwgrip',
							'ne': '#negrip',
							'sw': '#swgrip',
							'se': '#segrip',
							'n': '#ngrip',
							'e': '#egrip',
							's': '#sgrip',
							'w': '#wgrip'
						},
			  			//autoHide: true,
			  			resize: function(event, ui) {
							// propertiesPanel.updateValuesFromSelected();
							scope.$emit('AlignElement', element, 'size');
							scope.$emit('ElementWasUpdated', element);
			  			}
					});
				}
			};

			scope.deselectElement = function() {
				if (element.hasClass('selected')) {
					scope.isSelected = false;
					element.removeClass('selected');
					element.draggable('destroy');
					element.resizable('destroy');
					element.find('.control-handle').remove();
					element.find('.weld-child').off('mousedown');
				}
				if (scope.isEditing) {
					scope.endTextEditing();
				}
			};

            scope.$on('DeselectAllElements', function(event, emitterElement) {
            	// Only deselect if it wasn't *this* element that was clicked the first time
            	if (element !== emitterElement) {
	            	scope.deselectElement();
            	}
			});

			scope.innerHTML = 'Text';
			scope.isEditing = false;

			scope.beginTextEditing = function() {
//				console.log('beginTextEditing', scope.isEditing);
				scope.isEditing = true;
				apply();
				element.find('.weld-inline-editor').focus();
			};

			scope.endTextEditing = function(e) {
				console.log('endTextEditing', scope.isEditing, e);
				if (e && e.preventDefault) {
					e.preventDefault();
				}
				scope.isEditing = false;
				apply();
				scope.$emit('ElementWasUpdated', element);
			};

			var isMoving = false;
			var originalX, originalY;

			element.bind('mousedown', function(event) {
				// TODO: Need to split this function up
				/* jshint maxdepth: 5 */
				/* jshint maxcomplexity: 6 */
				// Left mouse button only
				if (event.which === 1) {
					event.stopPropagation();
					scope.selectElement();
					// Prepare drag-to-move
					//isMoving = true;
					//element.clearCssProperties(['margin-left', 'margin-right']);
					//console.log('weldElement.mousedown', scope.isSelected, isMoving, element.attr('style'));
					//originalX = event.offsetX;
					//originalY = event.offsetY;
					//console.log('startMove', originalX, originalY);
				}
			});

			// element.bind('mousemove', function(event) {
			// 	if (isMoving) {
			// 		//console.log('move', event.offsetX, event.offsetY);
			// 		element.css('left', element.position().left + (event.offsetX - originalX) + 'px');
			// 		element.css('top', element.position().top + (event.offsetY - originalY) + 'px');
			// 		scope.$emit('AlignElement', element, 'position');
			// 	}
			// });

			// element.bind('mouseup', function() {
			// 	// Stop moving
			// 	//console.log('stopMove');
			// 	isMoving = false;
			// });

			element.bind('dblclick', function(event) {
				scope.beginTextEditing();
			});

			// // Group by drag-drop
			// element.droppable({
			// 	greedy: true,
			// 	accept: ".weld-element",
			// 	hoverClass: "ui-droppable-hover",
			// 	activeClass: "ui-droppable-target",

			// 	drop: function(event, ui) {
			// 		var draggableName = ui.draggable.attr("id");
			// 		var droppableName = $(this).attr("id");
			// 		console.log("Dropped " + draggableName + " on " + droppableName);
			// 		// Just drop if new parent
			// 		if (ui.draggable.parent().attr('id') !== $(this).attr('id')) {
			// 			ui.draggable.appendTo(this);
			// 			ui.draggable.clearCssPosition();
			// 			scope.$emit('ElementWasUpdated', ui.draggable);
			// 		}
			// 	}
			// });

			// Select after created
			scope.selectElement();

		}
	};

});