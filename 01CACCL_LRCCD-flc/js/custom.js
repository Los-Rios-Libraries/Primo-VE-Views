(function () {
	'use strict';
	/* college-specific variables */
	const colAbbr = 'flc';
	const libchatHash = '30c067282fb40fb55e758c16d27c656d';
	const almaDHelp = 'https://answers.library.losrios.edu/flc/search/?t=0&adv=1&topics=Digital%20Books';
	const subjFaqTitle = 'Where do the subject headings in OneSearch come from?';
	const subjFaqID = '414406';
	const limitedDelivery = '407119';
	const libKeyId = '3236';
	const lkAPI = 'bb1e3a4b-f384-4323-8ae8-a95c56f8e091';
	const lkEmail = 'BrinklA@flc.losrios.edu';
	/* end college-specific variables */
	const viewCode = function (str) { // allow all views to refer to templates in their own view
		// EXL uses a colon in their URL but as it is loading it may show as HTML entity, we can't predict
		if (str.indexOf('%3A') > -1) {
			str = str.replace(/%3A/g, ':');
		}
		let environment = 'LRCCD'; 
		if (str.indexOf('01CACCL_CC') > -1) { // this allows us to use the sandbox
			environment = 'CC';
		}
		const arr=str.split('01CACCL_'+ environment + ':');
		const arr2=arr[1].split('&');
		const arr3 = arr2[0].split('/'); // needed for Alma viewer
		console.log('view:', arr3[0]);
		return {
			env: environment,
			view: arr3[0]
		};
	}(location.href);
	// use bitbucket directory for external files when in sandbox
	const districtHost = 'https://library.losrios.edu/';
	let filePath = ''; 
	if (viewCode.env === 'CC') {
		filePath = `${colAbbr}/bitbucket/lsp-related-tools-and-resources/`;
	}
	const libraries = [
		{
			name: 'American River',
			abbr: 'arc',
			path: 'student-resources/library',
			phone: '484-8455'
		},

		{
			name: 'Cosumnes River',
			abbr: 'crc',
			path: 'student-resources/library',
			phone: '691-7266'
		},

		{
			name: 'Folsom Lake',
			abbr: 'flc',
			path: 'student-resources/library',
			phone: '608-6613'
		},

		{
			name: 'Sacramento City',
			abbr: 'scc',
			path: 'library',
			phone: '558-2301'
			}
		];
	const custPackagePath = `/discovery/custom/01CACCL_${viewCode.env}-${viewCode.view}`;
	const app = angular.module('viewCustom', ['angularLoad']);
	
	const getDate = (str) => {
		const arr = str.split('-');
		const m = parseInt(arr[1], 10) - 1; // allow us to put month in html as regular month
		const output = new Date();
		output.setFullYear(arr[0], m, arr[2]);
		return output;
	};
	// function gets parents of given element - https://stackoverflow.com/posts/27037567/revisions
	const getParents = (el, selector) => {
		const parents = [];
		while ((el = el.parentNode) && el !== document) {
			if (!selector || el.matches(selector)) parents.push(el);
		}
		return parents;
	};
	// external link template
	app.component('lrExtLinkIcon', {
		template: '<span external-link=""><md-icon md-svg-icon="primo-ui:open-in-new" aria-label="Open in new tab"></md-icon></span>'
	});
	// logo
	app.component('prmSearchBarAfter', {
		bindings: {parentCtrl: '<'},
		controller: 'prmSearchBarAfterController',
		template: 
		`<div id="lr-onesearch" hide="" show-gt-sm="">
			<md-button aria-label="OneSearch" ng-href="{{::$ctrl.homePage}}" ng-click="$ctrl.scrollUp()">
				<img src="${custPackagePath}/img/onesearch-logo.png" alt="OneSearch - Los Rios Libraries"> 
			</md-button>
		</div>`
		
		});
	app.controller('prmSearchBarAfterController', ['$window', function($window) {
		const vm = this;
		vm.$onInit = () => {
			vm.homePage = `/discovery/search?vid=${vm.parentCtrl.vid}`;
			vm.scrollUp = () => { // force page to scroll up
				$window.scrollTo(0, 0);
				return true;
			};
		};
	}]);
	app.controller('exploreFooterAfterController', ['$window', function($window) {
		const vm = this;
		vm.$onInit = () => {
			vm.browseURL = `/discovery/browse?vid=01CACCL_${viewCode.env}:${viewCode.view}`;
			vm.scrollUp = () => { // force page to scroll up when clicking browse link in footer
				$window.scrollTo(0, 0);
				return true;
			};
			vm.isAlmaD = location.href.indexOf('/discovery/delivery');
			vm.setMargin = () => { // top margin is set high in style attribute since it takes time for page to load and we want to avoid footer high up on page. Result of this function will replace it. Normally will be set to 0. In some cases will be a bit higher.
				let margin = 0;
				const content = angular.element(
					document.getElementsByTagName('md-content')
				);
				let h = 0;
				if (content.length) {
					angular.forEach(content, function (val) {
						h += val.offsetHeight;
						if (h < 400) {
							margin = 400 - h;
						} else {
							margin = 0;
						}
					});
				} else {
					margin = 800;
				}
				return { 'margin-top': margin + 'px' };
			};
			vm.LRLogoSrc = `${custPackagePath}/img/Los Rios Libraries_Logo_Horizontal_BW.png`;
			vm.libraries = libraries;
			vm.askUs = `${districtHost}ask-us/?${colAbbr}`;
		};		
	}]);

	app.component('prmExploreFooterAfter', { // insert template into footer area
		controller: 'exploreFooterAfterController',
		templateUrl: custPackagePath + '/html/footer.html'
	});
	// faq on home page. To implement, add matching directive to html in home page
	app.component('lrHomepageFaq', {
		controller: 'lrHomepageFaqController',
		template: 
		`<div id="lr-faq-block">
			<md-list ng-if="$ctrl.faqExist" id="lr-faq-list">
				<md-list-item ng-repeat="f in ::$ctrl.faqList" layout-padding>
					<a href="{{::f.url.public}}" target="_blank">
						{{::f.question}} 
						<lr-ext-link-icon></lr-ext-link-icon>
					</a>
				</md-list-item>
			</md-list>
			<p layout="row" layout-align="end start">
				<md-button external-link="" ng-href="https://answers.library.losrios.edu/{{::$ctrl.col}}" target="_blank">More Library Answers 
					<lr-ext-link-icon></lr-ext-link-icon>
				</md-button>
			</p>
		</div>`
	});
	app.controller('lrHomepageFaqController', ['$http', '$window', function($http, $window) {
		const vm = this;
		vm.$onInit = () => {
			vm.col = colAbbr;
			vm.faqList = '';
			vm.faqExist = false;
			// local storage keys
			const faq = 'lrFaqList' + colAbbr;
			const timestamp = 'lrFaqTS' + colAbbr;
			// get json from local storage if not more than 4 hours old
				const local = $window.localStorage.getItem(faq);
				const ts = $window.localStorage.getItem(timestamp); // timestamp
				let old = false; // json assumed to be not old
				if (ts !== null) { // check age of timestamp
					const d = new Date();
					const ageLimit = 4 * 60 * 60 * 1000; // four hours
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
					$http.get(`${districtHost + filePath}utilities/primo-faq-getter/get-faq.php?college=${colAbbr}`) // Springshare doesn't set CORS and using JSONP in AngularJS is too complicated, so we are proxying the JSON on our serve. We also cache it there for a few hours to limit API hits
						.then((response) => {
							vm.faqList = response.data.faqs;
							// set local storage for next time
							$window.localStorage.setItem(faq, angular.toJson(vm.faqList));
							const d = new Date();
							$window.localStorage.setItem(timestamp, d.toString());
							vm.faqExist = true;
					});
				}
			
		};
	}]);
	// featured collections widget for home page
	app.component('lrFeaturedCollections', { // see template for list of collections
		templateUrl: custPackagePath + '/html/homepage/featured-collections.html',
	});
	// links to info about digital objects / alma-d
	app.component('prmAlmaViewitItemsAfter', {
		bindings: { parentCtrl: '<'},
		template: '<lr-alma-d-notes parent-ctrl="$ctrl.parentCtrl"></lr-alma-d-notes>'
	});
	app.component('lrAlmaDNotes', {
		bindings: {	parentCtrl: '<' },
		template: 
		`<div ng-if="$ctrl.showInfo();">
			<a href="{{::$ctrl.url}}" target="_blank">
				<md-icon md-svg-icon="action:ic_info_outline_24px" aria-label="Info"></md-icon> 
				Find out more about digital textbooks 
						<span external-link="">
					<lr-ext-link-icon></lr-ext-link-icon>
				</span>
			</a>
		</div>`,
		controller: function () {
			const vm = this;
			vm.$onInit =  () => {
				if (almaDHelp !== '') {
					vm.url = almaDHelp;
					vm.showInfo = () => {
						const serviceType = vm.parentCtrl.serviceType;
						if (serviceType === 'DIGITAL') {
							return true;
						}
					};
				}
			};
		}
	});
	// problem reporter. this template is inserted into a few different directives
	app.component('lrProblemReporter', {
		bindings: {
			parentCtrl: '<'
		},
		controller: 'lrProblemReporterController',
		template: 
		`<md-button ng-if="$ctrl.showProblemReporter()" ng-click="$ctrl.openReporter()">
			<md-icon md-svg-icon="alert:ic_error_outline_24px" aria-label="Alert"></md-icon> Report a problem
		</md-button>`
	});
	app.controller('lrProblemReporterController', ['$window', '$attrs', function ($window, $attrs) {
		const vm = this;
		vm.$onInit = () => {
			let queue = 'erm';
			let itemID = '';
			if (vm.parentCtrl.item) { // found in prmAlmaViewitAfter
				itemID = vm.parentCtrl.item.pnx.control.recordid[0];
			}
			if (vm.parentCtrl.result) { // found in prmSearchResultAvailabilityLineAfter
				itemID = vm.parentCtrl.result.pnx.control.recordid[0];
			}
			vm.openReporter = () =>{
				const w = 600;
				const h = 600;
				const left = (screen.width - w) / 2;
				const top = (screen.height - h) / 4;
				const page = `${districtHost + filePath}utilities/problem-reporter/`;
				const winParams = 'toolbar=no, location=no, menubar=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left;
				$window.open(`${page}?url=${encodeURIComponent(location.href)}&recordid=${itemID}&college=${colAbbr}&queue=${queue}&source=primo`, 'Problem reporter', winParams);
			};
			vm.showProblemReporter = () => { // wait until links load to show the reporter
				if (vm.parentCtrl.item) { // full display
					const deliveryCat = vm.parentCtrl.item.delivery.deliveryCategory;
					if (deliveryCat) {
						if ($attrs.location === 'ViewIt') {
							if (vm.parentCtrl.item.delivery.electronicServices) {
								if (vm.parentCtrl.item.delivery.electronicServices.length > 0) { // wait for full-text links to appear
									return true;
								}
							}
						}
						else if ($attrs.location === 'GetIt') {
							if ((deliveryCat.includes('Alma-E') === false) && (deliveryCat.includes('Alma-D')=== false)) {
								if (vm.parentCtrl.getItType === 'GetIt1') {  
									// get it
									if (vm.parentCtrl.item.delivery.holding) {
										queue = colAbbr;
										if (typeof(vm.parentCtrl.item.delivery.holding[0].availabilityStatement) === 'string') { // wait for object to load before showing button
											return true;
										}				
									}			
								}
							}
						}
					}
				}
				 else if (vm.parentCtrl.result) { // brief results
					if ((vm.parentCtrl.isFullView !== true) && (vm.parentCtrl.isOverlayFullView !== true)) { // only show this here in brief results
						if (document.querySelector('prm-email-template') === null) { // ensure this does not show in emails generated from Primo VE
							const availability = vm.parentCtrl.result.delivery.availability;
							if (availability) {
								const regex = /(fulltext|not_restricted)/;
								for (let format of availability) { // sometimes physical and full-text are both present
									if (regex.test(format) === true) { // only show when there is a full-text link
										return true;
									}
								}
							}
						}
					}
				} else {
					return true;
				}
			};
		};		
	}]);
	// now the directive gets inserted
	// full display - view it
	app.component('prmAlmaViewitAfter', {
		bindings: {
			parentCtrl: '<'
		},
		template: 
		`<lr-problem-reporter flex layout-align="end center" parent-ctrl="$ctrl.parentCtrl" location="ViewIt"></lr-problem-reporter>
		<lr-localnote layout-align="center center" layout="row" flex="" parent-ctrl="$ctrl.parentCtrl" location="viewitbottom"></lr-localnote>`,
		});
	// full display - get it
	app.component('prmFullViewServiceContainerAfter', {
		bindings: {
			parentCtrl: '<'
		},
		template: 
		`<lr-problem-reporter flex layout-align="end end" layout-margin parent-ctrl="$ctrl.parentCtrl" location="GetIt"></lr-problem-reporter>`,
	});
	// brief results
	app.component('prmSearchResultAvailabilityLineAfter', {
		bindings: {
			parentCtrl: '<',
		},
		template:
			`<lr-libkey parent-ctrl="$ctrl.parentCtrl"></lr-libkey>
			<lr-problem-reporter parent-ctrl="$ctrl.parentCtrl" hide-xs layout-align="end center"></lr-problem-reporter>`,
		controller: [
			'$interval',
				'$timeout',
			function ($interval, $timeout) {
				const vm = this;
				vm.$onInit = () => {
					// hide online link when digital link also exists. This works on brief results and full display, but not overlay when clicking from brief results -- seems like digest is not refreshed
					const deliveryCat = vm.parentCtrl.result.delivery.deliveryCategory;
					let position;
					if (
						deliveryCat.includes('Alma-E') &&
						deliveryCat.includes('Alma-D')
					) {
						for (let i = 0; i < deliveryCat.length; i++) {
							if (deliveryCat[i] === 'Alma-E') {
								position = i; // this seems to be the order in which the links appear
							}
						}
						const recordId = vm.parentCtrl.result.pnx.control.recordid; // used in id of span
						const checkEl = $interval(() => {
							// interval is needed because property is not populated immediately when directive appears
							const label = document.getElementById(
								recordId + 'availabilityLine' + position
							);
							if (label) {
								$interval.cancel(checkEl);
								const parentEl = getParents(label, '.layout-row');					
								parentEl[0].style.display = 'none';
							}
						}, 50);
						$timeout(() => {
							$interval.cancel(checkEl);
						}, 5000);
					}
				};
			},
		],
	});
	// record cannot be displayed page
	app.component('prmSignInToViewAfter', {
		bindings: {
			parentCtrl: '<'
		},
		template: 
		`<md-card class="default-card" style="margin-top:-9px;">
			<md-card-content>
				<md-card-actions layout-align="end-center" layout="row">
					<lr-problem-reporter parent-ctrl="$ctrl.parentCtrl"></lr-problem-reporter>
				</md-card-actions></md-card-content>
			</md-card>`
	});
	// Begin BrowZine - Primo Integration...
  	window.browzine = {
      api: `https://public-api.thirdiron.com/public/v1/libraries/${libKeyId}`,
      apiKey: lkAPI,
      journalCoverImagesEnabled: true,
      journalBrowZineWebLinkTextEnabled: false,
      journalBrowZineWebLinkText: 'View Journal Contents',
      articleBrowZineWebLinkTextEnabled: false,
      articleBrowZineWebLinkText: 'View Issue Contents',
      articlePDFDownloadLinkEnabled: true,
      articlePDFDownloadLinkText: 'View PDF',
      articleLinkEnabled: false,
      articleLinkText: 'Read Article',
      printRecordsIntegrationEnabled: true,
      showFormatChoice: false,
      showLinkResolverLink: true,
      enableLinkOptimizer: true,
      articleRetractionWatchEnabled: true,
      articleRetractionWatchText: 'Retracted Article',
      unpaywallEmailAddressKey: lkEmail,
      articlePDFDownloadViaUnpaywallEnabled: true,
      articlePDFDownloadViaUnpaywallText: 'View PDF',
      articleLinkViaUnpaywallEnabled: false,
      articleLinkViaUnpaywallText: 'Read Article (via Unpaywall)',
      articleAcceptedManuscriptPDFViaUnpaywallEnabled: true,
      articleAcceptedManuscriptPDFViaUnpaywallText:  'View PDF (Accepted Manuscript)',
      articleAcceptedManuscriptArticleLinkViaUnpaywallEnabled: false,
      articleAcceptedManuscriptArticleLinkViaUnpaywallText: 'Read Article (Accepted Manuscript)',
    };
    browzine.script = document.createElement('script');
    browzine.script.src = 'https://s3.amazonaws.com/browzine-adapters/primo/browzine-primo-adapter.js';
    document.head.appendChild(browzine.script);
	app.component('lrLibkey', {
		bindings: { parentCtrl: '<' },
		controller: ['$scope',function ($scope) {
				window.browzine.primo.searchResult($scope);
			}
		]
	});
	app.component('prmBrowseSearchAfter', { // insert template into browse screens. would be nice to hide it when results appear
		bindings: {
			parentCtrl: '<'
		},
		controller: 'prmBrowseSearchAfterController',
		templateUrl: custPackagePath + '/html/browse.html'
	});
	app.controller('prmBrowseSearchAfterController', function() { 
		const vm = this;
		vm.$onInit = () => {
			vm.$doCheck = () => {
				if (vm.parentCtrl.browseSearchBarService._selectedScope) {
					vm.searchScope = vm.parentCtrl.browseSearchBarService._selectedScope.SourceCode1;
					vm.hideOnResults = () => {
						// hide cards when there are search results or when search is in progress
						const results = vm.parentCtrl.browseSearchService._browseResult || ''; // array of search results
						const inProgress = vm.parentCtrl.browseSearchService._inProgress || '';
						if (results.length > 0 || inProgress === true) {
							return true;
						}
					};
				}
			};	
		};
	});
	app.component('prmBackToLibrarySearchButtonAfter', { 
		template: '<lr-top-announcement></lr-top-announcement>'
	});
	app.component('prmBackToSearchResultsButtonAfter', { 
		template: '<lr-top-announcement></lr-top-announcement>'
	});
	app.component('prmCollectionGalleryHeaderAfter', {
		template:  '<lr-top-announcement></lr-top-announcement>'
	});
	app.component('lrTopAnnouncement', { // this allows dismissable announcement to show just under search bar area
		controller: 'lrTopAnnouncementController',
		templateUrl: custPackagePath + '/html/top-announcement.html' // enter content into / uncomment this template to show the announcement
	});
	app.controller('lrTopAnnouncementController', ['$cookies', '$timeout', '$http', function($cookies, $timeout, $http) {
		const vm = this;
		vm.$onInit = () => {
			vm.fade = ''; // used for adding classes when dissmissing
			vm.hide = false;
			vm.alertHidden = '';
			vm.cookieID = 'lrHideOSAnnce' + '_' + colAbbr; // default cookieID, if not set in ng-if object
			let lrsaCookie = '';
			let lrsaCookieHide = 0;
			vm.daysToHide = 14; // default days that banner is hidden if user dismisses
			// see if there are any urgent alerts in LibAnswers
			$http
				.get(
					'https://library.losrios.edu/utilities/primo-faq-getter/get-faq.php?group=urgent-alerts'
				)
				.then((response) => {
					if (response.data) {
						const faq = response.data.faqs[0];
						if (faq) {
							console.log(faq);
							vm.question = faq.question;
							vm.url = faq.url.public;
							lrsaCookie = `lr${faq.question.slice(0, 3)}${faq.updated
								.slice(0, 10)
								.replace(/-/g, '')}-${colAbbr}`;
							lrsaCookieHide = 2;
							vm.alertHidden = 'lr-system-alert';
							if ($cookies.get(lrsaCookie) !== 'true') {
								vm.systemAlert = true;
							}
						}
					}
				});
			vm.showAnnounce = (obj) => {
				if (vm.hide === true) { // this happens after dismiss button is pressed
					return false;
				}
				const announceStart = obj.startDate || '';
				const announceExp = obj.endDate || '';
				if (obj.daysToHide) {
					vm.daysToHide = obj.daysToHide;
				}
				const today = new Date();
				if (announceExp !== '') {
					const exp = getDate(announceExp);
					if ((today - exp) > 0) {
						return false;
					}
				}
				if (announceStart !== '') {
					const start = getDate(announceStart);
					if ((today - start) < 0) {
						return false;
					}
				}
				if (obj.cookieID) {
					vm.cookieID = `${obj.cookieID}_${colAbbr}`;
				}
				const hideCookie = $cookies.get(vm.cookieID) || '';
				if (hideCookie !== 'true') {
					return true;
				}
			};
			vm.hideAnnounce = function() {
				let cookieKey = vm.cookieID;
				if ((lrsaCookie !== '') && (vm.systemAlert === true)) {
					cookieKey = lrsaCookie;
				}
				const d = new Date();
				if ((lrsaCookieHide > 0) &&  (vm.systemAlert === true)) {
					vm.daysToHide = lrsaCookieHide;
				} 
				console.log(lrsaCookieHide);
				d.setTime(d.getTime() + (vm.daysToHide * 24 * 60 * 60 * 1000)); 
				vm.fade = 'lr-fadeout'; // allows animation via class
				$timeout(() => {
					$cookies.put(cookieKey, 'true', {
						'expires': d.toUTCString(),
						'path': '/',
						'secure': true,
						'sameSite': 'Lax'
					}); // set cookie to stop showing announcement
					vm.hide = true; // removes element so space stops showing
					vm.hideBlock = 'lr-hide-block';
				}, 300);
				return true;
			};
		};		
	}]);
	// collection discovery - blurb above display
	// $attrs.model will be used to set position in the template. see blurb.html in html/collections
	app.component('prmCollectionSearchAfter', {
		bindings: {
			parentCtrl: '<'
		},
		template: '<lr-collection-blurb parent-ctrl="$ctrl.parentCtrl" model=\'{"position":"top"}\'></lr-collection-blurb>'
	});
	// collection discovery - blurb below display
	app.component('prmCollectionGalleryAfter', {
		bindings: {
			parentCtrl: '<'
		},
		template: '<lr-collection-blurb parent-ctrl="$ctrl.parentCtrl" model=\'{"position":"bottom"}\'></lr-collection-blurb>'
	});
	app.component('lrCollectionBlurb', {
		bindings: {
			parentCtrl: '<'
		},
		templateUrl: custPackagePath + '/html/collections/blurb.html',
		controller: ['$attrs', function($attrs) {
			const vm = this;
			vm.$onInit = () => {
				vm.col = colAbbr;
				const params = JSON.parse($attrs.model) || '';
				vm.position = params.position;
				vm.collectionID = vm.parentCtrl.$stateParams.collectionId || '';
			};
		}]
	});
	app.component('prmFinesAfter', { // show message explaining how to pay fines
		bindings: {
			parentCtrl: '<'
		},
		templateUrl: custPackagePath + '/html/fines.html',
		controller: function() { // only show if there are fines
			const vm = this;
			vm.$onInit = () => {
				vm.hasFines = () => {
					// if there are no fines, this value is the number 0; if there are fines, it is a string		
					if (typeof(vm.parentCtrl.finesCounters) === 'string') {
						return true;
					} else {
						return false;
					}
				};
			};
		}
	});
	app.component('prmRequestsAfter', { // notes regarding certain types of requests or holds
		bindings: {
			parentCtrl: '<'
		},
		template: '<lr-hold-notes parent-ctrl="$ctrl.parentCtrl"></lr-hold-notes>'
	});
	app.component('lrHoldNotes', { // currently custom note for SCC Lockers holdshelf. Can make this accommodate other types of notes if needed
		bindings: {
			parentCtrl: '<'
		},
		template: 
		`<div ng-if="$ctrl.showNote();">Note: one or more items listed above was requested for locker pickup and is currently being held inside the SCC Library. It will be placed in a locker when one becomes available. Please 
			<a href="https://answers.library.losrios.edu/scc/faq/360910" target="_blank">see SCC locker info 
				<lr-ext-link-icon></lr-ext-link-icon>
			</a>.
		</div>`,
		controller: function() {
			const vm = this;
			vm.$onInit = () => {
				vm.showNote = () => {
					const requests = vm.parentCtrl.requestsService._requestsDisplay;
					if (requests) {
						for (let req of requests) {
							if (req.requestType === 'holds') {
								const pickupLib = req.secondLineRight;
								if (pickupLib) {
									if (pickupLib === 'SCC Lockers') {
										if (/on hold( )?shelf/i.test(req.status) === true) {
											return true;
										}
									}
								}
							}
						}
					}
				};
			};			
		}
	});
	app.component('prmRequestAfter', {
		bindings: {
			parentCtrl: '<'
		},
		template: '<lr-delivery-limited parent-ctrl="$ctrl.parentCtrl"></lr-delivery-limited>'
	});
	app.component('lrDeliveryLimited', {
		bindings: {
			parentCtrl: '<'
		},
		template: `
		<div ng-if="::(($ctrl.show) && ($ctrl.faqID!==''))">
			<a ng-href="https://answers.library.losrios.edu/${colAbbr}/faq/{{::$ctrl.faqID}}" target="_blank">
			<md-icon md-svg-icon="action:ic_help_24px"></md-icon> 
			Why don&apos;t I see my preferred pickup location listed? 
				<lr-ext-link-icon></lr-ext-link-icon>
			</a>
		</div>
		`,
		controller: function() {
			const vm = this;
			vm.$onInit = () => {
				vm.show = false;
				vm.faqID = limitedDelivery;
				const delivery = vm.parentCtrl.item.delivery;
				if (delivery.deliveryCategory.indexOf('Alma-P') > -1) {
					const locations = delivery.holding;
					let circPresent = false;
					for (let loc of locations) { // look for locations that circulate to all locations
						if (/^.(c|mdvd)/.test(loc.subLocationCode) === true) {
						circPresent = true;
						break;
						}
					}
					if (circPresent === false) {
						vm.show = true;
					}
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
		// where possible/relevant, load larger thumbnails and hide smaller ones. Also requires some css, see custom1.css "fixes for collection header and thumbnails"
		bindings: {
			parentCtrl: '<'
		},
		template:
			'<div ng-if="::$ctrl.imgSrc"><img ng-src="{{::$ctrl.imgSrc}}" alt="" ng-class="::$ctrl.loaded"></div>',
		// function below will run for each thumbnail
		controller: function () {
			const vm = this;
			vm.$onInit = () => {
				const pattern =
					/syndetics\.com\/.*\/sc\.jpg$|(cdnsecakmi|cfvod)\.kaltura\.com|books\.google\.com/; // identify image sources to replace. Some are ok already, e.g. Kanopy
				const biggerURL = (str) => {
					let replacement = str;
					if (str.indexOf('/sc.jpg') > -1) {
						// syndetics
						replacement = str.replace('/sc.jpg', '/mc.jpg');
					} else if (str.indexOf('/width/88') > -1) {
						// fod
						replacement = str.replace('/width/88', '/width/160');
					} else if (str.indexOf('books.google.com') > -1) {
						replacement = str;
					}
					return replacement;
				};

				// only run this in collection discovery
				if (
					vm.parentCtrl.$state.current.name.indexOf('collectionDiscovery') > -1
				) {
					vm.$doCheck = () => {
						// $doCheck is needed because data takes time to load after directive appears
						if (vm.parentCtrl.item) {
							const recordid = vm.parentCtrl.item.pnx.control.recordid;
							const img = vm.parentCtrl.selectedThumbnailLink; // this is the thumbnail link
							if (img) {
								if (pattern.test(img.linkURL) === true) {
									// only replace the URL if it is syndetics or fod
									const newURL = biggerURL(img.linkURL);
									if (newURL !== '') {
										// load the replacement image
										vm.imgSrc = newURL;
										vm.loaded = 'lr-loaded'; // adds class to image, which facilitates CSS variations
									}
								} else {
									// if we didn't or couldn't replace the image, unhide the default image
									const el = document.querySelector(
										`span[data-url*=${recordid}] + div prm-search-result-thumbnail-container img[class*="fan-img"]`
									);
									if (el) {
										el.style.display = 'block';
									}
								}
							}
						}
					};
				}
			};
		}
	});

	// display text for delivery locations
	app.component('prmRequestServicesAfter', {
		bindings: {
			parentCtrl: '<'
		},
		template: '<lr-delivery-blurb parent-ctrl="$ctrl.parentCtrl"></lr-delivery-blurb>'
	});
	app.component('lrDeliveryBlurb', {
		bindings: {
			parentCtrl: '<'
		},
		template: 
		`<div ng-if="$ctrl.showBlurb();" class="{{$ctrl.highlight}}" ng-init="$ctrl.fadeHighlight();">For information about library locker pickup, please 
			<a ng-href="https://answers.library.losrios.edu/{{::$ctrl.urlPath}}" target="_blank">see our FAQ 
				<lr-ext-link-icon></lr-ext-link-icon>
			</a>.
		</div>`,
		controller: ['$timeout', function($timeout) {
			const vm = this;
			vm.$onInit = () => {
				vm.urlPath = '';
				vm.highlight = '';
				const deliveryLibraries = [ // library ID may be found using configuration API
					{ // scc lockers
						id: '5066568570005325',
						col: 'scc',
						path: '360910'
					},
					{ // flc lockers
						id: '5020041320005325',
						col: 'flc',
						path: '361527'
					}
				];
				vm.showBlurb = () => {
					for (let lib of deliveryLibraries) {
						if (vm.parentCtrl.requestService._formData.requestType === 'hold') {
							const pickupLib = vm.parentCtrl.requestService._formData.pickupLocation;
							if ((pickupLib) && (lib.id)) {
								if (pickupLib.indexOf(lib.id) > -1) {
									vm.urlPath = `${lib.col}/faq/${lib.path}`;
									return true;
								}
							}
						}
					}
				};
				vm.fadeHighlight = () => { // background animation to emphasize presence of the blurb
					$timeout(() => {
						vm.highlight = 'lr-highlighted';
					}, 100);
					$timeout(() => {
						vm.highlight = 'lr-no-highlight';
					}, 3000);
				};
			};
		}]
	});
	app.component('prmLocationsAfter', {
		bindings: {parentCtrl: '<'},
		template: '<lr-localnote parent-ctrl="$ctrl.parentCtrl" layout-align="center center" layout="row" flex="" location="holdingsbottom"></lr-localnote>'
	});

	app.component('lrLocalnote', {
		bindings: { parentCtrl: '<' },
		templateUrl: custPackagePath + '/html/local-note.html',
		controller: [
			'$attrs',
			function ($attrs) {
				const vm = this;
				vm.$onInit = () => {
					const lrNote = vm.parentCtrl.item.pnx.display.lds01;
					vm.notes = []; // we push notes into an array that the template iterates through
					if (lrNote) {
						for (let note of lrNote) {
							const data = JSON.parse(note);
							if (data) {
								vm.currentView = colAbbr; // used to match view to notes that limit views
								// template has location attribute to designate where it is placed
								if (
									data.displayArea &&
									data.displayArea.toLowerCase() === $attrs.location
								) {
									vm.views = data.views || ''; // used for ng-if in template
									const addOneYear = (date) => {
										date.setFullYear(date.getFullYear() + 1);
										return date;
									};
									// get difference of expiration date in note for ng-if
									const today = new Date();
									let expiration;
									if (data.exp) {
										expiration = getDate(data.exp);
									}
									else { // if expiration date isn't set, add a year so that difference will be positive
										expiration = addOneYear(new Date());
									}
									vm.remainingTime = expiration - today; // this number will be 0 if day is same, negative if exp date is in the past, otherwise positive
									vm.$doCheck = () => {
										//  property used for "location-items" area is not populated when directive is initially constructed so we need $doCheck
										if (typeof vm.parentCtrl.loc !== 'undefined') {
											vm.currentLib = vm.parentCtrl.loc.location.libraryCode.toLowerCase(); // used in ng-hide
										}
									};
									vm.notes.push(data);
								}
							}
						}
					}
				};
			}
		]
	});
	app.component('prmServiceDetailsAfter', {
		bindings: {parentCtrl: '<'},
		template: '<lr-subject-faq parent-ctrl="$ctrl.parentCtrl" location="detailsbottom"></lr-subject-faq><lr-localnote parent-ctrl="$ctrl.parentCtrl" layout-align="center center" layout="row" flex="" location="detailsbottom"></lr-localnote>'
	});
	app.component('prmSearchResultToolBarAfter', {
		bindings: {parentCtrl: '<'},
		template: '<lr-subject-faq parent-ctrl="$ctrl.parentCtrl" location="resultstop"></lr-subject-faq>'
	});
	// show a link to a FAQ explaining how subject headings work in OneSearch. This is shown when someone does a subject search or clicks a subject facet
	app.component('lrSubjectFaq', {
		bindings: {
			parentCtrl: '<'
		},
		template: `
		<div ng-if="::($ctrl.faqLink !=='')">
			<div ng-if="::($ctrl.subjQuery || $ctrl.subjFacet || $ctrl.isDetails)" ng-hide="::$ctrl.hide">
				<div layout="row" layout-margin >
		        	<div layout="column" layout-align="center" flex="75" class="{{$ctrl.highlight}}" ng-init="$ctrl.fadeHighlight();" >
		                <a ng-href="{{::$ctrl.faqLink}}" target="_blank">{{$ctrl.subjFaqTitle}} <lr-ext-link-icon></lr-ext-link-icon></a>
		        	</div>
					<div layout="column" layout-align="center end" flex="25"> 
						<md-button>
		              		<md-icon md-svg-icon="navigation:ic_close_24px" aria-label="Close" title="Stop showing this link on subject searches" ng-click="$ctrl.close();" style="cursor:pointer;"></md-icon>
					  </md-button>
		        	</div>
		    	</div>
	    	</div>
			<div ng-if="$ctrl.dismissed">
				<div layout="row" layout-margin >
					<div>
		            	A cookie has been set on this computer to hide this alert for {{$ctrl.days}} days.
					</div>
				</div>
			</div>
		</div>
		`,
		controller: [
			'$cookies',
			'$attrs',
			'$timeout',
			function ($cookies, $attrs, $timeout) {
				const vm = this;
				vm.$onInit = () => {
					const cookieName = `${colAbbr}_subjFAQ`; // different for each view
					vm.faqLink = '';
					vm.highlight = '';
					if (subjFaqID !== '') {
						vm.faqLink = `https://answers.library.losrios.edu/${colAbbr}/faq/${subjFaqID}`;
						vm.subjFaqTitle = subjFaqTitle;
					}
					// if dismiss button is clicked, hide the link and set a cookie to stop showing it for 30 days. Will still show in footer
					vm.close = () => {
						vm.hide = true;
						vm.dismissed = true;
						$timeout(() => {
							vm.dismissed = false;
						}, 6000);
						const d = new Date();
						vm.days = 60;
						d.setTime(d.getTime() + vm.days * 24 * 60 * 60 * 1000); // 30 days
						$cookies.put(`${cookieName}`, 'hide', {
							expires: d.toUTCString(),
							path: '/',
							secure: true,
							sameSite: 'Lax'
						});
					};
					vm.fadeHighlight = () => {
						// background animation to emphasize presence of the link. Only shows on first activation of session on subject search/filter
						if ($attrs.location === 'resultstop') {
							const cName = 'lr-no-highlight';
							if ($cookies.get(cName) !== 'true') {
								$timeout(() => {
									vm.highlight = 'lr-highlighted';
								}, 100);
								$timeout(() => {
									vm.highlight = 'lr-no-highlight';
									$cookies.put(cName, 'true', {
										path: '/',
										secure: true,
										sameSite: 'Lax'
									});
								}, 5000);
							}
						}
					};
					vm.$doCheck = () => {
						if (vm.parentCtrl) {
							// always show in details
							if ($attrs.location === 'detailsbottom') {
								// check if item being displayed has any subjects
								if (vm.parentCtrl.item.pnx.display.subject) {
									vm.isDetails = true;
								}
							} else {
								// show contextually when user has performed a subject search or used the subject facets. Message will show at top of results. No clear way to display it near subjects themselves.
								// only show if user has not clicked dismiss button in last x days

								if ($cookies.get(cookieName) !== 'hide') {
									// location of objects varies in different directives
									let root = vm.parentCtrl.$stateParams;
									if (vm.parentCtrl.searchService) {
										root = vm.parentCtrl.searchService.$stateParams;
									}
									if (root.query) {
										vm.query = root.query;
										vm.subjQuery = false;
										if (vm.query.indexOf('sub,') === 0) {
											vm.subjQuery = true;
										}
										const facet = root.facet;
										const re = /^(topic|lds02),/; // regular subject facet and Spanish-language "Materia"
										// return true if subject search or selected subject facet is found
										if (vm.subjQuery === false) {
											if (Array.isArray(facet)) {
												// when more than one facet is selected, it is an array, otherwise a string
												for (let member of facet) {
													if (re.test(member) === true) {
														vm.subjFacet = true;
													}
												}
											} else {
												if (re.test(facet) === true) {
													vm.subjFacet = true;
												}
											}
										}
									}
								}
							}
						}
					};
				};
			}
		]
	});
	app.component('prmLocationAfter', {
		bindings: {parentCtrl: '<'},
		template: '<lr-holdings-note parent-ctrl="$ctrl.parentCtrl"></lr-holdings-note>'
	});
	app.component('prmLocationItemsAfter', {
		bindings: {parentCtrl: '<'},
		template: '<lr-holdings-note parent-ctrl="$ctrl.parentCtrl"></lr-holdings-note><lr-localnote parent-ctrl="$ctrl.parentCtrl" layout-align="center center" layout="row" flex="" location="holdingsbottom"></lr-localnote>'
	});
	app.component('prmOpacAfter', {
		bindings: {parentCtrl: '<'},
		template: '<lr-localnote parent-ctrl="$ctrl.parentCtrl" layout-align="center center" layout="row" flex="" location="holdingstop"></lr-localnote>'
	});
	
	
	
	app.component('lrHoldingsNote', { // add notes about unusual characterstics / limitations of particular physical locations
		bindings: {parentCtrl: '<'},
		templateUrl: custPackagePath + '/html/getit/holdings-note.html',
		controller: function() {
			const vm = this;
			vm.$onInit = () => {
				if (vm.parentCtrl.loc) {
					if (/available|check_holdings/.test(vm.parentCtrl.loc.location.availabilityStatus) === true) {
						vm.locationCode = vm.parentCtrl.loc.location.subLocationCode; // used in template
					}
				}
			};
		}
	});
	app.component('lrIllLink', {
		bindings: { parentCtrl: '<' },
		template: 
		`<div ng-if="$ctrl.show">
			<md-list layout="column">
				<md-list-item>
					<div layout="row" flex="">
						<div layout="row">
							<div layout="column" flex="" flex-xs="100">
								<a ng-href="{{::$ctrl.url}}" target="blank">Request this item via interlibrary loan
									<lr-ext-link-icon></lr-ext-link-icon>
								</a>
							</div>
						</div>
					</div>
				</md-list-item>
			</md-list>
		</div>`,
		controller: function () {
			const vm = this;
			vm.$onInit = () => {
				vm.show = false;
				const url = vm.parentCtrl.fullViewService.$location.$$absUrl;
				vm.$doCheck = () => {
					const illLink = document.querySelector(
						'a[href*="interlibrary-loan"]'
					);

					if (illLink) {
						vm.url = illLink.href.replace('interlibrary-loan/?', 'interlibrary-loan/?library=' + colAbbr + '&').replace(
							/$/,
							'&url=' + encodeURIComponent(url)
						);
						const originalLink = getParents(illLink, 'md-list');
						originalLink[0].style.display = 'none';
						vm.show = true;
					}
				};
			};
		}
	});
	
	app.component('almaHowovpAfter', {
		bindings: {parentCtrl: '<'},
		template: '<lr-ill-link parent-ctrl="$ctrl.parentCtrl"></lr-ill-link>'
	});
	app.component('prmBriefResultAfter', {
		bindings: {parentCtrl: '<'},
		template: '<lr-local-creator-badge parent-ctrl="$ctrl.parentCtrl"></lr-local-creator-badge><lr-localnote parent-ctrl="$ctrl.parentCtrl" location="brief" ng-if="::$ctrl.parentCtrl.$location.$$url.indexOf(\'/fulldisplay\') === 0"><lr-localnote>'
	});
	app.component('lrLocalCreatorBadge', {
		bindings: {
			parentCtrl: '<'
		},
		templateUrl: custPackagePath + '/html/local-creator.html',
		controller: function () {
			const vm = this;
			vm.$onInit = () => {
				const lrCrField = vm.parentCtrl.item.pnx.display.lds09; // this is always an array and will normally have one member but there could be more
				vm.creators = []; // we push creator objects into an array that the template iterates through
				if (lrCrField) {
					for (let field of lrCrField) { // for each array member we will read object and process
						const data = JSON.parse(field);
						vm.creatorType = 'creator'; // default if role is not defined
						if (data.role) { // get role
							vm.creatorType = data.role;
						}
						const creator = {};
						if ((data.crName) && (data.currency)) {
							vm.badge = true; // set property that allows the badges to show
							creator.crName = data.crName;
							creator.creatorType = data.role;
							const zTitle = 'affiliated';
							let connector = 'with';
							let currency = 'is';
							let deceased = false;
							if ((data.deceased) && (data.deceased === 'deceased')) {
								deceased = true;
							}
							let art = '';
							let title = zTitle;
							if (data.position) {
								title = data.position;
								connector = 'at';
								if (/^(Interim )?President/.test(title)) {
									connector = 'of';
								}
								if (/^[aeiou]/i.test(title)) {
									art = 'an';
								} 
								else if (/^((Interim )?(Dean|Pres|Vice|Direct))/.test(title)) {
									art = '';
								}
								else {
									art = 'a';
								}
								if (data.currency === 'former') {
									currency = 'is a former';
									if (deceased === true) {
										currency = 'was ' + art;
									}
									art = '';
									if (title === zTitle) {
										currency = 'was formerly';
										if (deceased === true) {
											currency = 'was';
										}
									}
								}
							}
							creator.title = `${currency} ${art} ${title} ${connector}`;
							let college = 'Los Rios Community College District';
							const crCol = [];
							let collegePhr = '';
							if (data.college) {
								for (let lib of libraries) { // use libraries array defined at top of this file
									if (data.college.indexOf(lib.abbr) > -1) {
										crCol.push(`${lib.name} College`);
									}
								}
								let colNum = crCol.length; // vary syntax based on how many colleges are listed
								if (colNum === 1) { // just one college
								collegePhr = crCol[0];
								} else if (colNum === 2) { // two colleges
									collegePhr = `${crCol[0]} and ${crCol[1]}`;
								} else { // moret than two
									const lastMember = crCol[colNum - 1];
									crCol.splice(colNum - 1, 1, 'and ' + lastMember);
									collegePhr = crCol.join(', ');
								}
								college = collegePhr;
							}
							creator.college = college;
						}
						let url = '';
						if (data.url) {
							url = data.url;
						}
						creator.url = url;
						vm.creators.push(creator);
					}
				}
			};
		}
	});
	
	// set cookie for things like films on demand workaround
	setTimeout(() => {
		const el = document.createElement('iframe');
		el.style.position = 'absolute';
		el.style.left = '-99999px';
		el.setAttribute('src', `${districtHost + filePath}utilities/cookie-setter.php?college=${colAbbr}`);
		// append the iframe in order to set the cookie, then remove it from the DOM
		document.getElementsByTagName('body')[0].appendChild(el);
		setTimeout(() => {
			el.parentNode.removeChild(el);	
		}, 2000);
		
		
	}, 10000);
	
	(() => {
			// Footer (from NLNZ) - measure page once "is sticky" is put in and (try) to put footer after results. Posted on Primo listserv by Bond University, November 2019

			// Instantiate variables that will be reset repeatedly in the listener function
			let max = 0;
			let winHeight = 0;
			let scrollTop = 0;
			let foot = 0;
			// and let's have a small buffer before the footer
			const buffer = 50;
			window.addEventListener('scroll', () => {

				// Total length of document
				max = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight,
					document.body.offsetHeight, document.documentElement.offsetHeight,
					document.body.clientHeight, document.documentElement.clientHeight);
				// Height of window
				winHeight = window.innerHeight || (document.documentElement || document.body).clientHeight;
				// Point of the top of the document visible on screen
				scrollTop = window.scrollY || (document.documentElement || document.body.parentNode || document.body).scrollTop;
				const footer = document.getElementById('footer');
				if (footer) {
					// Height of footer
					foot = Math.round(parseFloat(window.getComputedStyle(document.getElementById('footer')).height));
					// check where we are in terms of scrolling and the footer
					const stuckWin = document.querySelectorAll('.primo-scrollbar.is-stuck')[0];
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

		})();
		(() => { // load libchat
			const noWidgetPattern = new RegExp(`https://${location.hostname}/discovery/(delivery|researchAssistant)`);
			const host = 'answers.library.losrios.edu';
			const div = document.createElement('div');
			div.id = `libchat_${libchatHash}`;
			document.getElementsByTagName('body')[0].appendChild(div);
			const scr = document.createElement('script');
			scr.src = `https://${host}/load_chat.php?hash=${libchatHash}`;
			setTimeout(() => {
				if (noWidgetPattern.test(location.href) === false) { // don't include in Alma viewer or Primo AI tool
					document.getElementsByTagName('body')[0].appendChild(scr);
				}
			}, 2000);
		})();
})();