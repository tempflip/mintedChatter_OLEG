app.directive("feedItem", function(chatterService, displayService) {
	function link(scope, element, attrs) {	
		scope.commentLoading  = false;
		scope.itemActionLoading = false;

		scope.getFile = function(resource) {
			chatterService.downloadFile(resource)
				.then(function(blob) {
					url = window.URL.createObjectURL(blob);
    				window.open(url, "_blank");
				});
		}
		scope.postComment = function() {
			scope.commentLoading = true;
			var data = { 
				body : {
					messageSegments : [
				    {
				    	type : "Text",
				    	text : scope.comment
				    }
				    ]
				}
			};
			chatterService.postItem('/services/data/v32.0/chatter/feed-elements/' + scope.element.id + '/capabilities/comments/items', data)
				.then(function(r) {
					displayService
						.refreshFeed();
				});				
		}

		scope.likeItem = function(id) {
			scope.itemActionLoading = true;
			var data = {body : {}};
			chatterService.postItem('/services/data/v32.0/chatter/feed-elements/' + id + '/capabilities/chatter-likes/items', data)
				.then(function(r) {
					displayService
						.refreshFeed();
				});				
		}
		scope.bookmarkItem = function(id) {
			scope.itemActionLoading = true;
			var data = {
	   			"isBookmarkedByCurrentUser": true
			};
			chatterService.patchItem('/services/data/v32.0/chatter/feed-elements/' + id + '/capabilities/bookmarks', data)
				.then(function(r) {
					console.log('item bookmarked', r);
					displayService
						.refreshFeed();
				});				
		}
		/*scope.likeComment = function(id) {
			console.log('like ezt:', id);
			var data = {body : {}};
			chatterService.postItem('/services/data/v32.0/chatter/comments/' + id + '/likes', data)
				.then(function(r) {
					displayService
						.refreshFeed();
				});				
		}*/
	}

	return {
		restrict : 'E',
		scope: {
			element : '=element',
		},
		link : link,
		templateUrl: FEED_ITEM_TEMPLATE
	}
});

app.directive("groupItem", function(displayService) {
	function link(scope, element, attrs) {
		scope.getGroupFeed = function(groupId, groupName) {
			displayService
				.getFeed('/services/data/v32.0/chatter/feeds/record/' + groupId + '/feed-elements', groupName, groupId);
		}
	}
	return {
		restrict : 'E',
		scope: {
			group : '=group',
		},
		link : link,
		templateUrl: GROUP_ITEM_TEMPLATE
	}
});

app.directive("postBox", function(chatterService, displayService, $rootScope) {
	function link(scope, element, attrs) {
		scope.postItem = function(text) {
			var data = { 
			   feedElementType : "FeedItem",
			   subjectId: scope.subject,
			   body : {
			      messageSegments : [
			      {
			         type : "Text",
			         text : text
			      }
			      ]
			   }
			};
			chatterService.postItem('/services/data/v32.0/chatter/feed-elements', data)
				.then(function(r) {
					console.log('POST RESPONSE', r)
					displayService
						.refreshFeed();
				});
			$rootScope.$broadcast(FEED_LOADING_START);
		}
	}

	return {
		restrict : 'E',
		scope : {
			subject : '=subject' 
		},
		link : link,
		templateUrl : POST_BOX_TEMPLATE
	}
});


app.directive("fileItem", function(chatterService) {
	function link(scope, element, attrs) {
		scope.getFile = function(resource) {
			chatterService.downloadFile(resource)
				.then(function(blob) {
					url = window.URL.createObjectURL(blob);
    				window.open(url, "_blank");
				});
		}
	}

	return {
		restrict : 'E',
		scope : {item : "=item"},
		link : link,
		templateUrl : FILE_ITEM_TEMPLATE
	}
});

app.directive("fileItemHeader", function() {
	console.log('DWAd3e3234243434343');
	return {
		restrict : 'A',
		templateUrl : FILE_ITEM_HEADER_TEMPLATE
	};
});
