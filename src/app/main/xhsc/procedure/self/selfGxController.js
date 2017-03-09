/**
 * Created by shaoshun on 2017/3/1.
 */
/**
 * Created by shaoshun on 2017/3/1.
 */
/**
 * Created by emma on 2016/7/1.
 */
(function(){
  'use strict';

  angular
    .module('app.xhsc')
    .controller('selfGxController',selfGxController);

  /** @ngInject */
  function selfGxController($state,$rootScope,$scope,$mdDialog,$stateParams,remote,$q,utils,xhUtils){
    var vm = this;
    $rootScope.ok=true;
    vm.isOver=true;
    vm.selected=[];

    var ok = $rootScope.$on('ok',function(){
        if (!vm.selected.length){
          utils.alert("至少应该选择一个工序!");
          return;
        }
        var acceptanceitemIDs=vm.selected.map(function (o) {
          return o.AcceptanceItemID;
        }).join(",");
        $state.go("app.xhsc.gx.selfRegion",{
          acceptanceitemIDs:acceptanceitemIDs
        });
    });

    $scope.$on('$destroy', function () {
      ok()
      ok = null;
    })

  }
})();
