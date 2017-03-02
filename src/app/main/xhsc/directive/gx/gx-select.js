/**
 * Created by shaoshun on 2017/3/1.
 */
/**
 * Created by lss on 2016/10/30.
 */
/**
 * Created by lss on 2016/7/25.
 */
/**
 * Created by jiuyuong on 2016/4/13.
 */
(function(){
  'use strict';
  angular
    .module('app.xhsc')
    .directive('gxSelet',gxSelet);
  /** @ngInject */
  function gxSelet(remote){
    return {
      restrict:'E',
      scope:{
        model:'=',
        selected:'='
      },
      templateUrl:'app/main/xhsc/directive/gx/gx-select.html',
      link:link
    }
    function link(scope,element,attr,ctrl){
      switch (scope.model){
        case "single":
          scope.model="single";
          scope.singleVal=null;
          break;
        case "multil":
          scope.model="multil"
      }
      remote.Procedure.queryProcedure().then(function(result){
        scope.data=result.data;
        scope.data.sort(function(a,b){
          return a.SpecialtyName.localeCompare(b.SpecialtyName);
        });
        scope.show=true;
      })
      scope.showTab=function(item){
        if (!item.SpecialtyChildren||!item.SpecialtyChildren.length){
          return false;
        }
        var gx= item.SpecialtyChildren;
        for (var  i=0;i<gx.length;i++){
          if (gx[i].WPAcceptanceList&&gx[i].WPAcceptanceList.length){
            return true;
          }
        }
        return false;
      }
      scope.selected=[];
      scope.checked=function (item) {
         if(!item.checked){
           if (!scope.selected.find(function (o) {
               return o.AcceptanceItemID==item.AcceptanceItemID;
             })){
             scope.selected.push(item);
           }
         }else {
           var obj= scope.selected.find(function (o) {
             return o.AcceptanceItemID==item.AcceptanceItemID;
           })
           if (obj!=null){
             var  index=scope.selected.indexOf(obj);

             scope.selected.splice (index,1);
           }
         }
      }

    }
  }
})();
