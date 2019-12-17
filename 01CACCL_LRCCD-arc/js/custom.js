(function () {

	'use strict';
	var colAbbr = 'arc'; // set separately for each college
	var viewCode = function (str) { // allow all views to refer to templates in their own view
		var separator = ':';
		// EXL uses a colon in their URL but as it is loading it may show as HTML entity, we can't predict
		if (str.indexOf('%3A') > -1) {
			separator = '%3A';
		}
		var environment = 'LRCCD'; 
		if (str.indexOf('01CACCL_CC') > -1) { // this allows us to use the sandbox
			environment = 'CC';
		}
		var arr=str.split('01CACCL_'+ environment + separator);
		var arr2=arr[1].split('&');

		return {
			env: environment,
			view: arr2[0]
		};

	}(location.href);
	var libraries = [
		{
			name: 'American River',
			abbr: 'arc',
			path: 'student-resources/library',
			phone: '(916) 484-8455',
			center: 'Natomas Center',
			centerurl: 'https://libguides.arc.losrios.edu/c.php?g=366843&amp;p=6570176'
		},

		{
			name: 'Cosumnes River',
			abbr: 'crc',
			path: 'student-resources/library',
			phone: '(916) 691-7266',
			center: 'Elk Grove Center',
			cpath: 'about/elk-grove-center-library-services'
			},

		{
			name: 'Folsom Lake',
			abbr: 'flc',
			path: 'student-resources/library',
			phone: '(916) 608-6613',
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
			phone: '(916) 558-2301',
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
	var currentLib = (function () { // returns object of library currently in view. All view codes must include lower-case library acronym
		for (var i = 0; i < libraries.length; i++) {
			if (viewCode.view.indexOf(libraries[i].abbr) > -1) {
				return libraries[i];
			}
		}
	}());
	var custPackagePath = '/discovery/custom/01CACCL_' + viewCode.env + '-' + viewCode.view;
	var app = angular.module('viewCustom', ['angularLoad']);
	// logo
	app.component('prmSearchBarAfter', {
		bindings: {parentCtrl: '<'},
		controller: 'prmSearchBarAfterController',
		template: '<div id="lr-onesearch" hide="" show-gt-sm=""><md-button aria-label="OneSearch" ng-click="$ctrl.navigateToHomePage()"><img ng-src="' + custPackagePath + '/img/onesearch-logo.png" alt="OneSearch - Los Rios Libraries"> </md-button></div>'
		
		});
	app.controller('prmSearchBarAfterController', ['$window', function($window) {
		this.navigateToHomePage = function() {
			$window.location.href = '/discovery/search?vid=01CACCL_' + viewCode.env + ':' + viewCode.view;
			return true;
		};
		
	}]);
	app.controller('exploreFooterAfterController', [ function() {
		var vm = this;
		vm.browseURL = '/discovery/browse?vid=01CACCL_' + viewCode.env + ':' + viewCode.view + '#banner'; // need to include element ID, otherwise page does not scroll up
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
	// insert chat widget
	app.component('prmExploreMainAfter', {
		bindings: {
			parentCtrl: '<'
		},
		template: '<lr-libchat parent-ctrl="$ctrl.parentCtrl"></lr-libchat>'
	});
	app.component('lrLibchat', {
		bindings: {
			parentCtrl: '<'
		},
		controller: 'lrLibchatController',
		template: '<div id="libchat_{{$ctrl.libchatHash}}" ng-if="$ctrl.libchatHash"></div>'
	});
	app.controller('lrLibchatController', ['angularLoad', function (angularLoad) {
		/*
		// uncomment when you have the needed hash value
		var vm = this;
		vm.libchatHash = ''; // put hash value here
		vm.$onInit = setTimeout(function () {
			angularLoad.loadScript('https://v2.libanswers.com/load_chat.php?hash=' + vm.libchatHash).then(function () {

			});
		}, 2000);
		*/

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