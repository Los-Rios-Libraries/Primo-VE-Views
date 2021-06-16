(function () {
    "use strict";
    var app = angular.module('viewCustom', ['angularLoad']);
    app.component('prmBackToSearchResultsButtonAfter', {
        bindings: {parentCtrl: '<'},
		template: '<lr-view-buttons parent-ctrl="$ctrl.parentCtrl"></lr-view-buttons>'
        });
    app.component('lrViewButtons', {
        bindings: {parentCtrl: '<'},
		template: '<div layout="row" layout-align="center" style="font-weight:bold;"><div layout="column" layout-align="center"><p>See this record in a college-level view:</p></div><div layout="column"><ul layout="row"><li ng-repeat="view in $ctrl.views track by $index" style="list-style-type:none;"><md-button ng-href="https://caccl-lrccd.primo.exlibrisgroup.com/discovery/fulldisplay?docid=alma991001986914805325&amp;vid=01CACCL_LRCCD:{{view}}" target="_blank">{{view}}</md-button></li></ul></div></div>',
        controller: function() {
            var vm = this;
            vm.views = ['arc', 'crc', 'flc', 'scc'];
            vm.docID = vm.parentCtrl.$stateParams.docid;
        }
        });
}());

   
