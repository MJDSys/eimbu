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
			console.log(attrs);
			var pageNum = 1;
			// watch the expression, and update the UI on change.
			scope.$watch(attrs.pdfCanvas, function(value) {
				renderPdf(value);
			});
			// watch the expression, and update the UI on change.
			scope.$watch(scope.comments, function(value) {
				renderPdf(pageNum);
				console.log("H");
			});
			var down = {x: 0, y:0}
			element[0].addEventListener("mousedown", function(event) {
				down.x = event.clientX;
				down.y = event.clientY;
				down.x -= element[0].offsetLeft;
				down.y -= element[0].offsetTop;
				//alert(down.x + " " + event.pageX)
			}, false);
			element[0].addEventListener("mouseup", function(event) {
				var x = event.clientX;
				var y = event.clientY;
				x -= element[0].offsetLeft;
				y -= element[0].offsetTop;
				//scope.$apply(function() {
				scope.add_comment({
					"id": "123131313131",
					"createdDate": "2013-03-22T22:06:56.848Z",
					"name": "Nathan Jervis",
					"picture": "//ssl.gstatic.com/s2/profiles/images/silhouette96.png",
					"text": "Comments are great",
					"status": "open",
					"anchor": [ {"p": pageNum, "x": down.x, "y": down.y, "w":x - down.x, "h":y - down.y}],
					"replies":[
					{
						"id": "1234131",
						"createdDate": "2013-03-22T22:06:56.848Z",
						"name": "STEVE Jervis",
						"picture": "//ssl.gstatic.com/s2/profiles/images/silhouette96.png",
						"text": "So are SUPER awesome replies"
					}
					]
				});
				//});
				renderPdf(pageNum);
				console.log({"p": pageNum, "x": down.x, "y": down.y, "w":x - down.x, "h":y - down.y});
			}, false);
		}
	});
