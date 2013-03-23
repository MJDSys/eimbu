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


function CommentCtrl($scope, Comment) {
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
}

function PermissionCtrl($scope, Permission) {
	$scope.permissions = Permission.query();
}

function UserCtrl($scope, User) {
	$scope.users = User.query();
	
	$scope.addUser = function() {
		$scope.users.push({"name": $scope.userEmail, "email": $scope.userEmail, "picture": "//ssl.gstatic.com/s2/profiles/images/silhouette96.png"});
	};
}

function UploadCtrl($scope) {
}

function FileCtrl($scope, File) {
	$scope.files = File.query();
	//$location.path('/select/critiquepaper/');
}