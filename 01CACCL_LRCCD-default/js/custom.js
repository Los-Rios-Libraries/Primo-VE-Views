(function () {
    "use strict";
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
    app.component('prmSearchResultAvailabilityLineAfter', {
        bindings: {parentCtrl: '<'},
		template: '<lr-view-buttons parent-ctrl="$ctrl.parentCtrl"></lr-view-buttons>'
        });
    app.component('lrViewButtons', {
        bindings: {parentCtrl: '<'},
		template: '<div layout="row" layout-align="center" style="font-weight:bold;" ng-if="::$ctrl.parentCtrl.isFullView === true"><div layout="column" layout-align="center"><p>See this record in a college-level OneSearch view:</p></div><div layout="column"><ul layout="row"><li ng-repeat="library in $ctrl.views" style="list-style-type:none;"><md-button external-link=""  ng-href="https://{{::$ctrl.host}}/discovery/fulldisplay?docid={{::$ctrl.docID}}&amp;vid={{::$ctrl.institutionCode}}:{{::library.view}}&amp;search_scope={{::library.scope}}&amp;tab={{::library.tab}}" target="_blank">{{::library.view}} <md-icon md-svg-icon="primo-ui:open-in-new" aria-label="Open in new tab"></md-icon></md-button></li></ul></div></div>',
	controller: ['$location', function ($location) {
		var vm = this;
		vm.$onInit = function () {
			vm.host = $location.host();
			vm.institutionCode = '01CACCL_LRCCD';
			vm.views = [
				{ view: 'arc', scope: 'arc_everything', tab: 'everything' },
				{ view: 'crc', scope: 'crc_everything', tab: 'everything' },
				{ view: 'flc', scope: 'flc_everything', tab: 'everything' },
				{ view: 'scc', scope: 'scc_everything', tab: 'everything' }
			];
			vm.docID = vm.parentCtrl.result.pnx.control.sourcerecordid[0];
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
			const vm = this;
			vm.$onInit = () => {
				const lrCrField = vm.parentCtrl.item.pnx.display.lds09; // this is always an array and will normally have one member but there could be more
				vm.creators = []; // we push creator objects into an array that the template iterates through
				if (lrCrField) {
					for (let field of lrCrField) { // for each array member we will split by delimiter and process
						const data = JSON.parse(field);
						vm.creatorType = 'creator'; // default if role is not defined
						if (data.role) { // get role
							vm.creatorType = data.role;
						}
						const creator = {};
						if ((((data.crName) && (data.crName !== 'z')) && (data.currency) && (data.currency !== 'z'))) {
							vm.badge = true; // set property that allows the badges to show
							creator.crName = data.crName;
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
}());

   
