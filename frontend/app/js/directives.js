'use strict';

/* Directives */


angular.module('myApp.directives', []).
	directive('appVersion', ['version', function(version) {
		return function(scope, elm, attrs) {
			elm.text(version);
		};
	}])
	.directive('pdfCanvas', function($timeout, dateFilter) {
		return function(scope, element, attrs) {
			var ctx = element[0].getContext('2d');
			function renderPdf(pageNum){
				// Using promise to fetch the page
				if (scope.pdfDoc == null)
					return;
				scope.pdfDoc.getPage(pageNum).then(function(page) {
					var viewport = page.getViewport(scope.scale);
					element[0].height = viewport.height;
					element[0].width = viewport.width;

					// Render PDF page into canvas context
					var renderContext = {
						canvasContext: ctx,
						viewport: viewport
					};
					page.render(renderContext);
				});
			}
			
			// watch the expression, and update the UI on change.
			scope.$watch(attrs.pdfCanvas, function(value) {
				renderPdf(value);
			});
		}
	});
