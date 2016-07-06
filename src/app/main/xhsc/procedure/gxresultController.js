/**
 * Created by emma on 2016/5/31.
 */
(function(){
  'use strict';

  angular
    .module('app.xhsc')
    .controller('gxresultController',gxresultController);

  /** @ngInject*/
  function gxresultController($mdDialog,$stateParams,$state,$scope,remote,utils){
    var vm = this;
    vm.params = $stateParams;
    vm.gxname = $stateParams.acceptanceItemName;
    vm.bwname = $stateParams.name;
    var  InspectionId=$stateParams.InspectionId;
    vm.times = [,{
      time:'一天',
      val:1
    },{
      time:'二天',
      val:2
    },{
      time:'三天',
      val:3
    },{
      time:'四天',
      val:4
    },{
      time:'五天',
      val:5
    }]
    vm.persons = [{
      unit:'甲方',
      users:[{
        name:'张三',
        id:1
      },{
        name:'李四',
        id:2
      },{
        name:'王五',
        id:3
      }]
    },{
      unit:'监理',
      users:[{
        name:'张三1',
        id:4
      },{
        name:'李四1',
        id:5
      },{
        name:'王五1',
        id:6
      }]
    },{
      unit:'施工单位',
      users:[{
        name:'张三2',
        id:7
      },{
        name:'李四2',
        id:8
      },{
        name:'王五2',
        id:9
      }]
    }]
    //console.log('s',$stateParams)
    remote.Project.queryAllBulidings($stateParams.projectId).then(function(result){
      vm.allRelations = [];
      var f = result.data[0].Sections.find(function(t){
        return t.AreaID ===  $stateParams.areaId;
      })
      if(f){
        vm.allRelations.push(f);
      }
    });

    vm.params={
          InspectionID:InspectionId,
          Remarks:"",
          Day:7
    }

    vm.Isfail=true;
    vm.submitResult = function(){
      //console.log('time',vm.time)
      remote.Procedure.createZGReceipt(vm.params.InspectionID,vm.params.Remarks,7).then(function(r){
          if (r.data.ErrorCode==0){
            utils.alert("保存成功");
            vm.Isfail=false;
          }
      })
    }
  }
})();
