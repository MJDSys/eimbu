'use strict';

/* Controllers */


angular.module('myApp.controllers', []).
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

function PdfCtrl($scope, $location){
	$scope.pdfUrl = '/api/pdf/tracemonkey.pdf';//'http://cdn.mozilla.net/pdfjs/tracemonkey.pdf';
	PDFJS.disableWorker = true; //disable cross-site origin issue
	$scope.pageNum = -1
	$scope.scale = 1.4
	$scope.pdfDoc = null;
	
	$scope.goPrevious = function() {
		if ($scope.pageNum <= 1)
			return;
		$scope.pageNum--;
		//$scope.renderPage($scope.pageNum);
	}
	$scope.goNext = function() {
		if ($scope.pageNum >= $scope.pdfDoc.numPages)
			return;
		$scope.pageNum++;
		//$scope.renderPage($scope.pageNum);
	}
	PDFJS.getDocument($scope.pdfUrl).then(function getPdfHelloWorld(_pdfDoc) {
		$scope.$apply(function() {
			$scope.pdfDoc = _pdfDoc;
			$scope.pageNum = 1;
			//$scope.renderPage($scope.pageNum);
		});
	});
}