/**
 * Created by zhangzhaoyong on 16/2/1.
 */
(function(){
  'use strict';

  angular
    .module('app.szgc')
    .controller('SzgcSettingsController',SzgcSettingsController);

  /** @ngInject */
  function SzgcSettingsController(profile,auth,api,$scope,utils){

    var vm = this;
    vm.profile = profile.data.data;
    vm.logout = function(){
      auth.logout();
    }
    //服务器上保存版本信息
    api.szgc.version().then(function (r) {
      vm.serverAppVersion = r.data.verInfo;
    });
    vm.networkState = api.getNetwork();
    $scope.$watch(function () {
      return vm.networkState
    },function () {
      api.setNetwork(vm.networkState);
    });
    vm.clearCache = function () {
      utils.confirm('确定清除所有缓存数据吗?').then(function (result) {
        console.log('r',result);
        api.clearDb(function (persent) {
          vm.cacheInfo = parseInt(persent*100)+'%';
        },function () {
          vm.cacheInfo = null;
          utils.alert('清除成功');
        },function () {
          vm.cacheInfo = null;
          utils.alert('清除失败');
        })
      })

    }
  }

})();
