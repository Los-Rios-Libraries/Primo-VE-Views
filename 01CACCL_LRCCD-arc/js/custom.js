(function () {

	'use strict';
	var viewCode = function (str) { // allow all views to refer to templates in their own view
		var separator = ':';
		// EXL uses a colon in their URL but as it is loading it may show as HTML entity, we can't predict
		if (str.indexOf('%3A') > -1) {
			separator = '%3A';
		}
		var arr = str.split('01CACCL_LRCCD' + separator);
		var arr2 = arr[1].split('&');
		return arr2[0];

	}(location.href);
	var libraries = [
			{name: 'American River',
			abbr: 'arc',
			path: 'student-resources/library',
			phone: '(916) 484-8455' },
			{name: 'Cosumnes River',
			abbr: 'crc',
			path: 'student-resources/library',
			phone: '(916) 691-7266' },
			{name: 'Folsom Lake',
			abbr: 'flc',
			path: 'student-resources/library',
			phone: '(916) 608-6613'},
			{name: 'Sacramento City',
			abbr: 'scc',
			path: 'library',
			phone: '(916) 558-2301' }
		];
	var currentLib = (function () { // returns object of library currently in view. All view codes must include lower-case library acronym
		for (var i = 0; i < libraries.length; i++) {
			if (viewCode.indexOf(libraries[i].abbr) > -1) {
				return libraries[i];
			}
		}
	}());
	var custPackagePath = '/discovery/custom/01CACCL_LRCCD-' + viewCode;
	var app = angular.module('viewCustom', ['angularLoad']);
	// logo
	app.component('prmSearchBarAfter', {
		bindings: {parentCtrl: '<'},
		controller: 'prmSearchBarAfterController',
		template: '<div id="lr-onesearch" hide="" show-gt-sm=""><md-button aria-label="OneSearch" ng-click="$ctrl.navigateToHomePage()"><img ng-src="' + custPackagePath + '/img/onesearch-logo.png" alt="OneSearch - Los Rios Libraries"> </md-button></div>'
		
		});
	app.controller('prmSearchBarAfterController', ['$window', function($window) {
		this.navigateToHomePage = function() {
			$window.location.href = '/discovery/search?vid=01CACCL_LRCCD:' + viewCode;
			return true;
		};
		
	}]);
	app.controller('exploreFooterAfterController', [ function() {
		var vm = this;
		vm.browseURL = '/discovery/browse?vid=01CACCL_LRCCD:' + viewCode + '#banner'; // need to include element ID, otherwise page does not scroll up
		vm.LRLogoSrc = custPackagePath + '/img/Los Rios Libraries_Logo_Horizontal_BW.png';
		vm.libraries = libraries;
		}]);

	app.component('prmExploreFooterAfter', { // insert template into footer area
		bindings: {
			parentCtrl: '<'
		},
		controller: 'exploreFooterAfterController',
		templateUrl: custPackagePath + '/html/footer.html'
	});
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

			});

		}());
}());