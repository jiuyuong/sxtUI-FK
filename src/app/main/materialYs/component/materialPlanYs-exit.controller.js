/**
 * Created by 陆科桦 on 2016/10/28.
 */
(function (angular,undefined) {
  'use strict';
  angular
    .module('app.xhsc')
    .component('materialYsExit',{
      templateUrl:'app/main/materialYs/component/materialPlanYs-Exit.html',
      controller:exit,
      controllerAs:'vm'
    });

  /** @ngInject */
  function exit($rootScope,$scope,$stateParams,api,utils){
    var vm = this;
    vm.data = {PlanId:$stateParams.id};
    vm.max = $stateParams.max;

    $scope.$watch('vm.data.ExitCount',function () {
      console.log();
      if(vm.data.ExitCount > vm.max){
        vm.data.ExitCount = parseFloat(vm.max);
      }
    });

    $scope.$on("$destroy",function(){
      sendCheckResult();
      sendCheckResult = null;
    });

    var sendCheckResult = $rootScope.$on('sendGxResult',function() {
      api.xhsc.materialPlan.PostExitInfo(vm.data).then(function (r) {
        utils.alert('提交成功!');
      })
    });
  }
})(angular,undefined);
