/**
 * Created by jiuyuong on 2016/3/30.
 */
(function(){
  'use strict';

  angular
    .module('app.xhsc')
    .directive('sxtScHzView', sxtScHzView);

  /** @Inject */
  function sxtScHzView($timeout,$window,remote,utils ){
    return {
      scope:{
        data:'=',
        procedure:'=',
        regionId:'='
      },
      link:link
    }
    function link(scope,element,attr,ctrl){
      var map,tile,fg;
      var install = function(){
        if(!scope.data)return;

        if(!map){
          map = new L.SXT.Project(element[0]);
        }
        $timeout(function(){
        remote.Project.getDrawingRelations(scope.regionId.substring(0,5)).then(function (result) {
          var imgId = result.data.find(function (item) {
            return item.AcceptanceItemID == scope.procedure && item.RegionId == scope.regionId;
          });
          if(!imgId){
            imgId = result.data.find(function (item) {
              return item.RegionId == scope.regionId;
            });
          }
          if (imgId) {
            remote.Project.getDrawing(imgId.DrawingID).then(function (result2) {
              if(!result2.data.DrawingContent){
                scope.ct && (scope.ct.loading = false);
                utils.alert('未找到图纸,请与管理员联系!(2)');
                return;
              }
              map.loadSvgXml(result2.data.DrawingContent, {
                filterLine: function (line) {
                  line.attrs.stroke = 'black';
                  line.options = line.options||{};
                  //line.options.color = 'black';

                  line.attrs['stroke-width'] = line.attrs['stroke-width']*6;
                },
                filterText: function (text) {
                  return false;
                }
              });
              map.center();
              scope.tooltip = '';
            })
          }
          else{
            if(!result.data.DrawingContent){
              utils.alert('未找到图纸,请与管理员联系!(1)');
              scope.ct && (scope.ct.loading = false);
              return;
            }
          }
        });
      }, 0);


        //if(scope.data.Region.DrawingContent) {
        //  $timeout(function () {
        //    map.loadSvgXml(scope.data.Region.DrawingContent, {
        //      filterLine: function (line) {
        //        line.attrs.stroke = 'black';
        //        line.options = line.options || {};
        //        //line.options.color = 'black';
        //
        //        line.attrs['stroke-width'] = line.attrs['stroke-width'] * 6;
        //      },
        //      filterText: function (text) {
        //        //return false;
        //      }
        //    });
        //    map.center();
        //  }, 0)
        //}


        fg = new L.SvFeatureGroup({
          onLoad:function(){
            var layer = this;

            scope.data.MeasurePoints.forEach(function (point) {
              var geo = JSON.parse(point.Geometry),
                v = scope.data.MeasureValues.find(function (value) {
                  return value.MeasurePointID == point.MeasurePointID;
                });
              if(v) {
                if(geo.geometry.type=='Stamp' && !v.MeasureValue && v.MeasureValue!==0)return;
                if(!v.ExtendedField1 && v.DesignValue){
                  v.ExtendedField1 = v.MeasureValue+','+v.DesignValue;
                }

                geo.options.MeasureValue = v.MeasureValue;
                geo.options.ExtendedField1 = v.ExtendedField1;
                geo.options.seq = v.MeasureValue;
                geo.options.customSeq = true;
                geo.options.PointChilden=point.PointChilden;
                switch(v.MeasureStatus) {
                  case 1:
                    geo.options.color = '#000000';
                    break;
                  case 2:
                    geo.options.color = '#eb7400';
                    break;
                }
                layer.addData(geo);
              }
            });

            layer.eachLayer(function (layer) {
              if(layer.options.MeasureValue || layer.options.MeasureValue===0) {
                //layer.updateValue({seq: ''+layer.options.MeasureValue});
                layer.on('mouseover',function (e) {
                  var  PointChilden=layer.options.PointChilden;
                  var zb='',jl="",xmb='',t;
                  if (angular.isArray(PointChilden)){
                    t=PointChilden.find(function(o){
                      return o.MemberType==0;
                    });
                    if (t){
                      zb= t.Value;
                    }

                    t=PointChilden.find(function(o){
                      return o.MemberType==1;
                    });
                    if (t){
                      jl= t.Value;
                    }

                  }
                  if(!layer.popup) {
                    var popArr=[];
                    popArr.push('<div style="padding:5px;">')
                    if (zb){
                      popArr.push( '<div class="row" style="margin-bottom: 10px;"><label style="display: block;width:50px;float: left;">总包：</label><p style="margin:0;margin-left: 50px;">'+(zb)+'</p></div>')
                    }
                    if (jl){
                      popArr.push( '<div class="row" style="margin-bottom: 10px;"><label style="display: block;width:50px;float: left;">监理：</label><p style="margin:0;margin-left: 50px;">'+(jl)+'</p></div>')
                    }


                    popArr.push('</div>')
                    layer.popup = L.popup({
                        closeButton: false
                      })
                      .setLatLng(layer._latlng)
                      .setContent(popArr.join(''))
                      .openOn(map._map);
                  }
                  else if(!layer.popup._isOpen){
                    layer.popup.openOn(map._map)
                  }
                });
                layer.on('mouseout',function () {
                  //map._map.closePopup(layer.popup);
                })
              }
            })
          }
        }).addTo(map._map);
      };
      $timeout(function(){
        scope.$watch('data',function(){
          install();
        });
      },500);
    }
  }


})();
