(function () {
	'use strict';
	/* college-specific variables */
	var colAbbr = 'arc';
	var libchatHash = '39df8b17e49bd4efbb4461f1831118b9';
	var c19Page = 'https://libguides.arc.losrios.edu/c.php?g=1012164';
	/* end college-specific variables */
	var viewCode = function (str) { // allow all views to refer to templates in their own view
		// EXL uses a colon in their URL but as it is loading it may show as HTML entity, we can't predict
		if (str.indexOf('%3A') > -1) {
			str = str.replace(/%3A/g, ':');
		}
		var environment = 'LRCCD'; 
		if (str.indexOf('01CACCL_CC') > -1) { // this allows us to use the sandbox
			environment = 'CC';
		}
		var arr=str.split('01CACCL_'+ environment + ':');
		var arr2=arr[1].split('&');
		return {
			env: environment,
			view: arr2[0]
		};
	}(location.href);
	// use bitbucket directory for external files when in sandbox
	var districtHost = 'https://www.library.losrios.edu/';
	var filePath = ''; 
	if (viewCode.env === 'CC') {
		filePath = colAbbr + '/bitbucket/lsp-related-tools-and-resources/';
	}
	var libraries = [
		{
			name: 'American River',
			abbr: 'arc',
			path: 'student-resources/library',
			phone: '484-8455',
			center: 'Natomas Center',
			centerurl: 'https://libguides.arc.losrios.edu/c.php?g=366843&amp;p=6570176'
		},

		{
			name: 'Cosumnes River',
			abbr: 'crc',
			path: 'student-resources/library',
			phone: '691-7266',
			center: 'Elk Grove Center',
			cpath: 'about/elk-grove-center-library-services'
			},

		{
			name: 'Folsom Lake',
			abbr: 'flc',
			path: 'student-resources/library',
			phone: '608-6613',
			centers: [
				{
					center: 'El Dorado Center',
					cpath: 'student-resources/library/about/el-dorado-center'
				},
				{
					center: 'Rancho Cordova Center',
					cpath: 'student-resources/library/about/rancho-cordova-center'
				}]
		},

		{
			name: 'Sacramento City',
			abbr: 'scc',
			path: 'library',
			phone: '558-2301',
			centers: [
				{
					center: 'Davis Center',
					cpath: 'student-resources/support-services/davis-center-services/davis-center-library-services'
				},
				{
					center: 'West Sacramento Center',
					cpath: 'student-resources/support-services/west-sacramento-center-services/west-sacramento-center-library-services'
				}
			]
			}
		];
	var custPackagePath = '/discovery/custom/01CACCL_' + viewCode.env + '-' + viewCode.view;
	var app = angular.module('viewCustom', ['angularLoad']);
	
	// logo
	app.component('prmSearchBarAfter', {
		bindings: {parentCtrl: '<'},
		controller: 'prmSearchBarAfterController',
		template: '<div id="lr-onesearch" hide="" show-gt-sm=""><md-button aria-label="OneSearch" ng-href="{{$ctrl.homePage}}" ng-click="$ctrl.scrollUp()"><img ng-src="' + custPackagePath + '/img/onesearch-logo.png" alt="OneSearch - Los Rios Libraries"> </md-button></div>'
		
		});
	app.controller('prmSearchBarAfterController', ['$window', function($window) {
		var vm = this;
		vm.homePage = '/discovery/search?vid=' + vm.parentCtrl.vid;
		vm.scrollUp = function() { // force page to scroll up
			$window.scrollTo(0,0);
			return true;
		};

		
	}]);
	app.controller('exploreFooterAfterController', ['$window', function($window) {
		var vm = this;
		vm.browseURL = '/discovery/browse?vid=01CACCL_' + viewCode.env + ':' + viewCode.view;
		vm.scrollUp = function() { // force page to scroll up when clicking browse link in footer
			$window.scrollTo(0,0);
			return true;
		};

		vm.checkForContent = function () {
			var content = angular.element(document.getElementsByTagName('md-content'));
			if (content.length > 0) {
				var h = 0;
				for (var i = 0; i < content.length; i++) {
					h += content[i].offsetHeight;
				}
				if ((h > 340) || (angular.element(document.querySelector('prm-browse-search')).length > 0)) {
					return true;
				}
			}
		};
		vm.LRLogoSrc = custPackagePath + '/img/Los Rios Libraries_Logo_Horizontal_BW.png';
		vm.libraries = libraries;
		vm.c19Page = c19Page;
		vm.askUs = districtHost + 'ask-us/?' + colAbbr;
		}]);

	app.component('prmExploreFooterAfter', { // insert template into footer area
		controller: 'exploreFooterAfterController',
		templateUrl: custPackagePath + '/html/footer.html'
	});
	app.component('lrNewbooksDisplay', {
		templateUrl: custPackagePath + '/html/homepage/newbooks-display.html',
		controller: 'lrNewbooksDisplayController'
	});
	app.controller('lrNewbooksDisplayController', ['$http', '$timeout','$interval', function($http, $timeout,$interval) {
		var vm = this;
		var numToShow = 8;
		var idRegex = /(^(978\d{10})|(\d{9}[\dxX])$)|^kan_/;
		vm.bookList = false; // when this becomes true, content block will show
		var makeList = function(arr) { // the main function for displaying the books
			if (arr.length < numToShow) { // if anyone keeps showing more and gets to the end of the array...
				numToShow = arr.length;
			}
			if (!(vm.bookList)) { // this is on first page load or return to home page
				// create first set of in titles to show
				var newArr = [];
				for (var i = 0; i < numToShow; i++) { // create the initial display
					newArr.push(arr[i]);
				}
				vm.bookList = newArr;
			} else {
				// this is for when "show more" is selected - push more into array
				for (var j = 0; j < numToShow; j++) { // why are we repeating this--seems like we could do this as a function...
					vm.bookList.push(arr[j]);
				}

			}
			newBooksArr.splice(0, numToShow); // hm... this means that if you go elsewhere in primo and return to the home page, the array is reduced in size from what it was. Maybe that's ok
		};
		var shuffleArr = function(array) { // randomizes the array. https://stackoverflow.com/a/2450976/1903000
			var currentIndex = array.length,
				temporaryValue, randomIndex;
			// While there remain elements to shuffle...
			while (0 !== currentIndex) {
				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;
				// And swap it with the current element.
				temporaryValue = array[currentIndex];
				array[currentIndex] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			}
			return array;
		};
		vm.makeId = function(str) { // only add id attribute for titles iwth proper ISBN or Kanopy id
			if (idRegex.test(str) === true) {
				return 'lr_' + str;
			}
		};
		vm.checkIdentifier = function(str) { // titles without proper ISBN or Kanopy ID are treated as no-cover
			str = str.replace(/^lr_/, '');
			if (idRegex.test(str) === false) {
				return 'no-cover';
			}
		};

		vm.imgSrc = function(str) { // determines source of images; syndetics uses isbn, kanopy has its own system
			if (str.indexOf('kan_') === 0) {
				var arr = str.split('kan_');
				return 'https://www.kanopy.com/node/' + arr[1] + '/external-image';
			} else if (idRegex.test(str) === true) {
				return 'https://syndetics.com/index.php?client=primo&isbn=' + str + '/mc.jpg';
			}
		};
		vm.checkImg = function(str) { // syndetics returns a 1x1 pixel image if it doesn't have a jacket based on isbn queried. so detect this and change classname when that happens to allow alternative styling
			var checkInt = $interval(function() { // interval allows some time for jacket to load
				var el = document.getElementById(str);
				var img = el.querySelector('#' + str + ' img');
				if ((angular.element(el).length) && (!(angular.element(el).hasClass('no-cover')))) {
					if ((img.complete === true) && (img.height === 1)) { 
						angular.element(el).addClass('no-cover'); // maybe there's a better way to do this using ng-class
					}
				}
			}, 1000);
			$timeout(function() { // not good to let the interval run indefinitely
				$interval.cancel(checkInt);
			}, 4000);
		};
		
		vm.truncateTitle = function(str) { // full title is supplied for title attribute, but we want it to be truncated when displayed on items that don't have jacket images
			var output = '<span class="lr-newbook-maintitle">';
			// separate title from statement of responsibility
			var arr = str.split('/');
			// var totalLength = 0;
			var mainTitle, subTitle, authors, subTitleSp, authorsSp;
			if (arr.length > 1) {
				var authArr = arr[1].split(';');
				authors = authArr[0].trim();
				authors = authors.replace(/\.$/, '').replace(/[\[\]]/g, '');
				authorsSp = '<span class="lr-newbook-author">' + authors + '</span>';
			} else {
				authors = false;
			}
			// separate main title from subtitle
			var wholeTitle = arr[0];
			var arr2 = wholeTitle.split(':');
			mainTitle = arr2[0].trim();
			output += mainTitle + '</span> ';
			if (arr2.length > 1) {
				if (arr2.length > 2) { // indicates there's a colon in the subtitle
					subTitle = arr2[1].trim() + ': ' + arr2[2].trim();
				}
				else {
					subTitle = arr2[1].trim();
				}
				subTitleSp = '<span class="lr-newbook-subtitle">' + subTitle + '</span> ';
			} else {
				subTitle = false;
			}
			// limit what we include; if title + subtitle is not too long, include that. If it is, check if statement of repsnsibilty is not too long.
			var arr3 = mainTitle.trim().split(' ');
			if (subTitle !== false) {
				if (arr3.length + subTitle.trim().split(' ').length < 11) {
					output += subTitleSp;
					//		console.log(output);
				} else if ((authors) && (authors.trim().split(' ').length < 4)) {
					output += authorsSp;
					//	console.log(output);
				}

			} else {
				if (authors !== false) {
					if (authors.trim().split(' ').length < 5) {
						output += authorsSp;
					}
				}
			}

			return output;
		};
		vm.itemFormat = function(str) {
			return 'lr-format-' + str; // helps id book vs. video
		};
		vm.varyFlex = function(str) { // allows negative space, and kanopy images to be twice the width
			if (str.indexOf('kan_') > -1) {
				return ['flex-gt-sm-40', 'flex-100'];
			}
			else {
				return ['flex-20', 'flex-xs-40'];
			}
		};
		if (typeof(newBooksArr) !== 'undefined') {
			// this will happen if user comes back to home page from elsewhere in Primo
			makeList(newBooksArr);
		} else {
			// this will happen on initial page load
			$http.get(districtHost + filePath + 'utilities/analytics/analytics-proxy.php?report=onesearch_new_online')
				.then(function(response) {
					var arr = response.data.QueryResult.ResultXml.rowset.Row; // table
					console.log(arr);
					// randomize the array
					var shuffledArr = shuffleArr(arr);
					window.newBooksArr = shuffledArr; // cache randomized array of new title objects as global variable
					makeList(newBooksArr);
				}, function(response) { // on error, hide the card and log error to console
					vm.bookList = false;
					console.log('http get error: ');
					console.log(response);
				});
		}
		vm.addBooks = function() {
			makeList(newBooksArr);
		};
		vm.showButton = function() { // removes button if anyone gets all the way to the end of the array
			if (newBooksArr.length > 0) {
				return true;
			}
		};
		// keep track of this array in console, for testing
		console.log('newBooksArr: ');
		if (typeof(newBooksArr) !== 'undefined') {
			console.log(newBooksArr);
		}
	}]);
	// faq on home page. To implement, add matching directive to html in home page
	app.component('lrHomepageFaq', {
		controller: 'lrHomepageFaqController',
		template: '<div id="lr-faq-block" ng-init="$ctrl.getFaq();"><md-list ng-if="$ctrl.faqExist" id="lr-faq-list"><md-list-item ng-repeat="f in $ctrl.faqList" layout-padding><a href="{{f.url.public}}" target="_blank">{{f.question}}</a></md-list-item></md-list><p layout="row" layout-align="end start"><md-button ng-href="https://answers.library.losrios.edu/{{$ctrl.col}}" target="_blank">More Library Answers <md-icon md-svg-icon="action:ic_launch_24px"></md-icon></md-button></p></div>'
	});
	app.controller('lrHomepageFaqController', ['$http', '$window', function($http, $window) {
		var vm = this;
		vm.col = colAbbr;
		vm.faqList = '';
		vm.faqExist = false;
		vm.getFaq = function() {

			// local storage keys
			var faq = 'lrFaqList' + colAbbr;
			var timestamp = 'lrFaqTS' + colAbbr;
			// get json from local storage if not more than 2 hours old
			var local = $window.localStorage.getItem(faq);
			var ts = $window.localStorage.getItem(timestamp); // timestamp
			var old = false; // json assumed to be not old
			if (ts !== null) { // check age of timestamp
				var d = new Date();
				var ageLimit = 4 * 60 * 60 * 1000; // four hours
				if ((d - new Date(ts)) < ageLimit) { // get local storage object and insert it
					vm.faqList = angular.fromJson(local);
					vm.faqExist = true;
				} else { // set flag to true
					old = true;
				}
			} else { // no timestamp found; same as if it were old
				old = true;
			}
			if (old === true) { // only runs if timestamp is old
				$http.get(districtHost + filePath + 'utilities/primo-faq-getter/get-faq.php?college=' + colAbbr) // Springshare doesn't set CORS and using JSONP in AngularJS is too complicated, so we are proxying the JSON on our serve. We also cache it there for a few hours to limit API hits
					.then(function(response) {
						vm.faqList = response.data.faqs;
						// set local storage for next time
						$window.localStorage.setItem(faq, angular.toJson(vm.faqList));
						var d = new Date();
						$window.localStorage.setItem(timestamp, d.toString());
						vm.faqExist = true;
					});
			}
		};
	}]);
	// insert problem reporter
	// shared variables
	var problemReportVar = function() {
		var w = 600;
		var h = 600;
		var left = (screen.width - w) / 2;
        var top = (screen.height - h) / 4;
		return {
			'page': districtHost + filePath + 'utilities/problem-reporter/',
			'window': 'toolbar=no, location=no, menubar=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left,
			'icon': '<md-icon md-svg-icon="alert:ic_error_outline_24px"></md-icon>Report a problem</md-button>'
		};
	};
	// full record
	app.component('prmAlmaViewitAfter', {
		bindings: {
			parentCtrl: '<'
		},
		template: '<lr-problem-reporter parent-ctrl="$ctrl.parentCtrl"></lr-problem-reporter>'
	});
	app.component('lrProblemReporter', {
		bindings: {
			parentCtrl: '<'
		},
		controller: 'lrProblemReporterController',
		template: '<md-button id="lr-problem-reporter" layout-margin ng-if="$ctrl.showProblemReporter()" ng-click="$ctrl.openReporter()">' + problemReportVar().icon
	});
	app.controller('lrProblemReporterController', ['$window', function ($window) {
		var vm = this;
		var itemID = vm.parentCtrl.item.pnx.control.recordid[0] || '';
		var newsBank = '';
		var elecServices = vm.parentCtrl.item.delivery.electronicServices;
		if (elecServices) {
			for (var i = 0; i < elecServices.length; i++) {
				if (elecServices[i].packageName.indexOf('Newsbank') > -1) {
					newsBank = 'true';
					break;
				}
			}
		}
		vm.openReporter = function() {
			$window.open(problemReportVar().page + '?url=' + encodeURIComponent(location.href) + '&recordid=' + itemID + '&college=' + colAbbr + '&source=primo&newsbank=' + newsBank, 'Problem reporter', problemReportVar().window);
		};
		vm.showProblemReporter = function() { // wait until links load to show the reporter
			if (angular.element(document.querySelectorAll('prm-alma-viewit-items md-list-item')).length > 0) {
				return true;
			}
		};
	}]);
	// brief results
	app.component('prmSearchResultAvailabilityLineAfter', {
		bindings: {
			parentCtrl: '<'
		},
		controller: 'prmSearchResultAvailabilityLineAfterController',
		template: '<md-button class="lr-brief-problem-reporter" layout-margin ng-if="$ctrl.showReporter()" ng-click="$ctrl.openReporter()">' + problemReportVar().icon
		});
	app.controller('prmSearchResultAvailabilityLineAfterController', ['$window', function($window) {
		var vm = this;
		var itemID = vm.parentCtrl.result.pnx.control.recordid[0] || '';
		vm.openReporter = function() {
			$window.open(problemReportVar().page + '?url=' + encodeURIComponent(location.href) + '&recordid=' + itemID + '&college=' + colAbbr + '&source=primo', 'Problem reporter', problemReportVar().window);
		};
		vm.showReporter = function() {
            if ((vm.parentCtrl.isFullView !== true) && (vm.parentCtrl.isOverlayFullView !== true)) { // only show this here in brief results
            	var availability = vm.parentCtrl.result.delivery.availability;
                if (availability) {
					var regex = /(fulltext|not_restricted)/;
					for (var i = 0; i < availability.length; i++) { // sometimes physical and full-text are both present
						if (regex.test(availability[i]) === true) { // only show when there is a full-text link
					    return true;
						}
					}
				    
			    }
            }
			
		};
		
	}]);
	// fix pci link text
	app.component('prmAlmaViewitItemsAfter', {
		bindings: {
			parentCtrl: '<'
		},
		controller: ['$timeout', '$interval', function($timeout, $interval) {
			var currentLinkText = this.parentCtrl.services[0].packageName;
			var regex = new RegExp('View (video|record|full text|item|content) (in|at) ');
			if (regex.test(currentLinkText) === true) {
				var newLinkText = currentLinkText.replace(regex, '');
				newLinkText = newLinkText.replace(/\(subscribers only\)/i, '');
				//var linkText = document.querySelector('prm-alma-viewit-items a.item-title');
				var cancelProc = $timeout(function() {
					$interval.cancel(wait);
					angular.element(document.querySelector('prm-alma-viewit-items a.item-title')).html(newLinkText);
				}, 5000);
				var wait = $interval(function() {
					if (document.querySelector('prm-alma-viewit-items a.item-title')) {
						$interval.cancel(wait);
						$timeout.cancel(cancelProc);
						var title = document.querySelector('prm-alma-viewit-items a.item-title');
						angular.element(title).html(newLinkText);
						if (angular.element(title).html() === 'collection') {
							angular.element(title).html('Remote website');
						}
					}
				}, 20);				
			}
			
		}]
	});
	app.component('prmFacetExactAfter', {
		bindings: {
			parentCtrl: '<'
		},
		controller: ['$interval', '$timeout', '$window', function($interval, $timeout, $window) {
			// check for filters and remove as needed.
			var vm = this;
			if (vm.parentCtrl.facetGroup.name === 'tlevel') {
				var tab = vm.parentCtrl.configurationUtil.searchFieldsService._tab;
				if ((tab === 'everything') || (tab === 'books_videos_in_library')) {
					var checkLimiters = $interval(function() { // takes some time for them to appear so need to do an interval
						var stopCheck = $timeout(function() {
							$interval.cancel(checkLimiters);
						}, 10000);
						var physical = angular.element(document.querySelector('[data-facet-value="tlevel-available_p"]'));
						var online = angular.element(document.querySelector('[data-facet-value="tlevel-online_resources"]'));
						if ((physical.length > 0) || (online.length > 0)) {
							$interval.cancel(checkLimiters);
							$timeout.cancel(stopCheck);
							online.css('display', 'none');
							physical.css('display', 'none');
							// now hide whole group if no limiters are visible, to heading
							if ($window.innerWidth > 959) { // this doesn't work in mobile view because all filters are hidden by default
								var group = angular.element(document.querySelector('[data-facet-group="tlevel"]'));
								var els = angular.element(document.querySelectorAll('[data-facet-value^="tlevel"]'));
								var count = 0;
								for (var i = 0; i < els.length; i++) {
									if (els[i].offsetParent !== null) {
										count++;
									}
								}
								if (count === 0) {
									group.css('display', 'none');
								}
							}

						}
					}, 50);
				}

			}

		}]
	});
	app.component('prmBrowseSearchAfter', { // insert template into browse screens. would be nice to hide it when results appear
		bindings: {
			parentCtrl: '<'
		},
		controller: 'prmBrowseSearchAfterController',
		templateUrl: custPackagePath + '/html/browse.html'
	});
	app.controller('prmBrowseSearchAfterController', function() { 
		var vm = this;
		vm.showCards = function() { // avoid typeError by waiting for property to become available
			if (vm.parentCtrl.browseSearchBarService._selectedScope.SourceCode1) {
				return true;
			}
		};
		vm.showExplanation = function(box) { // show explanation card appropriate to browse index used
			var searchScope = vm.parentCtrl.browseSearchBarService._selectedScope.SourceCode1; // this property stores the browse index label
			if (searchScope.indexOf(box) > -1) {
				return true;
			}
		};
		vm.hideOnResults = function() { // hide cards when there are search results or when search is in progress
			var results = vm.parentCtrl.browseSearchService._browseResult; // array of search results
			var inProgress = vm.parentCtrl.browseSearchService._inProgress;
			if ((results.length > 0  || inProgress === true)) {
				return true;
			}
		};
		
	});
	app.component('prmBackToLibrarySearchButtonAfter', { // this allows dismissable announcement to show just under search bar area
		controller: 'prmBackToLibrarySearchButtonAfterController',
		templateUrl: custPackagePath + '/html/top-announcement.html' // enter content into / uncomment this template to show the announcement
	});
	app.controller('prmBackToLibrarySearchButtonAfterController', ['$cookies', '$timeout', function($cookies, $timeout) {
		var vm = this;
		var cookieKey = 'lrHideOSAnnce';
		vm.fade = ''; // used for adding classes when dissmissing
		vm.hide = false;
		vm.refPage = c19Page || ''; // this is the optionally per-college page that can be linked to in the announcement
		vm.hideCookie = $cookies.get(cookieKey) || '';
		vm.lrShowAnnounce = function(str) { // n should be in form m-d-yyyy
			if (vm.hide === true) { // this happens after dismiss button is pressed
				return false;
			}
			var announceExp = str || '';
			if (announceExp !== '') {
				var arr = announceExp.split('-');
				var m = parseInt(arr[0], 10) - 1; // allow us to put month in html as regular month
				var exp = new Date();
				exp.setFullYear(arr[2], m, arr[1]);
				var today = new Date();
				if ((today - exp) > 0) {
					return false;
				}
			}
			if ((vm.refPage !== '') && (vm.hideCookie !== 'true')) {
				return true;
			}
		};
		vm.lrHideAnnounce = function(num) {
			var d = new Date();
			var expDays = num || 14; // default cookie length is 14 days; if shorter or longer, include in function
			d.setTime(d.getTime() + (expDays * 24 * 60 * 60 * 1000)); // two weeks
			$cookies.put(cookieKey, 'true', {
				'expires': d.toUTCString(),
				'secure': true
			}); // set cookie to stop showing announcement
			vm.fade = 'lr-fadeout'; // allows animation via class
			$timeout(function() {
				vm.hide = true; // removes element so space stops showing
			}, 300);
			return true;
		};
	}]);
	// note on lack of requesting during COVID-19 closure
	app.component('prmOpacAfter', { 
		template: '<md-content layout-margin><p><md-icon md-svg-icon="action:ic_announcement_24px"></md-icon>Please note: during the temporary library closures in response to the COVID-19 pandemic, item requests are unavailable. We apologize for this inconvenience and encourage you to explore online library resources.</p></md-content>'
	});
	app.component('prmFinesAfter', { // show message explaining how to pay fines
		bindings: {
			parentCtrl: '<'
		},
		templateUrl: custPackagePath + '/html/fines.html',
		controller: function() { // only show if there are fines
			var vm = this;
			vm.c19Page = c19Page;
			vm.hasFines = function() {
				// if there are no fines, this value is the number 0; if there are fines, it is a string		
				if (typeof(vm.parentCtrl.finesCounters) === 'string') {
					return true;
				}
				else {
					return false;
				}
			};
		}
	});
	app.component('prmSearchResultThumbnailContainerAfter', { // grab thumbnail images from films on demand, naxos, maybe others
		bindings: {
			parentCtrl: '<'
		},
		controller: ['$timeout', '$interval', function($timeout, $interval) {
			var control = this.parentCtrl.item.pnx.control;
			var replaceImages = function(url, recordid) {
				var cancelProc = $timeout(function() {
					$interval.cancel(wait);
				}, 5000);
				var wait = $interval(function() {
					var images = document.querySelectorAll('#SEARCH_RESULT_RECORDID_' + recordid + ' prm-search-result-thumbnail-container img');
					if (images.length > 0) {
						$timeout.cancel(cancelProc);
						if (images.length > 1) { // exl has been bad and put duplicate ids on the page in full display...
							angular.element(images[1]).attr('src', url);
						} else { // brief results
							angular.element(images[0]).attr('src', url);
						}
						$interval.cancel(wait);
					}
				}, 100);
			};
			var sourceidArr = control.sourceid || [''];
			var sourceid = sourceidArr[0];
			var recordidArr = control.recordid || [''];
			var recordid = recordidArr[0];
			var sourcerecordidArr = control.sourcerecordid || [''];
			var sourcerecordid = sourcerecordidArr[0];
			var url;
			if (recordid.indexOf('infobase_filmsondemand') > -1) { // use this instead of sourceid since there are multiple FoD collections
				url = 'https://fod.infobase.com/image/' + sourcerecordid;
				replaceImages(url, recordid);
			}
			else if (sourceid === 'CZN') {
				url = 'https://cdn.naxosmusiclibrary.com/sharedfiles/images/cds/others/' +  sourcerecordid + '.gif';
				replaceImages(url, recordid);			
			}

		}]

	});
	// set cookie for things like films on demand workaround
	setTimeout(function() {
		var el = document.createElement('iframe');
		el.style.position = 'absolute';
		el.style.left = '-99999px';
		el.setAttribute('src', districtHost + filePath + 'utilities/cookie-setter.php?college=' + colAbbr);
		// append the iframe in order to set the cookie, then remove it from the DOM
		document.getElementsByTagName('body')[0].appendChild(el);
		setTimeout(function(){
			el.parentNode.removeChild(el);	
		}, 2000);
		
		
	}, 10000);
	
	(function () {
			// Footer (from NLNZ) - measure page once "is sticky" is put in and (try) to put footer after results. Posted on Primo listserv by Bond University, November 2019

			// Instantiate variables that will be reset repeatedly in the listener function
			var max = 0;
			var winHeight = 0;
			var scrollTop = 0;
			var foot = 0;
			// and let's have a small buffer before the footer
			var buffer = 50;
			window.addEventListener('scroll', function () {

				// Total length of document
				max = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight,
					document.body.offsetHeight, document.documentElement.offsetHeight,
					document.body.clientHeight, document.documentElement.clientHeight);
				// Height of window
				winHeight = window.innerHeight || (document.documentElement || document.body).clientHeight;
				// Point of the top of the document visible on screen
				scrollTop = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop;
				var footer = document.getElementById('footer');
				if (footer) {
					// Height of footer
					foot = Math.round(parseFloat(window.getComputedStyle(document.getElementById('footer')).height));
					// check where we are in terms of scrolling and the footer
					var stuckWin = document.querySelectorAll('.primo-scrollbar.is-stuck')[0];
					// check for undefined to avoid TypeErrors
					if (stuckWin) {
						if (scrollTop + winHeight >= max - foot) {
							stuckWin.style.maxHeight = 'calc(100% - ' + Math.abs(max - winHeight - scrollTop - foot - buffer) + 'px)';
						} else {
							stuckWin.style.maxHeight = 'calc(100% - 2em)';
						}
					}
				}
			});

		}());
	(function () { // load libchat
		var div = document.createElement('div');
		div.id = 'libchat_' + libchatHash;
		document.getElementsByTagName('body')[0].appendChild(div);
		var scr = document.createElement('script');
		scr.src = 'https://v2.libanswers.com/load_chat.php?hash=' + libchatHash;
		setTimeout(function () {
			document.getElementsByTagName('body')[0].appendChild(scr);
		}, 2000);
	}());
}());