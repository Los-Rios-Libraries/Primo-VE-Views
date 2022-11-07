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
}());

   
