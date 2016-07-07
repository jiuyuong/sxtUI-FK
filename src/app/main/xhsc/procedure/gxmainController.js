/**
 * Created by emma on 2016/6/21.
 */
(function(){
  'use strict';

  angular
    .module('app.xhsc')
    .controller('gxmainController',gxmainController);

  /**@ngInject*/
  function gxmainController(remote,xhUtils,$rootScope,utils,api,$q,$state){
    var vm = this;


    remote.Project.getMap().then(function(result){
      var w = [];
      result.data.forEach(function (item) {
        w.push(api.setting('project:'+item.ProjectID));
      });
      $q.all(w).then(function (rs) {
        var ix=0;
        result.data.forEach(function (item) {
          item.isOffline = rs[ix++]?true:false;
        });
        vm.projects = result.data;
      });
    });

    vm.download = function(item){
      item.isDown = true;
      var ix=1,len = 8;
      item.progress = ix/len;
      api.task([function () {
        return remote.Project.getDrawings(item.ProjectID)
      },function () {
        return remote.Project.getDrawingRelations(item.ProjectID);
      },function () {
        return remote.Project.queryAllBulidings(item.ProjectID);
      },function () {
        return remote.Procedure.getRegionStatus(item.ProjectID);
      },function () {
        return remote.Procedure.queryProcedure();
      },function(){
        return remote.Project.getInspectionList(item.ProjectID);
      },function () {
        return api.setting('project:'+item.ProjectID,{ProjectID:item.ProjectID,date:new Date()});
      }])(function (persent) {
        item.progress = persent*100;
      },function () {
        item.progress = 100;
        item.isOffline = true;
        //setGxList([item]);
      },function () {
        item.isDown = false;
        utils.alert('下载失败,请检查网络');
      });
    }

    remote.Procedure.getInspections(1).then(function(r){
        vm.Inspections= r.data;
    });

    remote.Procedure.getZGlist(15).then(function (r) {
      vm.zglist = r.data;
    })

    vm.ys = function(item){
      $state.go('app.xhsc.gx.gxtest',{acceptanceItemID:item.AcceptanceItemID,acceptanceItemName:item.AcceptanceItemName,name:item.Children[0].newName,
        projectId:item.Children[0].projectId,areaId:item.Children[0].AreaID,InspectionId:item.InspectionId})
    }

    vm.fy = function(r){
      $state.go('app.xhsc.gx.gxzg',{Role:'jl',InspectionID: r.InspectionID,AcceptanceItemID: r.AcceptanceItemID,RectificationID: r.RectificationID})
    }


    vm.zg = function(r){
      $state.go('app.xhsc.gx.gxzg',{Role:'zb',InspectionID: r.InspectionID,AcceptanceItemID: r.AcceptanceItemID,RectificationID: r.RectificationID});
    }
  }
})();
