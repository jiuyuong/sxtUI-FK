/**
 * Created by shaoshun on 2016/11/29.
 */
/**
 * Created by jiuyuong on 2016/6/22.
 */
(function () {
  angular
    .module('app.xhsc')
    .directive('sxtWeekRecheck',sxtWeekRecheck);
  /** @ngInject */
  function sxtWeekRecheck($timeout,remote,mapPopupSerivce,sxt,utils,$q,$window,xhUtils) {
    return {
      scope:{
        item:'=sxtSafeRecheck',
        sxtMapShow:'=',
        regionId:'=',
        inspectionId:'=',
        disableInspect:'=',
        disableDrag:'=',
        ct:'='
      },
      link:link
    };

    function link(scope,element,attr,ctrl) {
      scope.ct && (scope.ct.loading = true);
      var map,fg;

      function convert(status) {
        switch (status){
          case 8:
            return 1;
          case 16:
          case 4:
            return 8;
        }
        return status;
      }

      var install =function () {
        scope.ct && (scope.ct.loading = true);
        if (!map) {
          map = new $window.L.glProject(element[0], {
            map: {
              zoomControl: false
            }
          });
          fg = $window.mapboxgl.Plan({
            disableInspect:scope.disableInspect,
            disableDrag:scope.disableDrag,
            onChangeMode:function (mode,op,cb) {
              if(mode && !op){
                scope.ct && scope.ct.cancelMode && scope.ct.cancelMode();
                scope.item = {
                  ProblemID:null,
                  ProblemSortName:'✔',//'',
                  ProblemDescription:''
                };
              }
              cb();
            },
            onLoad: function (cb) {
              $("#inspect").css("display","none");
              $q.all([
                remote.safe.weekPointQuery.cfgSet({
                  filter:function (item,inspectionId) {
                    return  item.AreaID==scope.regionId&&item.InspectionExtendID==inspectionId;
                  }
                })(scope.inspectionId),
                remote.safe.getSafePointGeo()
              ]).then(function (res) {
                var fs = [];
                fg.data = res[0].data;
                res[0].data.forEach(function (item) {
                  var p = res[1].data.find(function (pt) {
                    return pt.MeasurePointID == item.PositionID;
                  });
                  if (p && p.Geometry) {
                    var geo = $window.JSON.parse(p.Geometry);
                    if(geo && geo.geometry) {
                      if (geo.geometry.type == 'Stamp')
                        geo.geometry.type = 'Point';
                      geo.properties.Status = item.Status;
                      geo.properties.v = item;
                      geo.properties.seq = item.ProblemSortName;
                      fs.push(geo);
                    }
                  }
                })
                fg.addData(fs, false);
                cb();
                fs.forEach(function (t) {
                  fg.updateStatus(t.properties.v.PositionID,convert(t.properties.Status))
                })
                scope.ct && (scope.ct.loading = false);
              })

            },
            onUpdate: function (layer, isNew, group,cb) {
            },
            onPopup: function (layer,cb) {
              var edit = mapPopupSerivce.get('weekRecheckPopup');
              if (edit) {
                scope.sxtMapShow = true;
                edit.scope.context = fg;
                edit.scope.data = {
                  value: layer.properties.v
                }
                edit.scope.apply && edit.scope.apply();
              }
            }
          });
          $timeout(function () {
            remote.safe.getDrawingRelate.cfgSet({
              offline: true
            })("WeekInspects",scope.regionId).then(function (result) {
              var imgId = result.data.find(function (item) {
                return item.Type==7&& item.RegionId == scope.regionId;
              });
              if(!imgId){
                imgId = result.data.find(function (item) {
                  return item.Type==13&&item.RegionId == scope.regionId;
                });
              }
              if (imgId) {
                remote.Project.getDrawing(imgId.DrawingID).then(function (result2) {
                  if(!result2.data.DrawingContent){
                    scope.ct && (scope.ct.loading = false);
                    utils.alert('未找到图纸,请与管理员联系!(2)');
                    return;
                  }
                  map.loadSvgXml(result2.data.DrawingContent);
                  map.map.addControl(fg);
                  var btn = $('<div class="mapboxgl-ctrl-group mapboxgl-ctrl"><button class="mapboxgl-ctrl-icon links"  title="其它图纸"></button></div>');
                  btn.click(function () {
                    var mapList = [];
                    result.data.forEach(function (item) {
                      if(item.RegionId == scope.regionId && item.DrawingID!=imgId.DrawingID && !mapList.find(function (f) {
                          return f.DrawingID==item.DrawingID
                        })){
                        mapList.push(item);
                      }
                    });

                    xhUtils.openLinks(mapList);
                  });
                  element.find('.mapboxgl-ctrl-bottom-left').append(btn);
                  //scope.ct && (scope.ct.loading = false);
                })
              }
              else {
                scope.ct && (scope.ct.loading = false);
                utils.alert('未找到图纸,请与管理员联系!(1)')
                return;
              }
            });
          }, 0);
        }
      };
      $timeout(function () {
        scope.$watch('regionId', function () {
          if(scope.regionId) {
            if(map){
              map.remove();
              map = null;
            }
            install();
          }
        });
        scope.$watch('item',function () {
          if(fg) {
            if (scope.item) {
              fg.changeMode('inspect',scope.item);
            }
            else {
              fg.changeMode();
            }
          }
        })
      }, 500);
      scope.$on('destroy',function () {
        if(map){
          map.remove();
          map = null;
        }
      })
    }
  }
})();
