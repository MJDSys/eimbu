'use strict';

/* Directives */


angular.module('eimbu.directives', []).
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
					page.render(renderContext).then(function(){
						angular.forEach(scope.comments,function(comment){
							angular.forEach(comment.anchor,function(anchor){
								if (pageNum == anchor.p) {
									ctx.fillStyle = 'red';
									ctx.fillRect(anchor.x, anchor.y, anchor.w, anchor.h);
								}
							});
						});
					});
				});
			}
			
			// watch the expression, and update the UI on change.
			scope.$watch(attrs.pdfCanvas, function(value) {
				renderPdf(value);
			});
		}
	});
