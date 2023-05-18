(function () {
    "use strict";
    var app = angular.module('viewCustom', ['angularLoad']);
    app.component('prmSearchResultAvailabilityLineAfter', {
        bindings: {parentCtrl: '<'},
		template: '<lr-view-buttons parent-ctrl="$ctrl.parentCtrl"></lr-view-buttons>'
        });
    app.component('lrViewButtons', {
        bindings: {parentCtrl: '<'},
		template: '<div layout="row" layout-align="center" style="font-weight:bold;" ng-if="$ctrl.fullView();"><div layout="column" layout-align="center"><p>See this record in a college-level OneSearch view:</p></div><div layout="column"><ul layout="row"><li ng-repeat="library in $ctrl.views" style="list-style-type:none;"><md-button external-link=""  ng-href="https://{{::$ctrl.host}}/discovery/fulldisplay?docid={{::$ctrl.docID}}&amp;vid={{::$ctrl.institutionCode}}:{{::library.view}}&amp;search_scope={{::library.scope}}&amp;tab={{::library.tab}}" target="_blank">{{::library.view}} <md-icon md-svg-icon="primo-ui:open-in-new" aria-label="Open in new tab"></md-icon></md-button></li></ul></div></div>',
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
			vm.fullView = function () {
				if (vm.parentCtrl.isFullView === true)  {
					return true;
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
						vm.creatorType = 'creator'; // default if role is not defined
						if ((data.role) && (data.role !== 'z')) { // get role
							vm.creatorType = data.role;
						}
						var creator = {};
						if ((((data.crName) && (data.crName !== 'z')) && (data.currency) && (data.currency !== 'z'))) {
							vm.badge = true; // set property that allows the badges to show
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
			};
		}
	});
}());

   
