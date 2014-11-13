var app = angular.module("chatterREST", ['ngCookies']);

////////////////////////////////////////////////////////

var FEED_UPDATE_EVENT = "FEED_UPDATE_EVENT";
var GROUP_UPDATE_EVENT = "GROUP_UPDATE_EVENT";
var FILE_FEED_UPDATE_EVENT = "FILE_FEED_UPDATE_EVENT";
var USER_DATA_UPDATE_EVENT = "USER_DATA_UPDATE_EVENT";
var TOPIC_DATA_UPDATE_EVENT = "TOPIC_DATA_UPDATE_EVENT";
var FEED_NON_WRITABLE = "FEED_NON_WRITABLE";
var FEED_WRITABLE = "FEED_WRITABLE";
var FEED_LOADING_START = 'FEED_LOADING_START';
var FEED_LOADING_STOP = 'FEED_LOADING_STOP';

var AUTHORIZATION_STARTED = false;
app.controller("chatterController", function(displayService, chatterService, $scope) {

	$scope.$on(FEED_UPDATE_EVENT, function(e, d) {
		$scope.showFeed = true;
		$scope.showFileFeed = false;
		$scope.feed = d.data;
		$scope.currentFeedId = d.feedId;
		$scope.currentFeedTitle = d.feedTitle;
	});

	$scope.$on(GROUP_UPDATE_EVENT, function(e, d) {
		$scope.groups = d.groups;
	});

	$scope.$on(FILE_FEED_UPDATE_EVENT, function(e, d) {
		$scope.showFeed = false;
		$scope.showFileFeed = true;
		$scope.fileFeed = d.files;
	});

	$scope.$on(USER_DATA_UPDATE_EVENT, function(e, d) {
		$scope.myUserData = d.myUser;
	});

	$scope.$on(TOPIC_DATA_UPDATE_EVENT, function(e, d) {
		$scope.topics = d.topics;
	});

	$scope.$on(FEED_WRITABLE, function(e, d) {
		$scope.feedWritable = true;
	})

	$scope.$on(FEED_NON_WRITABLE, function(e, d) {
		$scope.feedWritable = false;
	})

	$scope.$on(FEED_LOADING_START, function(e, d) {
		$scope.feedLoading = true;
	});
	$scope.$on(FEED_LOADING_STOP, function(e, d) {
		$scope.feedLoading = false;
	});

	$scope.getNewsFeed = function() {
		displayService.getNewsFeed();
	}

	$scope.getFilesFeed = function() {
		displayService.getFilesFeed();	
	}

	$scope.getBookmarksFeed = function() {
		displayService.getBookmarksFeed();
	}

	$scope.getTopicFeed = function(topicId, topicName) {
		var resource = '/services/data/v32.0/chatter/feeds/topics/' + topicId + '/feed-elements';
		displayService
			.getFeed(resource, topicName, undefined);
	}
	// initial steps
	$scope.showFeed = true;
	$scope.showFileFeed = false;	

	var checkToken = function() {
		if (chatterService.getToken() == undefined) {
			getCredentials();
			setTimeout(checkToken, 1000);
		} else {
			init();
		}
	}

	function init() {
		displayService.getNewsFeed();
		displayService.getGroupList();
		displayService.getUserData();
		displayService.getTopics();
	}
	checkToken();
});

app.controller("authController", function($location, $cookies, $cookieStore) {
	var urlData = parser($location.url().slice(1));
	$cookieStore.put('ACCESS_TOKEN', urlData.access_token);
	window.close();
});

app.factory("displayService", function($rootScope, chatterService) {
	var factory = {};
	var currentResource;
	var currentFeedId;
	var currentFeedTitle;

	factory.getFeed = function(resource, feedTitle, feedId) {

		if (feedId == undefined) {
			$rootScope.$broadcast(FEED_NON_WRITABLE);
		} else {
			$rootScope.$broadcast(FEED_WRITABLE);
		}
		currentResource = resource;
		currentFeedId = feedId;
		currentFeedTitle = feedTitle;

		chatterService
			.getResource(resource)
			.then(function(r) {
				$rootScope.$broadcast(FEED_UPDATE_EVENT, {
					data: r.data.elements, 
					feedId : feedId,
					feedTitle: feedTitle
				});
				$rootScope.$broadcast(FEED_LOADING_STOP);
			});
	}

	factory.getFilesFeed = function() {
		resource = '/services/data/v29.0/chatter/feeds/files/me/feed-items';
		chatterService
			.getResource(resource)
			.then(function(r) {
				$rootScope.$broadcast(FILE_FEED_UPDATE_EVENT, {
					files: r.data.items
				});
			});
	}

	factory.refreshFeed = function() {
		factory.getFeed(currentResource, currentFeedTitle, currentFeedId);
	}

	factory.getNewsFeed = function() {
		factory.getFeed('/services/data/v32.0/chatter/feeds/news/me/feed-elements?pageSize=10', 'My Feed', undefined);
	}

	factory.getBookmarksFeed = function() {
		factory.getFeed('/services/data/v32.0/chatter/feeds/bookmarks/me/feed-elements', 'My Bookmarks', undefined);
	}

	factory.getUserData = function() {
		var resource = ('/services/data/v32.0/chatter/users/me');
		chatterService
			.getResource(resource)
			.then(function(r) {
				$rootScope.$broadcast(USER_DATA_UPDATE_EVENT, {
					myUser: r.data
				});
			});
	}

	factory.getTopics = function() {
		chatterService
			.getResource('/services/data/v32.0/connect/topics/')
			.then(function(r) {
				$rootScope.$broadcast(TOPIC_DATA_UPDATE_EVENT, {
					topics : r.data.topics
				});
			});
	}

	factory.getGroupList = function() {
		chatterService
			.getResource('/services/data/v32.0/chatter/groups/')
			.then(function(r) {
				$rootScope.$broadcast(GROUP_UPDATE_EVENT, {
					groups : r.data.groups
				});
				//$rootScope.groups = filterMyGroups(data.groups);
			});
	}

	function filterMyGroups(groups) {
		r = [];
		for (var i=0; i<groups.length; i++ ) {
			if (groups[i].myRole == 'NotAMember') {
				continue;
			}
			r.push(groups[i]);
		}
		return r;
	}
	return factory;
});

app.factory("chatterService", function($http, $location, $cookies, $cookieStore, $q) {
	var factory = {};
	factory.getResource = function(resource) {
		var deferred = $q.defer();
		$http.post(SERVICE_URL + '/chatterService',
				{
					'SF_INSTANCE' : INSTANCE_URL,
					'SF_TOKEN' : factory.getToken(),
					'RESOURCE' : resource,
					'ACTION' : 'GET'
				}
			)
	 		.success(function(data, status, headers, config) {
	 			if (data[0] != undefined) {
	 				if (data[0].errorCode == "INVALID_SESSION_ID") {
	 					getCredentials();
	 				}
	 			}
	 			var contentType = headers('content-type');
	 			//deferred.resolve(JSON.stringify(data));
	 			var r = {data : data,
	 					'content-type' : headers('content-type')
	 			};
	 			deferred.resolve(r);
			})
	  		.error(function(data, status, headers, config) {
	  			deferred.reject();
	  		});
	  	return deferred.promise;
	}

	factory.postItem = function(resource, data) {
		var deferred = $q.defer();
		$http.post(SERVICE_URL + '/chatterService',
				{
					'SF_INSTANCE' : INSTANCE_URL,
					'SF_TOKEN' : factory.getToken(),
					'RESOURCE' : resource,
					'ACTION' : 'POST',
					'BODY' : data
				}
			)
	 		.success(function(data, status, headers, config) {
	 			deferred.resolve(data);
			})
	  		.error(function(data, status, headers, config) {
	  			deferred.reject();
	  		});
	  	return deferred.promise;
	}

	factory.patchItem = function(resource, data) {
		var deferred = $q.defer();
		$http.post(SERVICE_URL + '/chatterService',
				{
					'SF_INSTANCE' : INSTANCE_URL,
					'SF_TOKEN' : factory.getToken(),
					'RESOURCE' : resource,
					'ACTION' : 'PATCH',
					'BODY' : data
				}
			)
	 		.success(function(data, status, headers, config) {
	 			deferred.resolve(data);
			})
	  		.error(function(data, status, headers, config) {
	  			deferred.reject();
	  		});
	  	return deferred.promise;
	}

	factory.downloadFile = function(resource) {
		var deferred = $q.defer();
		$http.post(SERVICE_URL + '/chatterService',
				{
					'SF_INSTANCE' : INSTANCE_URL,
					'SF_TOKEN' : factory.getToken(),
					'RESOURCE' : resource,
					'ACTION' : 'DOWNLOAD'
				},
				{responseType : 'arraybuffer'}
			)
	 		.success(function(data, status, headers, config) {
				var file = new Blob([data], {type: headers('content-type')});
	 			deferred.resolve(file);
			})
	  		.error(function(data, status, headers, config) {
	  			deferred.reject();
	  		});
	  	return deferred.promise;
	}

	factory.getToken = function() {
		token = $cookieStore.get('ACCESS_TOKEN');
		return token;
	}

	return factory;
});

app.filter('prettydate', function() {
	return function(input) {
		return new Date(Date.parse(input)).toLocaleTimeString();
	};
});

app.filter('linebreak', function($sce) {
	return function(input) {
		if (input) {
			return $sce.trustAsHtml(input.replace(/\n/g, '<br/>'));
		}
		return '';
	}
})

// non-angular functions
function getCredentials() {
	if (! AUTHORIZATION_STARTED) {
		AUTHORIZATION_STARTED = true;
		window.open(AUTH_LINK, "_blank");
	}
}

// helpers
function parser(s) {
	var r = {};
	var kvPairs = s.split('&');
	for (var i = 0; i < kvPairs.length; i++) {
		r[kvPairs[i].split('=')[0]] = kvPairs[i].split('=')[1];
	}
	return r;
}
