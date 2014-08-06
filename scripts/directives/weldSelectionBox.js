'use strict';

app.directive('weldSelectionBox', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the weldSelectionBox directive');
      }
    };
  });