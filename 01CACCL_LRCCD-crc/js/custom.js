(function () {
	'use strict';
	/* college-specific variables */
	var colAbbr = 'crc';
	var libchatHash = 'a24b10a3580f241dc2aaf29a0b97ab2f';
	var c19Page = 'https://researchguides.crc.losrios.edu/library_closure';
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
	var districtHost = 'https://library.losrios.edu/';
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
	// full record
	app.component('prmAlmaViewitAfter', {
		bindings: {
			parentCtrl: '<'
		},
		template: '<lr-viewit-notes parent-ctrl="$ctrl.parentCtrl"></lr-viewit-notes><lr-problem-reporter flex layout-align="end center" parent-ctrl="$ctrl.parentCtrl"></lr-problem-reporter>'
	});
	// notes to attach to view it when necessary, e.g. problematic cdi behavior
	app.component('lrViewitNotes', {
		bindings: {
			parentCtrl: '<'
		},
		templateUrl: custPackagePath + '/html/full-display/viewit-notes.html',
		controller: function() {
			var vm = this;
			vm.showNote = function(source) {
				var services = vm.parentCtrl.item.delivery.electronicServices;
				if (services) {
					var linkUrl = services[0].serviceUrl;
					var journal = vm.parentCtrl.item.pnx.addata.jtitle;
					if (linkUrl) {
						if (linkUrl.indexOf('search.proquest.com/docview') > -1) { // pq link in record
							// check resource
							if (/Los Angeles Times|Chicago Tribune|New York Times|Wall Street Journal|Washington Post/i.test(journal[0]) === true) {
								if (journal[0].indexOf('(Online)') === -1) { // seems not to be a problem with web content
									if (source === 'USMajorDailies') {
										return true;
									}
								}
							}
						}
					}
				}
			};
		} 
	});
	app.component('lrProblemReporter', {
		bindings: {
			parentCtrl: '<'
		},
		controller: 'lrProblemReporterController',
		template: '<md-button ng-if="$ctrl.showProblemReporter()" ng-click="$ctrl.openReporter()"><md-icon md-svg-icon="alert:ic_error_outline_24px" aria-label="Alert"></md-icon> Report a problem</md-button>'
	});
	app.controller('lrProblemReporterController', ['$window', function ($window) {
		var vm = this;
		var itemID = '';
		var elecServices;
		if (vm.parentCtrl.item) { // found in prmAlmaViewitAfter
			itemID = vm.parentCtrl.item.pnx.control.recordid[0];
			elecServices = vm.parentCtrl.item.delivery.electronicServices;
		}
		if (vm.parentCtrl.result) { // found in prmSearchResultAvailabilityLineAfter
			itemID = vm.parentCtrl.result.pnx.control.recordid[0];
		}
		vm.openReporter = function() {
			var w = 600;
			var h = 600;
			var left = (screen.width - w) / 2;
			var top = (screen.height - h) / 4;
			var page = districtHost + filePath + 'utilities/problem-reporter/';
			var winParams = 'toolbar=no, location=no, menubar=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left;
			$window.open(page + '?url=' + encodeURIComponent(location.href) + '&recordid=' + itemID + '&college=' + colAbbr + '&source=primo', 'Problem reporter', winParams);
		};
		vm.showProblemReporter = function() { // wait until links load to show the reporter
			if (vm.parentCtrl.item) { // full display
				if (vm.parentCtrl.item.delivery.electronicServices) {
					if (vm.parentCtrl.item.delivery.electronicServices.length > 0) { // wait for full-text links to appear
						return true;
					}
				}
			}
			else if (vm.parentCtrl.result) { // brief results
				if ((vm.parentCtrl.isFullView !== true) && (vm.parentCtrl.isOverlayFullView !== true)) { // only show this here in brief results
					if (document.querySelector('prm-email-template') === null) { // ensure this does not show in emails generated from Primo VE
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
				}
			}
			else {
				return true;
			}
		};
	}]);
	// brief results
	app.component('prmSearchResultAvailabilityLineAfter', {
		bindings: {
			parentCtrl: '<'
		},
		template: '<lr-problem-reporter parent-ctrl="$ctrl.parentCtrl" layout-align="end center"></lr-problem-reporter>'
		});
	// record cannot be displayed page
	app.component('prmSignInToViewAfter', {
		bindings: {
			parentCtrl: '<'
		},
		template: '<md-card class="default-card" style="margin-top:-9px;"><md-card-content><md-card-actions layout-align="end-center" layout="row"><lr-problem-reporter parent-ctrl="$ctrl.parentCtrl"></lr-problem-reporter></md-card-actions></md-card-content></md-card>'
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
	app.component('prmBackToLibrarySearchButtonAfter', { 
		template: '<lr-top-announcement></lr-top-announcement>',
	});
	app.component('lrTopAnnouncement', { // this allows dismissable announcement to show just under search bar area
		controller: 'lrTopAnnouncementController',
		templateUrl: custPackagePath + '/html/top-announcement.html' // enter content into / uncomment this template to show the announcement
	});
	app.controller('lrTopAnnouncementController', ['$cookies', '$timeout', function($cookies, $timeout) {
		var vm = this;
		vm.fade = ''; // used for adding classes when dissmissing
		vm.hide = false;
		vm.refPage = c19Page || ''; // this is the optionally per-college page that can be linked to in the announcement
		vm.cookieID = 'lrHideOSAnnce' + '_' + colAbbr; // default cookieID, if not set in ng-if object
		vm.daysToHide = 14; // default days that banner is hidden if user dismisses
		var getDate = function(str) {
			var arr = str.split('-');
			var m = parseInt(arr[0], 10) - 1; // allow us to put month in html as regular month
			var exp = new Date();
			exp.setFullYear(arr[2], m, arr[1]);
			return exp;
		};
		vm.showAnnounce = function(obj) {
			if (vm.hide === true) { // this happens after dismiss button is pressed
				return false;
			}
			var announceStart = obj.startDate || '';
			var announceExp = obj.endDate || '';
			if (obj.daysToHide) {
				vm.daysToHide = obj.daysToHide;
			}
			var today = new Date();
			if (announceExp !== '') {
				var exp = getDate(announceExp);
				if ((today - exp) > 0) {
					return false;
				}
			}
			if (announceStart !== '') {
				var start = getDate(announceStart);
				if ((today - start) < 0){
					return false;
				}
			}
			if (obj.cookieID) {
				vm.cookieID = obj.cookieID + '_' + colAbbr;
			}
			var hideCookie = $cookies.get(vm.cookieID) || '';
			if (hideCookie !== 'true') {
				return true;
			}
		};
		vm.hideAnnounce = function() {
			var cookieKey = vm.cookieID;
			var d = new Date();
			d.setTime(d.getTime() + (vm.daysToHide * 24 * 60 * 60 * 1000)); // two weeks
			vm.fade = 'lr-fadeout'; // allows animation via class
			$timeout(function() {
				$cookies.put(cookieKey, 'true', {
					'expires': d.toUTCString(),
					'path' : '/',
					'secure': true
				}); // set cookie to stop showing announcement
				vm.hide = true; // removes element so space stops showing
			}, 300);
			return true;
		};
	}]);
	// collection discovery
	app.component('prmCollectionSearchAfter', {
		bindings: {
			parentCtrl: '<'
		},
		template: '<lr-collection-blurb parent-ctrl="$ctrl.parentCtrl"></lr-collection-blurb>'
	});
	app.component('lrCollectionBlurb', {
		bindings: {
			parentCtrl: '<'
		},
		templateUrl: custPackagePath + '/html/collections/blurb.html',
		controller: function() {
			var vm = this;
			var collectionID = vm.parentCtrl.$stateParams.collectionId;
			vm.showBlurb = function(colID) {
				if (colID === collectionID) {
					return true;
				}
			};
		}
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
	app.component('prmSearchResultThumbnailContainerAfter', {
		bindings: {
			parentCtrl: '<'
		},
		template: '<lr-bumpup-thumbnail-size parent-ctrl="$ctrl.parentCtrl"></lr-bumpup-thumbnail-size>'
	});
	app.component('lrBumpupThumbnailSize', {
		bindings: {
			parentCtrl: '<',
		},
	// function below will run for each thumbnail
		controller: ['$interval', '$timeout', function($interval, $timeout) {
			var vm = this;
			var pattern = /syndetics\.com\/|(cdnsecakmi|cfvod)\.kaltura\.com|books\.google\.com/;
			var biggerURL = function(str) {
				var replacement = '';
				if (str.indexOf('/sc.jpg') > -1) { // syndetics
					replacement = str.replace('/sc.jpg', '/mc.jpg');
				} else if (str.indexOf('/width/88') > -1) { // fod
					replacement = str.replace('/width/88', '/width/160');
				}
				else if (str.indexOf('books.google.com') > -1){
					replacement = str;
				}
				return replacement;
			};
			// only run this in collection discovery
			if (vm.parentCtrl.$state.current.name.indexOf('collectionDiscovery') > -1) {
				var checkImg = $interval(function() { // set up interval to get this done asap. Runs every 50 milliseconds until canceled
					var img = vm.parentCtrl.selectedThumbnailLink; // this is the thumbnail link
					if (img) { // this takes a while to load, wait for it
						// it has loaded, so cancel the interval
						$interval.cancel(checkImg);
						if (pattern.test(img.linkURL) === true) { // only replace the URL if it is syndetics or fod, otherwise cancel the interval
							var newURL = biggerURL(img.linkURL);
							if (newURL !== '') { // failed replacement will return empty string, in which case we exit and cancel the interval
								var images = document.querySelectorAll('.fan-img-1, .fan-img-2, .fan-img-3');
								for (var i = 0; i < images.length; i++) {
									if (images[i].getAttribute('ng-src') === img.linkURL) {
										images[i].setAttribute('src', newURL);
										images[i].style.width = 'auto';
										images[i].removeAttribute('ng-src'); // probably not necessary
										if (newURL.indexOf('books.google.com') > -1) {
											images[i].style.height = '160px';
										}
									}
								}
							} else {
								$interval.cancel(checkImg);
							}
						} else {
							$interval.cancel(checkImg);
						}
					}
				}, 50);
				$timeout(function() { // not a great idea to leave it running constantly so end any remaining intervals--e.g. for non-syndetics images--after 5 seconds
					$interval.cancel(checkImg);
				}, 5000);
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