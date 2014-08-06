app.factory('weldComService', function(socket, session) {
	console.log('weldComService ', socket);
	return {
		init: function(createAndAppend, applyProperties, deleteElement) {

			console.log('weldComService.init, session:', session);

			socket.emit('wc:register-session', session.sessionId);

			socket.on('ws:create', function(payload) {
				console.log('on ws:create', payload);
				createAndAppend(payload);
			});

			var loopThroughElementsAndApplyFunction = function(data, fn) {
				var element, payload;
				for (element in data) {
					if (data.hasOwnProperty(element)) {
						payload = data[element];
						fn(payload);
					}
				}
			};

			socket.on('ws:init-data', function(data) {
				console.log('on ws:init-data', data);
				// Need create and append before applying properties because
				loopThroughElementsAndApplyFunction(data, createAndAppend);
				// applying properties may rearrange the DOM structure.
				loopThroughElementsAndApplyFunction(data, applyProperties);
			});

			socket.on('ws:update', function(payload) {
				//console.log('on - ws:update', payload);
				applyProperties(payload);
			});

			// Element was deleted
			socket.on('ws:delete', function(id) {
				console.log('on - ws:delete', id);
				deleteElement(id);
			});

		}
	};
});
