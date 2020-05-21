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
		vm.askUs = 'https://www.library.losrios.edu/ask-us/?' + colAbbr;
		}]);

	app.component('prmExploreFooterAfter', { // insert template into footer area
		bindings: {
			parentCtrl: '<'
		},
		controller: 'exploreFooterAfterController',
		templateUrl: custPackagePath + '/html/footer.html'
	});
	// insert problem reporter
	// shared variables
	var problemReportVar = function() {
		var w = 600;
		var h = 600;
		var left = (screen.width - w) / 2;
        var top = (screen.height - h) / 4;
		return {
			'page': 'https://www.library.losrios.edu/' + filePath + 'utilities/problem-reporter/',
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
				    if ((availability[0] === 'fulltext') || (availability[0] === 'not_restricted')) { // only show when there is a full-text link
					    return true;
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
			var regex = new RegExp('View (video|record|full text|item) (in|at) ');
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
						angular.element(document.querySelector('prm-alma-viewit-items a.item-title')).html(newLinkText);
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
		bindings: {
			parentCtrl: '<'
		},
		controller: 'prmBackToLibrarySearchButtonAfterController',
		templateUrl: custPackagePath + '/html/top-announcement.html'
	});
	app.controller('prmBackToLibrarySearchButtonAfterController', ['$cookies', '$timeout', function ($cookies, $timeout) {
		var vm = this;
		var cookieKey = 'lrHideOSAnnce';
		vm.refPage = c19Page || ''; // this is the optionally per-college page that can be linked to in the announcement
		vm.hideCookie = $cookies.get(cookieKey) || '';
		vm.lrShowAnnounce = function() {
			if ((vm.refPage !=='') && (vm.hideCookie !== 'true')) {
				return true;
			}
		};
		vm.lrHideAnnounce = function() {
			var d = new Date();
			d.setTime(d.getTime() + (14*24*60*60*1000)); // two weeks
			$cookies.put(cookieKey, 'true',{'expires': d.toUTCString()}); // set cookie to stop showing announcement
			var el = angular.element(document.getElementById('top-announce'));
			el.addClass('lr-fadeout'); // allows transition in css
			$timeout(function() {
				el.css('display', 'none');
			}, 300);
			return true;
		};
	}]);
	// note on lack of requesting during COVID-19 closure
	app.component('prmOpacAfter', { 
		bindings: {
			parentCtrl: '<'
		},
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
					}
				}, 100);
			};
			var sourceidArr = control.sourceid || [''];
			var sourceid = sourceidArr[0];
			var url;
			if (sourceid === 'infobase_s') { // this appears to be just films on demand
				url = 'https://fod.infobase.com/image/' + control.sourcerecordid[0];
				replaceImages(url, control.recordid[0]);
			}
			else if (sourceid === 'naxos_s') {
				url = 'https://cdn.naxosmusiclibrary.com/sharedfiles/images/cds/others/' +  control.sourcerecordid[0] + '.gif';
				replaceImages(url, control.recordid[0]);			
			}

		}]

	});

	// set cookie for things like films on demand workaround
	setTimeout(function() {
		var el = document.createElement('iframe');
		el.style.position = 'absolute';
		el.style.left = '-99999px';
		el.setAttribute('src', 'https://www.library.losrios.edu/alma/utilities/cookie-setter.php?college=' + colAbbr);
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