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
					cpath: 'daviscenter/student-services/'
				},
				{
					center: 'West Sacramento Center',
					cpath: 'westsaccenter/library-services/'
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
		}]);

	app.component('prmExploreFooterAfter', { // insert template into footer area
		bindings: {
			parentCtrl: '<'
		},
		controller: 'exploreFooterAfterController',
		templateUrl: custPackagePath + '/html/footer.html'
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
	app.controller('prmBackToLibrarySearchButtonAfterController', ['$cookies', function ($cookies) {
		var vm = this;
		var cookieKey = 'lrHideOSAnnce';
		vm.hide = false; // will be set to true if user clicks close button
		vm.refPage = c19Page || ''; // this is the optionally per-college page that can be linked to in the announcement
		vm.hideCookie = $cookies.get(cookieKey) || '';
		vm.lrShowAnnounce = function() {
			if ((vm.refPage !=='') && (vm.hideCookie !== 'true')) {
				return true;
			}
		};
		vm.lrHideAnnounce = function() {
			vm.hide = true; // dismiss announcement
			var d = new Date();
			d.setTime(d.getTime() + (14*24*60*60*1000)); // two weeks
			$cookies.put(cookieKey, 'true',{'expires': d.toUTCString()}); // set cookie to stop showing announcement
			return true;
		};
	}]);
	// note on lack of requesting during COVID-19 closure
	app.component('prmOpacAfter', { 
		bindings: {
			parentCtrl: '<'
		},
		template: '<md-content layout-margin></p><md-icon md-svg-icon="action:ic_announcement_24px"></md-icon>Please note: during the temporary library closures in response to the COVID-19 pandemic, item requests are unavailable. We apologize for this inconvenience and encourage you to explore online library resources.</p></md-content>'
	});
	// insert problem reporter
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
		template: '<md-button id="lr-problem-reporter" layout-margin ng-if="$ctrl.showProblemReporter()" ng-click="$ctrl.openReporter()"><md-icon md-svg-icon="alert:ic_error_outline_24px"></md-icon>Report a problem</md-button>'
	});
	app.controller('lrProblemReporterController', ['$window', function ($window) {
		var vm = this;
		var w = 600;
		var h = 600;
		var left = (screen.width - w) / 2;
        var top = (screen.height - h) / 4;
		var itemID = vm.parentCtrl.item.pnx.control.recordid[0] || '';
		vm.openReporter = function() {
			$window.open('https://www.library.losrios.edu/' + filePath + 'utilities/problem-reporter/?url=' + encodeURIComponent(location.href) + '&recordid=' + itemID + '&college=' + colAbbr + '&source=primo', 'Problem reporter', 'toolbar=no, location=no, menubar=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
		};
		vm.showProblemReporter = function() { // wait until links load to show the reporter
			if (angular.element(document.querySelectorAll('prm-alma-viewit-items md-list-item')).length > 0) {
				return true;
			}
		};
	}]);
	/* should only show this if there are fines. If there are no fines, parent controller has property finesCounters: 0. create controller to check for this */
	app.component('prmFinesAfter', {
		bindings: {
			parentCtrl: '<'
		},
		templateUrl: custPackagePath + '/html/fines.html'
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