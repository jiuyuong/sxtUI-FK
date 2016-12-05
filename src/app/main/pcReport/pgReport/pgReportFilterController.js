/**
 * Created by lss on 2016/9/14.
 */
/**
 * Created by lss on 2016/9/13.
 */
/**
 * Created by lss on 2016/9/8.
 */
/**
 * Created by emma on 2016/6/7.
 */
(function(){
  'use strict';

  angular
    .module('app.pcReport_pg')
    .controller('pgReportFilterController',pgReportFilterController);

  /**@ngInject*/
  function pgReportFilterController($scope,remote,$mdDialog,$state,$rootScope,$timeout){
    var vm = this;
    $scope.year="";
    $scope.quart="";
    vm.yearSource=[
      2015,2016,2017,2018,2019,2020
    ];
    var mobileDetect = new MobileDetect(window.navigator.userAgent);
    vm.isMobile=mobileDetect.mobile();
    vm.isiPad=mobileDetect.mobile()=="iPad";
    vm.yearQuart=[{
      "id": 1,
      "text": "第一季度"
    }, {
      "id": 2,
      "text": "第二季度"
    }, {
      "id": 3,
      "text": "第三季度"
    }, {
      "id": 4,
      "text": "第四季度"
    }];
    if ($rootScope.pgReportFilter_load){
      $scope.year=$rootScope.pgReportFilter_load.year;
      $scope.quart=$rootScope.pgReportFilter_load.quart;
    }
    $scope.pageing={
      page:1,
      pageSize:10,
      total:0
    }
    $scope.$watch("year",function(){
      if (vm.isMobile&&!vm.isiPad){
        return;
      }
      if ($scope.year){
        load();
      }
    });
    $scope.$watch("quart",function(){
      if (vm.isMobile&&!vm.isiPad){
        return;
      }
      if ($scope.quart){
        load();
      }
    });
    $scope.$watch("pageing.pageSize",function(){
      if ($scope.pageing.pageSize){
        load();
      }
    },true);
    vm.ck=function(item){
      $scope.year=item;
    }
    vm.ck_quart=function(item){
      $scope.quart=item.id;
    }
    function load(){
      remote.Assessment.GetAsssmentReportLst({
        Curpage:$scope.pageing.page-1,
        PageSize:$scope.pageing.pageSize,
        Year:$scope.year?$scope.year:0,
        Quarter:$scope.quart?$scope.quart:0
      }).then(function(r){
        $scope.pageing.total= r.data.TotalCount;
        if (r&& r.data){
          vm.source= r.data.Data;
        }
        $rootScope.pgReportFilter_load={
          year:$scope.year,
          quart:$scope.quart
        }
      }).catch(function(){
      });
    }

    vm.filter=function(){
      $state.go("app.pcReport_pg_default",{
        year:$scope.year,
        quart:$scope.quart
      });
    }
    vm.pageAction=function(title, page, pageSize, total){
      $scope.pageing.page=page;
      load();
    }
    vm.gohz=function(item){
      $state.go("app.pcReport_pg_pkresult",{
        year:item.Year,
        projectID:item.AssessmentProjectID,
        quarter:item.Quarter,
        assessmentStage:item.AssessmentStage
      })
    }
    vm.gosc=function(item){
      $state.go("app.pcReport_pg_scRegion",{
        year:item.Year,
        projectID:item.AssessmentProjectID,
        quarter:item.Quarter,
        assessmentStage:item.AssessmentStage
      })
    }
  }
})();
