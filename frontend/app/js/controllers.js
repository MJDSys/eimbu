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

/* Controllers */

angular.module('eimbu.controllers', []).
	controller('MyCtrl1', ['$scope', function($scope) {
		$scope.one = 1;
	}]).
	controller('MyCtrl2', ['$scope', function($scope) {
		$scope.two = 2;
	}]).
	controller('MyCtrl3', ['$scope', function($scope) {
		$scope.three = 3;
	}]).
	controller('MyCtrl4', ['$scope', function($scope) {
		$scope.four = 4;
	}]);

function CommentCtrl($scope, $location, Comment) {
	$scope.comments = Comment.query();
	$scope.addComment = function() {
		$scope.todos.push({text:$scope.commentText, done:false});
		$scope.commentText = '';
	};
	$scope.replies = function(){
	var count = 0;
	angular.forEach($scope.comments,function(comment){
		count+=comment.replies.length
	});
	return count;
	};

	$scope.refresh = function() {
		$scope.comments = Comment.query();
	};
	$scope.editPermissions = function() {
		$location.path('/permissions/');
	};
	$scope.pdfUrl = 'api/pdf/tracemonkey.pdf';//'http://cdn.mozilla.net/pdfjs/tracemonkey.pdf';
	PDFJS.disableWorker = true; //disable cross-site origin issue
	$scope.pageNum = -1
	$scope.scale = 1.4
	$scope.pdfDoc = null;
	
	$scope.goPrevious = function() {
		if ($scope.pageNum <= 1)
			return;
		$scope.pageNum--;
	}
	$scope.goNext = function() {
		if ($scope.pageNum >= $scope.pdfDoc.numPages)
			return;
		$scope.pageNum++;
	}
	PDFJS.getDocument($scope.pdfUrl).then(function getPdfHelloWorld(_pdfDoc) {
		$scope.$apply(function() {
			$scope.pdfDoc = _pdfDoc;
			$scope.pageNum = 1;
		});
	});
}

function PermissionCtrl($scope, $location, Permission) {
	$scope.permissions = Permission.query();
	
	$scope.goBack = function() {
		$location.path('/view/');
	};
}

function UserCtrl($scope, $location, User) {
	$scope.users = User.query();
	
	$scope.addUser = function() {
		$scope.users.push({"name": $scope.userEmail, "email": $scope.userEmail, "picture": "//ssl.gstatic.com/s2/profiles/images/silhouette96.png"});
	};
}

function UploadCtrl($scope) {
}

function FileCtrl($scope, $location, File) {
	$scope.files = File.query();
	$scope.goBack = function() {
		$location.path('/permissions/');
	};
	$scope.goUpload = function(){
		$location.path('/upload');
	};
	$scope.uploadFile = function(){
		var id = 123;//use file id returned from server
		$location.path('/view/'+id);
	};
	$scope.selectFile = function(id){
		$location.path('/view/'+id);
	};
	$scope.selectFolder = function(id){
		$location.path('/upload/'+id);
	};
	//$location.path('/select/critiquepaper/');
}
