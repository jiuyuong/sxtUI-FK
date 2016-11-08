/**
 * Created by 陆科桦 on 2016/10/27.
 */

(function (angular,undefined) {
  'use strict';
  angular
    .module('app.xhsc')
    .component('materialYsInspectionReport',{
      templateUrl:'app/main/materialYs/component/inspection-report.html',
      controller:inspectionReport,
      controllerAs:'vm'
    });

  /** @ngInject */
  function inspectionReport($rootScope,$scope,api,utils,$stateParams,sxt){
    var vm = this;
    vm.data = {};
    vm.data.Id = $stateParams.id;
    vm.data.ReportTime = new Date().Format('yyyy年MM月dd日');
    vm.data.LabCheck = true;
    vm.reportImgs = [];

    $scope.$on("$destroy",function(){
      sendReportResult();
      sendReportResult = null;
    });

    var sendReportResult = $rootScope.$on('sendGxResult',function() {
      vm.data.BatchFile = vm.reportImgs;
      api.xhsc.materialPlan.PostReportInfo(vm.data).then(function (r) {
        utils.alert('提交成功!');
      })
    });




    //删除图片操作
    $rootScope.$on('delete',function (data,index) {
      $scope.$apply();
    });

    vm.addPhoto = function (type) {
      photo(type,vm.reportImgs,null);
      //拍照事件
      //xhUtils.photo().then(function (image) {
      // if(image){
      //   switch (type){
      //     case 1:
      //       photo(type,vm.vehicleImgs,image);
      //       break;
      //     case 2:
      //       photo(type,vm.goodsImgs,image);
      //       break;
      //     case 4:
      //       photo(type,vm.checkerImgs,image);
      //       break;
      //     default:
      //       photo(type,vm.certificateImgs,image);
      //   }
      // }

      //});
    };

    function photo(type,arr,image){
      var _id = sxt.uuid();
      arr.push({
        Id: sxt.uuid(),
        BatchId: $stateParams.id,
        OptionType:type,
        ApproachStage:8,
        ImageName:_id+".jpeg",
        ImageUrl:_id+".jpeg",
        //ImageByte: $scope.photos[0].ImageByte
      });
    }

  }
})(angular,undefined);
