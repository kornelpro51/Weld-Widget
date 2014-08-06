'use strict';

app.factory('weldGridManager', function ($compile) {
	// Private methods

	var snapToTreshold = 10;

	var gridContainerElement = null;

	var highlightGridline = function (gridLineElement) {
		gridLineElement.addClass('highlighted');
		setTimeout(function (gridLineElement) {
			gridLineElement.removeClass('highlighted');
		}, 1000, gridLineElement);
	};

	var findClosestGridLine = function (dimensionName, positionValue) {
		var closestGridLine = null;
		var closestGridLineDistance = 99999;
		// Translate 'left' to 'x', etc
		var dimensionClass = 'x';
		if (dimensionName === 'top') {
			dimensionClass = 'y';
		}
		var gridLineElements = gridContainerElement.find('.weld-gridline');
		for (var g in gridLineElements) {
			if (gridLineElements[g].nodeType === 1) {
				var gridLineElement = $(gridLineElements[g]);
				if (gridLineElement.hasClass('weld-gridline')) {
					if (gridLineElement.hasClass(dimensionClass)) {
						var linePosition = parseInt(gridLineElement.position()[dimensionName]);
						var lineDistance = Math.abs(linePosition - positionValue);
						if (lineDistance < closestGridLineDistance) {
							closestGridLine = gridLineElement;
							closestGridLineDistance = lineDistance;
						}
					}
				}
			}
		}
		return closestGridLine;
	};

	var checkGridLineCollision = function (gridLineElement, childElement, collisionSide, changeDimension) {
		// Set properties
		if (collisionSide === 'left' || collisionSide === 'right' || collisionSide === 'center') {
			var collisionOppositeSide = (collisionSide === 'right' ? 'left' : 'right'); //TODO: fix center/middle
			var posDimension = 'left';
			var sizeDimension = 'width';
			var elementSize = childElement.trueWidth();
			var linePositionSide = (gridLineElement.hasCssProperty('left') ? 'left' : 'right');
			var linePositionOppositeSide = (linePositionSide === 'right' ? 'left' : 'right');
		}
		else {
			var collisionOppositeSide = (collisionSide === 'bottom' ? 'top' : 'bottom'); //TODO: fix center/middle
			var posDimension = 'top';
			var sizeDimension = 'height';
			var elementSize = childElement.trueHeight();
			var linePositionSide = (gridLineElement.hasCssProperty('top') ? 'top' : 'bottom');
			var linePositionOppositeSide = (linePositionSide === 'bottom' ? 'top' : 'bottom');
		}
		var elementPosition = parseInt(childElement.position()[posDimension]);
		var linePosition = parseInt(gridLineElement.position()[posDimension]);
		if (collisionSide === 'left' || collisionSide === 'top') {
			var distance = Math.abs(elementPosition - linePosition);
		}
		else if (collisionSide === 'center' || collisionSide === 'middle') {
			var distance = Math.abs(elementPosition + elementSize/2 - linePosition);
		}
		else if (collisionSide === 'right' || collisionSide === 'bottom') {
			var distance = Math.abs(elementPosition + elementSize - linePosition);
		}

		// Check if within snap-to distance
		if (distance < snapToTreshold) {
			//console.log(collisionSide + ' side hit!', gridLineElement.cssProperty(linePositionSide), 'child (L,R,W):', childElement.cssProperty(linePositionSide), childElement.cssProperty(linePositionOppositeSide), childElement.cssProperty(sizeDimension));
			if (collisionSide === 'left' || collisionSide === 'top') {
				childElement.css(posDimension, gridLineElement.cssProperty(posDimension));
				highlightGridline(gridLineElement);
			}
			if (collisionSide === 'right' || collisionSide === 'bottom') {
				if (changeDimension === 'position') {
					childElement.css(posDimension, (linePosition - elementSize + 2) + 'px');
				}
				else if (childElement.cssPropertyUnit(posDimension) === '%') {
					// Resize + snap to right/bottom if element has a left/top position set in %: add % width
					//console.log('Resize width', parseFloat(childElement.cssProperty(posDimension)), parseFloat(gridLineElement.cssProperty(posDimension)) );
					var arbitraryAdjustmentValue = 2.0; // Using real % difference makes elements too wide
					childElement.css(sizeDimension, Math.abs(parseFloat(childElement.cssProperty(posDimension)) - parseFloat(gridLineElement.cssProperty(posDimension)) + arbitraryAdjustmentValue).round(2) + '%');
				}
				highlightGridline(gridLineElement);
			}
		}
	};

	// Public API here
	return {

		setGridContainerElement: function (element) {
			gridContainerElement = element;
		},

		addGridLine: function (xCoord, yCoord, swapAxis) {
			if (xCoord) {
				// Vertical lines along X axis: |
				var gridlineHTML = '<div class="weld-gridline x"></div>';
				var gridlineElement = $(gridlineHTML);
				gridContainerElement.append(gridlineElement);
				if (swapAxis) {
					gridlineElement.css('right', xCoord);
				}
				else {
					gridlineElement.css('left', xCoord);
				}
			}
			if (yCoord) {
				// Horisontal lines along Y axis: ———
				var gridlineHTML = '<div class="weld-gridline y"></div>';
				var gridlineElement = $(gridlineHTML);
				gridContainerElement.append(gridlineElement);
				if (swapAxis) {
					gridlineElement.css('bottom', yCoord);
				}
				else {
					gridlineElement.css('top', yCoord);
				}
			}
			//console.log('addGridLine', xCoord, yCoord, swapAxis);
		},

		removeAllGridLines: function () {
			gridContainerElement.find('.weld-gridline').remove();
			gridContainerElement.find('.weld-grid-column').remove();
		},

		isGridVisible: function () {
			if (gridContainerElement.find('.weld-gridline').length === 0)
				return false;
			else
				return true;
		},

		createColumnGrid: function (nrOfColumns, gutterWidth, marginWidth) {
			// Create margin lines at zero
			this.addGridLine('0%', null);
			this.addGridLine('0%', null, true);
			this.addGridLine(null, '0%');
			this.addGridLine(null, '0%', true);
			// Create column grid
			var maxWidth = 100.0;
			var columnWidth = (maxWidth - 2 * marginWidth - (nrOfColumns - 1) * gutterWidth) / nrOfColumns;
			var linePosition;
			for (var c = 0; c < nrOfColumns; c++) {
				linePosition = (marginWidth + c * (columnWidth + gutterWidth)).round(2);
				this.addGridLine(linePosition + '%', null);
				this.addGridLine((100 - linePosition) + '%', null);
				//this.addGridLine(linePosition + '%', null, true); // from right edge
				// Create the visual columns
				var gridColumnHTML = '<div class="weld-grid-column"></div>';
				var gridColumnElement = $(gridColumnHTML);
				gridContainerElement.append(gridColumnElement);
				gridColumnElement.css('left', linePosition + '%').css('width', columnWidth + '%');
			};
		},

		alignElementToGrid: function (childElement, changeDimension) {
			var dimPosition = ['left', 'top'];
			var dimOppositePosition = ['right', 'bottom'];
			for (var p in dimPosition) {
				var elementPosition = parseInt(childElement.position()[dimPosition[p]]);
				var elementSize = ( dimPosition[p] === 'left' ? childElement.trueWidth() : childElement.trueHeight() );
				var gridLineElement;
				// Left/Top side of element: --> |[•••]
				gridLineElement = findClosestGridLine(dimPosition[p], elementPosition);
				if (gridLineElement) {
					checkGridLineCollision(gridLineElement, childElement, dimPosition[p], changeDimension);
				}
				// Center of element: [•••]| <--
				//checkGridLineCollision('center', Math.abs(elementPosition + elementSize/2 - linePosition), gridLineElement, childElement);
				// Right/Bottom side of element: [•••]| <--
				gridLineElement = findClosestGridLine(dimPosition[p], elementPosition + elementSize);
				if (gridLineElement) {
					checkGridLineCollision(gridLineElement, childElement, dimOppositePosition[p], changeDimension);
				}
			}
		}

	};

});