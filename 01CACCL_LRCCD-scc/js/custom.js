(function () {

	'use strict';
	var getViewCode = function () { // allow all views to refer to templates in their own view
		var separator = ':';
		// EXL uses a colon in their URL but as it is loading it may show as HTML entity, we can't predict
		if (location.href.indexOf('%3A') > -1) {
			separator = '%3A';
		}
		var arr = location.href.split('01CACCL_LRCCD' + separator);
		var arr2 = arr[1].split('&');
		return arr2[0];

	};
	// we should eventually be putting this in templates rather than hard-coding, once we understand how to do that
	var custPackagePath = '/discovery/custom/01CACCL_LRCCD-' + getViewCode();

	var app = angular.module('viewCustom', ['angularLoad']);

	app.component("prmExploreFooterAfter", { // insert template into footer area

		bindings: {
			parentCtrl: '<'
		},

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