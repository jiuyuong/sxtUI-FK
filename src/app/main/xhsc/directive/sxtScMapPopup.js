/**
 * Created by jiuyuong on 2016/4/13.
 */
(function(){
  'use strict';
  angular
    .module('app.xhsc')
    .directive('sxtScMapPopup',sxtScMapPopup);
  /** @ngInject */
  function sxtScMapPopup(mapPopupSerivce){
    return {
      restrict:'E',
      scope:{

      },
      templateUrl:'app/main/xhsc/directive/sxtScMapPopup.html',
      link:link
    }

    function link(scope,element,attr,ctrl){
      //实测值
      scope.$watch('value',function(){
        console.log('value',scope.value);
        /**
         * 添加测试值
         * @param {Array} values 测试值
         *        {
           *          ParentMeasurePointID:'',//所在测量组ID，如果没有为null
           *          MeasurePointID:'',
           *          AcceptanceIndexID:''
           *          MeasureValue:''//测量值
           *          DesignValue:''//设计值
           *          CalculatedValue:''//计算值
           *          Remark:'',//备注
           *          ExtendedField1:'',//扩展字段1
           *          ExtendedField2:'',//扩展字段2
           *          ExtendedField3:''//扩展字段3
           *        }
         * */
      });
      //指标
      scope.$watch('MeasureIndex',function(){
        console.log('MeasureIndex',scope.MeasureIndex);
        /**
	       * {
              AcceptanceIndexID:'',
              AcceptanceItemID:'',
              ParentAcceptanceIndexID:'',
              IndexName:'指标名称{0}',//指标名称
        **
               * Single：各自测量，SelectMaterial：选择材质测量）
               *
          IndexType:'Single',
          *
           * 1 原位
           * 2 非原位
           *
            MeasureMethod:'1',//实测方法
          *
           * 1 测量值
           * 2 与设计值对比
           * 3 测量组对比
           * 4 区域测量点对比
           * 5 上下楼层对比
            PassYieldComputeMode:'1',//计算合格率方式
          *
           * 合并标识
           * 0：不合并
           * 1：合并
           *
            GroupSign:1,//合并标识
            Weight:9.1,//权重
            SinglePassYield:true,//各自合格率
            SummaryPassYield:true,//汇总合格率
            children:array({
            AcceptanceIndexID:'',
            AcceptanceItemID:'',
            ParentAcceptanceIndexID:'',
            IndexName:'',//指标名称
            IndexType:'Single',
            MeasureMethod:'',//实测方法
            PassYieldComputeMode:'',//计算合格率方式
            GroupSign:1,//合并标识
            Weight:9.1,//权重
            SinglePassYield:true,//各自合格率
            SummaryPassYield:true//汇总合格率
          })
        }
         */

      });

      scope.apply = function(){
        var context = scope.context;
        scope.MeasureIndex = context.featureGroup.options.properties;
        scope.value = context.layer.getValue();
        scope.$apply();
      };
      scope.removeLayer = function(){
        var layer = scope.context.layer;
        layer._fg.removeLayer(layer);
      };
      scope.cancelEdit = function(){
        var layer = scope.context.layer;
        layer.editing && layer.editing.disable();
      };
      mapPopupSerivce.set('mapPopup',{
        el:element,
        scope:scope
      });
      scope.$on('$destroy',function(){
        mapPopupSerivce.remove('mapPopup');
      })
    }
  }
})();
