/**
 * Created by emma on 2016/4/29.
 */
(function(){
  'use strict';

  angular
    .module('app.xhsc')
    .controller('evaluatelistPcController',evaluatelistPcController);

  /** @ngInject*/
  function evaluatelistPcController($scope,$stateParams,xhUtils,remote,$mdDialog,utils){
    var vm = this;
    vm.RegionName = $stateParams.RegionName;
    var params={
      AssessmentID:$stateParams.AssessmentID,
      RegionID:$stateParams.RegionID,
      RegionName:$stateParams.RegionName,
      AssessmentTypeID:$stateParams.AssessmentTypeID
    };
    remote.Assessment.query().then(function (m) {
      remote.Assessment.queryResult(params.AssessmentID).then(function (r) {
        var ass = m.data.find(function (item) {
          return item.AssessmentID == params.AssessmentID
        });
        if(ass){
          onQueryBase(ass,r.data);
        }
      })

    });


    function onQueryBase(item,result) {
      vm.items = {
        AssessmentClassifys:[]
      };
      vm.caches = {
        AssessmentClassifys:[]
      }
      item.AssessmentTypes.forEach(function (t) {
        t.AssessmentClassifys.forEach(function (cls) {
          vm.items.AssessmentClassifys.push({
            AssessmentClassificationName:cls.AssessmentClassificationName
          });
          vm.caches.AssessmentClassifys.push(cls);
        });
      });
      fillRegion(vm.caches,result);
      $scope.$watch('vm.selectedIndex',function () {
        if(vm.selectedIndex){
          var k = vm.items.AssessmentClassifys[vm.selectedIndex-1];
          if(k.AssessmentClassifys==null){
            k.AssessmentClassifys = vm.caches.AssessmentClassifys[vm.selectedIndex-1].AssessmentClassifys;
            k.level = getEvels(k,1);
          }
        }
      })

    }

    function fillRegion(k,result) {
      if(k.AssessmentItems){
        k.AssessmentItems.forEach(function (item) {
          var resultItem = result.find(function (r) {
            return r.AssessmentCheckItemID == item.AssessmentCheckItemID;
          });
          if(resultItem){
            item.TotalScore = resultItem.TotalScore;
            item.ModifyScore = resultItem.ModifyScore;

            if(!item.ModifyScore && item.ModifyScore!==0)
              item.ModifyScore = item.TotalScore;


            item.DelScore =  (item.ModifyScore===0 ||  item.ModifyScore)?item.Weight-item.ModifyScore:'';
            item.regions = resultItem.AssessmentRegionItemResults;
          }
        });
      }
      if(k.AssessmentClassifys){
        k.AssessmentClassifys.forEach(function (c) {
          fillRegion(c,result);
        })
      }
    }




    vm.getW = function (level,t) {
      if(level==1){
        return 25.0/t;
      }
      else{
        return 25.0/t /(100 - vm.getW(level-1,t))*100;
      }
    }

    function getEvels(item,level) {
      if(item.AssessmentClassifys && item.AssessmentClassifys.length){
        var levels = [],max=0;
        item.AssessmentClassifys.forEach(function (item) {
          levels.push(getEvels(item,level));
        });
        levels.forEach(function (l) {
            if(max<l)
              max = l;
        });
        return max;
      }
      return level+1;
    }

    vm.quesDetail = function(item) {
      var images=[];
      item.Images.forEach(function (img) {
        images.push({
          url:sxt.app.api+img.ImageUrl,
          alt:item.ProblemDescription
        });
      })
      if(images.length) {
        xhUtils.playPhoto(images);
      }
    }

    vm.deleteScoreItem = function (q) {
      console.log('q',q)
    }
    vm.changeScore = function (item,$event) {
      $mdDialog.show($mdDialog.prompt({
        title:'修改分值',
        textContent:'请输入新值，作为最终此项目的扣分值。０分为不扣分',
        placeholder:item.DelScore,
        ok:'确定',
        cancel:'取消',
        targetEvent:$event
      })).then(function (result) {
        if(result){
          var r = parseInt(result);
          if(!isNaN(result)){
            if(item.Weight<result || result<0){
              utils.alert('输入的值应该介于0 与 '+item.Weight + ' 之间');
              return;
            }


            remote.Assessment.modifyScore({
              AssessmentID:params.AssessmentID,
              AssessmentCheckItemID:item.AssessmentCheckItemID,
              ModifyScore:item.Weight -r
            }).then(function () {
              item.DelScore = r;
              item.ModifyScore = item.Weight - item.DelScore;
            }).catch(function () {
              utils.alert('失败：服务器返回错误');
            })
          }
          else{
            utils.alert('应该输入半角数字');
          }
        }
        console.log(result);
      })
    }
  }
})();
