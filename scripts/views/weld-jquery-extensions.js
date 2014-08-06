// jQuery extensions

;(function ($) {

	// http://stackoverflow.com/questions/11832914/round-up-to-2-decimal-places-in-javascript
	Number.prototype.round = function(places) {
		return +(Math.round(this + "e+" + places)  + "e-" + places);
	}

	// http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
	String.prototype.toDash = function(){
		return this.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
	};

	String.prototype.toCamel = function(){
		return this.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
	};

	/* --------- */

 	/* Return the raw CSS value from 'style', instead of converting to px. */
    $.fn.cssProperty = function (wantedParameter) {
    	wantedParameter = wantedParameter.toDash();
		var paramArray = this.attr('style').split(';');
		for (var p in paramArray) {
			var parameterName = paramArray[p].substring(0, paramArray[p].indexOf(':')).trim();
			if (parameterName === wantedParameter) {
				return paramArray[p].substring(paramArray[p].indexOf(':') + 1, paramArray[p].length).trim(); 
			}
		}
		return null;
	};

	/* Return the CSS unit e.g. 'px', '%', 'em'. */
    $.fn.hasCssProperty = function (wantedParameter) {
    	if (this.cssProperty(wantedParameter))
    		return true
    	else
    		return false; 
    }

 	/* Return the CSS unit e.g. 'px', '%', 'em'. */
    $.fn.cssPropertyUnit = function (wantedParameter) {
    	var rawCss = this.cssProperty(wantedParameter);
    	var rawCssValue = (parseFloat(rawCss) + '');
    	if (rawCss)
	    	return rawCss.substring(rawCssValue.length, rawCss.length);
	    else
	    	return null; 
    }

 	/* Clear all CSS properties in the array. */
    $.fn.clearCssProperties = function (paramArray) {
		for (var p in paramArray) {
			this.css(paramArray[p], '');
		}
		return this;
	};

 	/* Clear all position properties. */
    $.fn.clearCssPosition = function (paramArray) {
    	this.clearCssProperties(['position', 'left', 'top', 'right', 'bottom']);
    }

 	/* Return real width in px including padding, margin, border. */
    $.fn.trueWidth = function () {
		var elementSize = this.width();
		//elementSize += parseInt(this.css("margin-left"), 10) + parseInt(this.css("margin-right"), 10); // Total Margin Width
		elementSize += parseInt(this.css("padding-left"), 10) + parseInt(this.css("padding-right"), 10); // Total Padding Width
		elementSize += parseInt(this.css("borderLeftWidth"), 10) + parseInt(this.css("borderRightWidth"), 10); // Total Border Width
		return elementSize;
	};
 
 	/* Return real height in px including padding, margin, border. */
    $.fn.trueHeight = function () {
		var elementSize = this.height();
		//elementSize += parseInt(this.css("margin-top"), 10) + parseInt(this.css("margin-bottom"), 10); // Total Margin Width
		elementSize += parseInt(this.css("padding-top"), 10) + parseInt(this.css("padding-bottom"), 10); // Total Padding Width
		elementSize += parseInt(this.css("borderTopWidth"), 10) + parseInt(this.css("borderBottomWidth"), 10); // Total Border Width
		return elementSize;
	};
 
}(jQuery));