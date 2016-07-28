/**
 * Created by jiuyuong on 2016/3/30.
 */
(function(){
  'use strict';

  angular
    .module('app.xhsc')
    .controller('scRegionController',scRegionController);

  /** @ngInject */
  function scRegionController($scope,$stateParams,sxt,$rootScope,xhUtils,remote,$timeout,$q,$state,$mdDialog,utils,db){
    var vm=this,
    projectId = $stateParams.projectId,
    acceptanceItemID=$stateParams.acceptanceItemID,
    acceptanceItemName = $stateParams.acceptanceItemName,
    area=$stateParams.area,
    assessmentID = $stateParams.assessmentID,
    isReport= vm.isReport=$stateParams.isReport;
    vm.maxRegion = $stateParams.maxRegion;
    $rootScope.title = $stateParams.acceptanceItemName;
    $rootScope.sendBt = false;
    vm.maxRegion = $stateParams.maxRegion;
    var _db=db('pack'+ assessmentID);
    vm.nums={
      qb:0,
      wtj:0,//未提交
      ytj:0//已检查
    }
    function  setNum(status,region){
      if((vm.maxRegion==8&&region.RegionType==8)||vm.maxRegion==16&&region.RegionType>=8){
        vm.nums.qb++;
        switch (status){
          case  0:
            vm.nums.wtj++;
            break;
          case  1:
            vm.nums.ytj++;
            break;
        }
      }
    }

    function  load(){
      vm.nums={
        qb:0,
        wtj:0,//未提交
        ytj:0//已检查
      }

      function initRegion(region){
        function ConvertClass(status){
          var style;
          switch (status){
            case 0:
              style="wait";
              break;
            case 1:
              style="dy";
              break;
            default:
              break;
          }
          return style;
        }
        function _init(region){
          if (region&&region.RegionType==8||region&&region.RegionType==16){
            if (isReport=='0'||isReport==0){
              region.style= ConvertClass(region.Status);
            }
            setNum(region.Status,region);
          }
          if (region&&region.Children.length){
            region.Children.forEach(function(r){
              _init(r);
            });
          }
        }
        _init(region);
      }

      vm.isRegionShow=function(region){
        if(vm.maxRegion>8){
          if (region.Children&&region.Children.length){
            var f= region.Children.find(function(o){
              if (!(isReport=='0'||isReport==0)){
                return region.Status===1;
              }
              return o.Status==vm.filterNum
            });
            if (f){
              return true;
            }
          }
        }
        return  true;//!(isReport=='0'||isReport==0)?region.Status===1: (vm.filterNum==-1||region.Status==vm.filterNum);
      }

      function  callBack(r){
        vm.loading = true;
        var project= r.data,_area;
        if (angular.isArray(project.Children)){
          _area=project.Children.find(function(k){
            return k.RegionID==area;
          });
          initRegion(_area);
          vm.houses =  [_area];
        }
      }

      if (isReport=='0'||isReport==0){
        _db.get("GetRegionTreeInfo").then(callBack);
      }else {
          remote.Project.GetRegionTreeInfo(projectId).then(callBack);
      }
    }

    load();

    vm.selected = function(r){
      var routeData={
        regionId: r.RegionID,
        RegionName: r.RegionName,
        name: r.FullRegionName,
        regionType: r.RegionType,
        db:assessmentID,
        measureItemID:acceptanceItemID,
        pname:acceptanceItemName
      }
      if (isReport=='0'||isReport==0){
        $state.go('app.xhsc.scsl._sc',routeData);
      }else {
        $state.go('app.xhsc.scsl.schztb',routeData);
      }
    }
    //总包点击事件

    vm.zk = function(item){
      item.show = !item.show;
    }
    vm.filterNum = -1;
    vm.filter = function(num){
      vm.filterNum = num;
    }
  }
})();
