(function () {
    "use strict";
    var app = angular.module('viewCustom', ['angularLoad']);
    app.component('prmSearchResultAvailabilityLineAfter', {
        bindings: {parentCtrl: '<'},
		template: '<lr-view-buttons parent-ctrl="$ctrl.parentCtrl"></lr-view-buttons>'
        });
    app.component('lrViewButtons', {
        bindings: {parentCtrl: '<'},
		template: '<div layout="row" layout-align="center" style="font-weight:bold;" ng-if="$ctrl.fullView();"><div layout="column" layout-align="center"><p>See this record in a college-level OneSearch view:</p></div><div layout="column"><ul layout="row"><li ng-repeat="view in $ctrl.views track by $index" style="list-style-type:none;"><md-button ng-href="https://caccl-lrccd.primo.exlibrisgroup.com/discovery/fulldisplay?docid={{$ctrl.docID}}&amp;vid=01CACCL_LRCCD:{{view}}&amp;search_scope={{view}}_everything" target="_blank">{{view}}</md-button></li></ul></div></div>',
	controller: function () {
		var vm = this;
		vm.$onInit = function () {
			vm.views = ['arc', 'crc', 'flc', 'scc'];
			vm.docID = vm.parentCtrl.$stateParams.docid;
			vm.fullView = function () {
				if ((vm.parentCtrl.isFullView === true) && (typeof (vm.parentCtrl.isOverlayFullView) === 'undefined')) {
					return true;
				}
			};
		};

	}
    });
	app.component('prmBriefResultAfter', {
		bindings: {parentCtrl: '<'},
		template: '<lr-local-creator-badge parent-ctrl="$ctrl.parentCtrl"></lr-local-creator-badge>'
	});
	app.component('lrLocalCreatorBadge', {
		bindings: {
			parentCtrl: '<'
		},
		template: '<div ng-if="$ctrl.showBadge();" layout="align" layout-align="start start" class="badges"><div class="badge-item"><div class="badge-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60.7 84.24" height="16"><defs></defs><path class="lr-logo-a" d="M60.7,5V17.24a32.15,32.15,0,0,1-13.63.9C40.46,17.06,34.37,13.59,27.7,13c-9.38-.88-18.43,3.95-27.7,5.1V5A5,5,0,0,1,5,0H55.69A5,5,0,0,1,60.7,5Z"/><path class="lr-logo-b" d="M60.7,26.25V53.37q-1.81-.15-3.63-.45C45.7,51.07,35.23,45.1,23.76,44c-8-.76-15.9.92-23.76,3V32.25c.9.14,1.8.25,2.72.33,17,1.44,33.18-9.45,50.12-7.85A45.67,45.67,0,0,1,60.7,26.25Z"/><path class="lr-logo-c" d="M55.72,70.5A30.32,30.32,0,0,1,1.15,62.13,53.84,53.84,0,0,1,16.85,61c11.47,1.08,21.94,7.06,33.31,8.91A49.86,49.86,0,0,0,55.72,70.5Z"/></svg></div><span class="badge-label">Los Rios {{$ctrl.creatorType}}</span></div></div>',
		controller: function () {
			var vm = this;
			vm.$onInit = function () {
				var lrCrField = vm.parentCtrl.item.pnx.display.lds09; // this is always an array and will normally have one member but there could be more
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
			};
		}
	});
}());

   
