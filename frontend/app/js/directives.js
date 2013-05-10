/*
 Copyright (C) 2013 Matthew Dawson (matthew@mjdsystems.ca)
 Copyright (C) 2013 Nathan Jervis (mirhagk@gmail.com)

 Eimbu is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 Eimbu is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
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
