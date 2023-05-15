(function () {
	'use strict';
	/* college-specific variables */
	var colAbbr = 'arc';
	var libchatHash = '39df8b17e49bd4efbb4461f1831118b9';
	var c19Page = 'https://libguides.arc.losrios.edu/c.php?g=1012164';
	var almaDHelp = 'https://answers.library.losrios.edu/arc/faq/372430';
	var libKeyId = '3234';
	var lkAPI = 'e703f647-d664-48af-bd98-c1e434b3628e';
	var lkEmail = 'WilliaK2@arc.losrios.edu';
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
	var custPackagePath = '/discovery/custom/01CACCL_' + viewCode.env + '-' + viewCode.view;
	var app = angular.module('viewCustom', ['angularLoad']);
	// ** START SCC/ARC-ONLY COMPONENT -- NOT INCLUDED IN OTHER COLLEGE FILES **
	app.component('lrNewbooksDisplay', {
		templateUrl: custPackagePath + '/html/homepage/newbooks-display.html',
		controller: 'lrNewbooksDisplayController'
	});
	app.controller('lrNewbooksDisplayController', ['$http', '$timeout','$interval', '$attrs', function($http, $timeout,$interval,$attrs) {
		var vm = this;
		vm.$onInit = function() {
			vm.colAbbr = colAbbr;
			var idRegex = /(^(978\d{10})|(\d{9}[\dxX])$)|^(kan|loc)_/;
			console.log($attrs.model);
			var params = JSON.parse($attrs.model); // set in model attribute of directive. see https://stackoverflow.com/a/23612752/1903000
			var numToShow = params.numToShow || 8; // default is 8
			vm.cardName = params.cardName || 'Add a heading';
			if (!(params.reportName)) {
				console.log('no Analytics report indicated');
				return false;
			}
			var newBooksArr = {}; // using object allows this to be used more tha once
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
				newBooksArr[params.report].splice(0, numToShow); // hm... this means that if you go elsewhere in primo and return to the home page, the array is reduced in size from what it was. Maybe that's ok
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
				str = str || '';
				if (str !== '') {
					if (str.indexOf('loc_') === 0) {
						var mmsId = str.match(/\d{14}5325/);
						if (mmsId !== null) {
							return 'lr_loc_' + mmsId[0];
						}
					} else if (idRegex.test(str) === true) {
						return 'lr_' + str;
					}
				}
			};
			vm.checkIdentifier = function(str) { // titles without proper ISBN or Kanopy ID are treated as no-cover
				str = str || '';
				str = str.replace(/^lr_/, '');
				if (idRegex.test(str) === false) {
					return 'no-cover';
				}
			};

			vm.imgSrc = function(str) { // determines source of images; syndetics uses isbn, kanopy has its own system
				str = str || '';
				var arr;
				if (str.indexOf('kan_') === 0) {
					arr = str.split('kan_');
					return 'https://www.kanopy.com/node/' + arr[1] + '/external-image';
				} else if (str.indexOf('loc_') === 0) {
					arr = str.split('loc_');
					return arr[1];
				} else if (idRegex.test(str) === true) {
					return 'https://syndetics.com/index.php?client=primo&isbn=' + str + '/mc.jpg';
				}
			};
			vm.checkImg = function(str) { // syndetics returns a 1x1 pixel image if it doesn't have a jacket based on isbn queried. so detect this and change classname when that happens to allow alternative styling
				if (str !== 'lr_') { // check forwhen identifier is not found
					if (/(kan|loc)_/.test(str) === false) {
						var checkInt = $interval(function() { // interval allows some time for jacket to load
							var el = document.getElementById(str);
							if (el) {
								var img = el.querySelector('#' + str + ' img');
								if ((angular.element(el).length) && (!(angular.element(el).hasClass('no-cover')))) {
									if ((img.complete === true) && (img.height === 1)) {
										angular.element(el).addClass('no-cover'); // maybe there's a better way to do this using ng-class
									}
								}
							}
						}, 1000);
						$timeout(function() { // not good to let the interval run indefinitely
							$interval.cancel(checkInt);
						}, 4000);
					}
				}
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
					} else {
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
				str = str || '';
				if (str.indexOf('kan_') > -1) {
					return ['flex-gt-sm-40', 'flex-100'];
				} else {
					return ['flex-20', 'flex-xs-40'];
				}
			};
			if (typeof(newBooksArr[params.report]) !== 'undefined') {
				// this will happen if user comes back to home page from elsewhere in Primo
				makeList(newBooksArr[params.report]);
			} else {
				// this will happen on initial page load
				$http.get(districtHost + filePath + 'utilities/analytics/analytics-proxy.php?report=' + params.reportName)
					.then(function(response) {
						var arr = response.data.QueryResult.ResultXml.rowset.Row; // table
						console.log(arr);
						// randomize the array
						var shuffledArr = shuffleArr(arr);
						newBooksArr[params.report] = shuffledArr; // cache randomized array of new title objects as object property value
						makeList(newBooksArr[params.report]);
					}, function(response) { // on error, hide the card and log error to console
						vm.bookList = false;
						console.log('http get error: ');
						console.log(response);
					});
			}
			vm.addBooks = function() {
				makeList(newBooksArr[params.report]);
			};
			vm.showButton = function() { // removes button if anyone gets all the way to the end of the array
				if (newBooksArr[params.report].length > 0) {
					return true;
				}
			};
			// keep track of this array in console, for testing
			console.log('newBooksArr: ');
			if (typeof(newBooksArr) !== 'undefined') {
				console.log(newBooksArr[params.report]);
			}
		};		
	}]);
	// ** END SCC/ARC-ONLY COMPONENT -- below this code is identical college-to-college**
	// external link template
	app.component('lrExtLinkIcon', {
		template: '<span external-link=""><md-icon md-svg-icon="primo-ui:open-in-new" aria-label="Open in new tab"></md-icon></span>'
	});
	// logo
	app.component('prmSearchBarAfter', {
		bindings: {parentCtrl: '<'},
		controller: 'prmSearchBarAfterController',
		template: '<div id="lr-onesearch" hide="" show-gt-sm=""><md-button aria-label="OneSearch" ng-href="{{::$ctrl.homePage}}" ng-click="$ctrl.scrollUp()"><img ng-src="' + custPackagePath + '/img/onesearch-logo.png" alt="OneSearch - Los Rios Libraries"> </md-button></div>'
		
		});
	app.controller('prmSearchBarAfterController', ['$window', function($window) {
		var vm = this;
		vm.$onInit = function() {
			vm.homePage = '/discovery/search?vid=' + vm.parentCtrl.vid;
			vm.scrollUp = function() { // force page to scroll up
				$window.scrollTo(0, 0);
				return true;
			};
		};
	}]);
	app.controller('exploreFooterAfterController', ['$window', function($window) {
		var vm = this;
		vm.$onInit = function() {
			vm.browseURL = '/discovery/browse?vid=01CACCL_' + viewCode.env + ':' + viewCode.view;
			vm.scrollUp = function() { // force page to scroll up when clicking browse link in footer
				$window.scrollTo(0, 0);
				return true;
			};
			vm.checkForContent = function() {
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
		};		
	}]);

	app.component('prmExploreFooterAfter', { // insert template into footer area
		controller: 'exploreFooterAfterController',
		templateUrl: custPackagePath + '/html/footer.html'
	});
	// faq on home page. To implement, add matching directive to html in home page
	app.component('lrHomepageFaq', {
		controller: 'lrHomepageFaqController',
		template: '<div id="lr-faq-block" ng-init="$ctrl.getFaq();"><md-list ng-if="$ctrl.faqExist" id="lr-faq-list"><md-list-item ng-repeat="f in ::$ctrl.faqList" layout-padding><a href="{{::f.url.public}}" target="_blank">{{::f.question}} <lr-ext-link-icon></lr-ext-link-icon></a></md-list-item></md-list><p layout="row" layout-align="end start"><md-button external-link="" ng-href="https://answers.library.losrios.edu/{{::$ctrl.col}}" target="_blank">More Library Answers <lr-ext-link-icon></lr-ext-link-icon></md-button></p></div>'
	});
	app.controller('lrHomepageFaqController', ['$http', '$window', function($http, $window) {
		var vm = this;
		vm.$onInit = function() {
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
		};
	}]);
	// links to info about digital objects / alma-d
	app.component('prmAlmaViewitItemsAfter', {
		bindings: { parentCtrl: '<'},
		template: '<lr-alma-d-notes parent-ctrl="$ctrl.parentCtrl"></lr-alma-d-notes>'
	});
	app.component('lrAlmaDNotes', {
		bindings: {	parentCtrl: '<' },
		template: '<div ng-if="$ctrl.showInfo();"><a href="{{::$ctrl.url}}" target="_blank"><md-icon md-svg-icon="action:ic_info_outline_24px" aria-label="Info"></md-icon> Find out more about digital textbooks <span external-link=""><lr-ext-link-icon></lr-ext-link-icon></a></a></div>',
		controller: function () {
			var vm = this;
			vm.$onInit = function () {
				if (almaDHelp !== '') {
					vm.url = almaDHelp;
					vm.showInfo = function () {
						var serviceType = vm.parentCtrl.serviceType;
						if (serviceType === 'DIGITAL') {
							return true;
						}
					};
				}
			};
		}
	});
	// notes to attach to view it when necessary, e.g. problematic cdi behavior. will be inserted into prmAlmaViewItAfter
	app.component('lrViewitNotes', {
		bindings: {
			parentCtrl: '<'
		},
		templateUrl: custPackagePath + '/html/full-display/viewit-notes.html',
		controller: function() {
			var vm = this;
			vm.$onInit = function() {
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
			};			
		} 
	});
	// problem reporter. this template is inserted into a few different directives
	app.component('lrProblemReporter', {
		bindings: {
			parentCtrl: '<'
		},
		controller: 'lrProblemReporterController',
		template: '<md-button ng-if="$ctrl.showProblemReporter()" ng-click="$ctrl.openReporter()"><md-icon md-svg-icon="alert:ic_error_outline_24px" aria-label="Alert"></md-icon> Report a problem</md-button>'
	});
	app.controller('lrProblemReporterController', ['$window', function ($window) {
		var vm = this;
		vm.$onInit = function() {
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
				} else if (vm.parentCtrl.result) { // brief results
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
				} else {
					return true;
				}
			};
		};		
	}]);
	// now the directive gets inserted
	// full display
	app.component('prmAlmaViewitAfter', {
		bindings: {
			parentCtrl: '<'
		},
		// two different directives here
		template: '<lr-viewit-notes parent-ctrl="$ctrl.parentCtrl"></lr-viewit-notes><lr-problem-reporter flex layout-align="end center" parent-ctrl="$ctrl.parentCtrl"></lr-problem-reporter>',
		});
	// brief results
	app.component('prmSearchResultAvailabilityLineAfter', {
		bindings: {
			parentCtrl: '<',
		},
		template:
			'<lr-libkey parent-ctrl="$ctrl.parentCtrl"></lr-libkey><lr-problem-reporter parent-ctrl="$ctrl.parentCtrl" hide-xs layout-align="end center"></lr-problem-reporter>',
		controller: [
			'$interval',
				'$timeout',
			function ($interval, $timeout) {
				var vm = this;
				vm.$onInit = function () {
					// hide online link when digital link also exists. This works on brief results and full display, but not overlay when clicking from brief results -- seems like digest is not refreshed
					// function gets parents of given element
					var getParents = function (el, selector) {
						var parents = [];
						while ((el = el.parentNode) && el !== document) {
							if (!selector || el.matches(selector)) parents.push(el);
						}
						return parents;
					};
					var deliveryCat = vm.parentCtrl.result.delivery.deliveryCategory;
					var position;
					if (
						deliveryCat.includes('Alma-E') &&
						deliveryCat.includes('Alma-D')
					) {
						for (var i = 0; i < deliveryCat.length; i++) {
							if (deliveryCat[i] === 'Alma-E') {
								position = i; // this seems to be the order in which the links appear
							}
						}
						var recordId = vm.parentCtrl.result.pnx.control.recordid; // used in id of span
						var checkEl = $interval(function () {
							// interval is needed because property is not populated immediately when directive appears
							var label = document.getElementById(
								recordId + 'availabilityLine' + position
							);
							if (label) {
								$interval.cancel(checkEl);
								var parentEl = getParents(label, '.layout-row');					
								parentEl[0].style.display = 'none';
							}
						}, 50);
						$timeout(function () {
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
		template: '<md-card class="default-card" style="margin-top:-9px;"><md-card-content><md-card-actions layout-align="end-center" layout="row"><lr-problem-reporter parent-ctrl="$ctrl.parentCtrl"></lr-problem-reporter></md-card-actions></md-card-content></md-card>'
	});
	// Begin BrowZine - Primo Integration...
  	window.browzine = {
      api: 'https://public-api.thirdiron.com/public/v1/libraries/' + libKeyId,
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
    	controller: function($scope) {
			window.browzine.primo.searchResult($scope);
		}
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
		vm.$onInit = function() {
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
				if ((results.length > 0 || inProgress === true)) {
					return true;
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
	app.controller('lrTopAnnouncementController', ['$cookies', '$timeout', function($cookies, $timeout) {
		var vm = this;
		vm.$onInit = function() {
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
					if ((today - start) < 0) {
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
						'path': '/',
						'secure': true
					}); // set cookie to stop showing announcement
					vm.hide = true; // removes element so space stops showing
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
			var vm = this;
			vm.$onInit = function() {
				vm.col = colAbbr;
				var params = JSON.parse($attrs.model);
				var collectionID = vm.parentCtrl.$stateParams.collectionId;
				vm.showBlurb = function(obj) {
					if (obj.collection === collectionID) {
						if (obj.position === params.position) {
							if (vm.parentCtrl._itemsExist === true) { // wait for jackets to load
								return true;
							}
						}
					}
				};
			};
		}]
	});
	app.component('prmFinesAfter', { // show message explaining how to pay fines
		bindings: {
			parentCtrl: '<'
		},
		templateUrl: custPackagePath + '/html/fines.html',
		controller: function() { // only show if there are fines
			var vm = this;
			vm.$onInit = function() {
				vm.c19Page = c19Page;
				vm.hasFines = function() {
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
		template: '<div ng-if="$ctrl.showNote();">Note: one or more items listed above was requested for locker pickup and is currently being held inside the SCC Library. It will be placed in a locker when one becomes available. Please <a href="https://answers.library.losrios.edu/scc/faq/360910" target="_blank">see SCC locker info <lr-ext-link-icon></lr-ext-link-icon></a>.</div>',
		controller: function() {
			var vm = this;
			vm.$onInit = function() {
				vm.showNote = function() {
					var requests = vm.parentCtrl.requestsService._requestsDisplay;
					if (requests) {
						for (var i = 0; i < requests.length; i++) {
							if (requests[i].requestType === 'holds') {
								var pickupLib = requests[i].secondLineRight;
								if (pickupLib) {
									if (pickupLib === 'SCC Lockers') {
										if (/on hold( )?shelf/i.test(requests[i].status) === true) {
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
			vm.$onInit = function() {
				var pattern = /syndetics\.com\/|(cdnsecakmi|cfvod)\.kaltura\.com|books\.google\.com/;
				var biggerURL = function(str) {
					var replacement = '';
					if (str.indexOf('/sc.jpg') > -1) { // syndetics
						replacement = str.replace('/sc.jpg', '/mc.jpg');
					} else if (str.indexOf('/width/88') > -1) { // fod
						replacement = str.replace('/width/88', '/width/160');
					} else if (str.indexOf('books.google.com') > -1) {
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
					}, 10000);
				}
			};
		}]
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
		template: '<div ng-if="$ctrl.showBlurb();" class="{{$ctrl.highlight}}" ng-init="$ctrl.fadeHighlight();">For information about library locker pickup, please <a ng-href="https://answers.library.losrios.edu/{{::$ctrl.urlPath}}" target="_blank">see our FAQ <lr-ext-link-icon></lr-ext-link-icon></a>.</div>',
		controller: ['$timeout', function($timeout) {
			var vm = this;
			vm.$onInit = function() {
				vm.urlPath = '';
				vm.highlight = '';
				var deliveryLibraries = [ // library ID may be found using configuration API
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
				vm.showBlurb = function() {
					for (var i = 0; i < deliveryLibraries.length; i++) {
						var lib = deliveryLibraries[i];
						if (vm.parentCtrl.requestService._formData.requestType === 'hold') {
							var pickupLib = vm.parentCtrl.requestService._formData.pickupLocation;
							if ((pickupLib) && (lib.id)) {
								if (pickupLib.indexOf(lib.id) > -1) {
									vm.urlPath = lib.col + '/faq/' + lib.path;
									return true;
								}
							}
						}
					}
				};
				vm.fadeHighlight = function() { // background animation to emphasize presence of the blurb
					$timeout(function() {
						vm.highlight = 'lr-highlighted';
					}, 100);
					$timeout(function() {
						vm.highlight = 'lr-no-highlight';
					}, 3000);
				};
			};
		}]
	});
	app.component('prmLocationsAfter', {
		bindings: {parentCtrl: '<'},
		template: '<lr-getit-locations-note parent-ctrl="$ctrl.parentCtrl" model=\'{"directive":"locations"}\'></lr-getit-locations-note>'
	});
	app.component('prmLocationItemsAfter', {
		bindings: {parentCtrl: '<'},
		template: '<lr-getit-locations-note parent-ctrl="$ctrl.parentCtrl" model=\'{"directive":"items"}\'></lr-getit-locations-note>'
	});
	app.component('lrGetitLocationsNote', { // provide notes for particular records for particular locations in Get It area
		bindings: {
			parentCtrl: '<'
		},
		templateUrl: custPackagePath + '/html/getit/locations-note.html',
		controller: ['$attrs', function ($attrs) {
			var vm = this;
			vm.$onInit = function () {
				var params = JSON.parse($attrs.model);
				var record = vm.parentCtrl.item.pnx.control.sourcerecordid[0];
				vm.showNote = function (obj) {
					if ((obj.record === record) || (!(obj.record))) {
						if (params.directive === 'locations') { // this is for initial getit screen
							var holdings = vm.parentCtrl.item.delivery.holding;
							for (var i = 0; i < holdings.length; i++) {
								if (holdings[i].libraryCode === obj.library) {
									return true;
								}
							}
						}
						if (params.directive === 'items') {
							if (vm.parentCtrl.loc) { // this data element only exists in prmlocationitems
								var library = vm.parentCtrl.loc.location.libraryCode;
								if (library == obj.library) {
									return true;
								}
							}
						}
					}
				};
			};
			}]
	});
	app.component('prmBriefResultAfter', {
		bindings: {parentCtrl: '<'},
		template: '<lr-local-creator-badge parent-ctrl="$ctrl.parentCtrl"></lr-local-creator-badge>'
	});
	app.component('lrLocalCreatorBadge', {
		bindings: {
			parentCtrl: '<'
		},
		templateUrl: custPackagePath + '/html/local-creator.html',
		controller: function () {
			var vm = this;
			vm.$onInit = function() {
				var lrCrField = vm.parentCtrl.item.pnx.display.lds09; // this is always an array and will normally have one member but there could be more
				vm.creators = []; // we push creator objects into an array that the template iterates through
				if (lrCrField) {
					for (var i = 0; i < lrCrField.length; i++) { // for each array member we will split by delimiter and process
						var data = JSON.parse(lrCrField[i]);
						var creator = {};
						if ((((data.crName) && (data.crName !== 'z')) && (data.currency) && (data.currency !== 'z'))) {
							creator.crName = data.crName;
							var zTitle = 'affiliated';
							var connector = 'with';
							var currency = 'is';
							var art = '';
							var title = zTitle;
							if ((data.position) && (data.position !== 'z')) {
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
									art = '';
									if (title === zTitle) {
										currency = 'was formerly';
									}
								}
							}
							creator.title = currency + ' ' + art + ' ' + title + ' ' + connector;
							var college = 'Los Rios Community College District';
							var crCol = [];
							var collegePhr = '';
							if ((data.college) && (data.college !== 'z')) {
								for (var j = 0; j < libraries.length; j++) { // use libraries array defined at top of this file
									if (data.college.indexOf(libraries[j].abbr) > -1) {
										crCol.push(libraries[j].name + ' College');
									}
								}
								var colNum = crCol.length; // vary syntax based on how many colleges are listed
								if (colNum === 1) { // just one college
								collegePhr = crCol[0];
								} else if (colNum === 2) { // two colleges
									collegePhr = crCol[0] + ' and ' + crCol[1];
								} else { // moret than two
									var lastMember = crCol[colNum - 1];
									crCol.splice(colNum - 1, 1, 'and ' + lastMember);
									collegePhr = crCol.join(', ');
								}
								college = collegePhr;
							}
							creator.college = college;
						}
						var url = '';
						if ((data.url) && (data.url !== 'z')) {
							url = data.url;
						}
						creator.url = url;
						vm.creators.push(creator);
					}
				}
				vm.showBadge = function() {
					if (lrCrField) {
						var data = JSON.parse(lrCrField[0]);
						if (data.lrcreator.indexOf('lrcreator') > -1) { // must have this value in 988$a
							vm.creatorType = 'creator'; // default if role is not defined
							if ((data.role) && (data.role !== 'z')) { // get role
									vm.creatorType = data.role;
							}
							return true;
						}
					}
				};
				vm.showBlurb = function() { // only show creator statement in full display
					if (vm.parentCtrl.$location.$$url.indexOf('/fulldisplay') === 0) {
						return true;
					}
				};
			};
		}
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
		var almaDStr = 'https://' + location.hostname + '/discovery/delivery/';
		var div = document.createElement('div');
		div.id = 'libchat_' + libchatHash;
		document.getElementsByTagName('body')[0].appendChild(div);
		var scr = document.createElement('script');
		scr.src = 'https://answers.library.losrios.edu/load_chat.php?hash=' + libchatHash;
		setTimeout(function () {
			if (location.href.indexOf(almaDStr) !== 0) { // don't include in Alma viewer
				document.getElementsByTagName('body')[0].appendChild(scr);
			}
		}, 2000);
	}());
}());