/**
 * Created by lss on 2016/7/25.
 */
/**
 * Created by jiuyuong on 2016/3/30.
 */
(function(){
  'use strict';

  angular
    .module('app.xhsc')
    .directive('sxtScNew', sxtScNew);

  /** @Inject */
  function sxtScNew($timeout,mapPopupSerivce,db,sxt,xhUtils,pack){
    function now() {
      return new Date().toISOString();
    }
    return {
      scope:{
        db:'=', //现场评估id
        areaId:'=', //分期
        acceptanceItem:'=',//实测项
        measureIndexes:'=', //实测指标
        imageUrl:'=',//图纸id
        regionId:'=',//区域
        regionName:'=',//区域名称
        regionType:'=',//区域类型
        readonly:'=',//只读
        tooltip:'='
      },
      link:link
    }
    function link(scope,element,attr,ctrl){
      var map,tile,fg,toolbar,data,points,pk;

      scope.MeasurePoints=[{
        ExtendedField1:null,
        ExtendedField2:null,
        Geometry:'{"type":"Feature","properties":{"seq":20,"$id":"208cfb0506ce40e6976d160c2a9eb8c0"},"options":{"stroke":true,"color":"red","dashArray":"","lineCap":null,"lineJoin":null,"weight":1,"opacity":1,"fill":true,"fillColor":null,"fillOpacity":0.2,"clickable":true,"font-family":"Helvetica","font-style":"normal","font-weight":"bold","letter-spacing":"0.05em","stroke-width":2,"text-decoration":"none","multiSelect":false,"repeatMode":true},"geometry":{"type":"Stamp","coordinates":[0.4942626953125,0.468505859375]}}',
        MeasurePointID:"208cfb0506ce40e6976d160c2a9eb8c0",
        ParentMeasurePointID:null,
        Remark:null,
      }];
      scope.MeasureValues =[{
        AcceptanceIndexID
          :
          "b337a8b22b1145ae992a805a1e70a96f",
        AcceptanceItemID
          :
          "d7579fa6e26b4850967d105ac8ed6893",
        Children
          :
          Array[0],
        GroupSign
          :
          0,
        IconColor
          :
          "",
        IconImage
          :
          "",
        IndexName
          :
          "结构立面垂直度",
        IndexType
          :
          "Single",
        MeasureMethod
          :
          "1",
        OrderNo
          :
          1,
        ParentAcceptanceIndexID
          :
          null,
        ParentIndexName
          :
          null,
        PassYieldComputeMode
          :
          "1",
        QSCondition
          :
          "2",
        QSKey
          :
          "1",
        QSOtherValue
          :
          null,
        QSValue
          :
          "8",
        SinglePassYield
          :
          false,
        SummaryPassYield
          :
          false,
        CalculatedValue:3,
        DesignValue:null,
        ExtendedField1:null,
        ExtendedField2:null,
        ExtendedField3:null,
        MeasurPointName:null,
        MeasurPointType:null,
        MeasurePointID:"208cfb0506ce40e6976d160c2a9eb8c0",
        MeasureRecordID:"c6409dd994ca492e92d5d692e3e393ac",
        MeasureRole:null,
        MeasureStatus:1,
        MeasureValue :'',
        MeasureValueId:"0413c9dece6f43e2bd8f12c9d1649b01",
        ParentMeasureValueID:null,
        RecordType:null,
        RegionType:null,
        RelationID:null,
        Remark:null
      }];
      var packdb = db('pack'+'scsl00027');
      packdb.get('GetMeasureItemInfoByAreaID').then (function (r) {
        var find = r.data.find(function (it) {
          return it.AcceptanceItemID == scope.acceptanceItem;
        });
        if(!find){ //TODO:一般不可能找不到,找不到肯定后台有问题,这里可能需要提示并去掉
          find = r.data.find(function () {
            return true;
          })
        }
        var m=[];
        find.MeasureIndexList.forEach(function(item) {
          m.push(item);
        });
        scope.indexs = m;
        scope.indexs.forEach(function(t){
          t._id = sxt.uuid();//指标结构表
          t.checked = false;
        })
      },function(err){

      });
      var install = function(){
        //if(!scope.db || !scope.imageUrl || !scope.regionId || !scope.measureIndexes || !scope.measureIndexes.length)return;
        //if(!scope.db || !scope.imageUrl || !scope.regionId)return;

        if(!scope.measureIndexes) scope.measureIndexes = [];
        if(!pk)
          pk = pack.sc.up(scope.db);
        if(!data)
          data = pk.sc.db;
        if(!points)
          points = pk.point.db;


        if(!map){
          map = new L.SXT.Project(element[0]);
        }
        if(!tile || tile!=scope.regionId) {
          db('pack'+scope.db).get('GetDrawingByAreaID').then(function (data) {
            var fd = data.data.find(function (d) {
              return d.DrawingID == scope.imageUrl;
            });
            if(fd) {
              if(fd.DrawingContent) {
                scope.tooltip = '正在加载图形....';
                $timeout(function () {
                  map.loadSvgXml(fd.DrawingContent, {
                    filterLine: function (line) {
                      line.attrs.stroke = 'black';
                      line.options = line.options||{};
                      //line.options.color = 'black';

                      line.attrs['stroke-width'] = line.attrs['stroke-width']*6;
                    },
                    filterText: function (text) {
                      //return false;
                    }
                  });
                  map.center();
                  scope.tooltip = '';
                },0)
              }
            }
          });
          tile = scope.regionId;
        }

        if(fg)
          map._map.removeLayer(fg);

        if(toolbar)
          map._map.removeControl(toolbar);


        fg = new L.SvFeatureGroup({
          onLoad:function(){
            var layer = this;
            if(layer.loaded)return;
            layer.loaded = true;
            //measureIndexes
            if(!scope.measureIndexes.length){
              scope.MeasurePoints.forEach(function (point) {
                var geo = JSON.parse(point.Geometry),
                  v = scope.MeasureValues.find(function (value) {
                    return value.MeasurePointID == point.MeasurePointID;
                  });
                if(v) {
                  geo.options.ExtendedField1 = v.ExtendedField1;
                  geo.options.seq = geo.properties.seq;
                  geo.options.v = v;
                  geo.options.customSeq = true;
                  geo.options.color = 'red';
                  layer.addData(geo);
                }
              });
            }else{
              var list=[];
              scope.MeasureValues.forEach(function(r){
                scope.measureIndexes.forEach(function(_r){
                  if(_r.AcceptanceIndexID == r.AcceptanceIndexID){
                    list.push(r)
                  }else{
                    var find = _r.Children && _r.Children.forEach(function(_c){
                      return _c.AcceptanceIndexID == r.AcceptanceIndexID;
                    })
                    if(find){
                      list.push(r);
                    }
                  }
                })
              })
              scope.MeasurePoints.forEach(function(point){
                var geo = JSON.parse(point.Geometry),
                  v = list.find(function (value) {
                    return value.MeasurePointID == point.MeasurePointID;
                  });
                if(v) {
                  geo.options.ExtendedField1 = v.ExtendedField1;
                  geo.options.seq = geo.properties.seq;
                  geo.options.v = v;
                  geo.options.customSeq = true;
                  geo.options.color = 'red';
                  layer.addData(geo);
                }

              })
              scope.MeasureValues.forEach(function(r){
                fg.data.push(r);
              })
            }

            data.findAll(function(o){
              if(scope.measureIndexes.length){

              return o.DrawingID==scope.imageUrl
                && o.AcceptanceItemID==scope.acceptanceItem
                && scope.measureIndexes.length&&!!scope.measureIndexes.find(function(m){
                  return m.AcceptanceIndexID == o.AcceptanceIndexID
                    ||(m.Children && m.Children.find(function (m1) {
                      return m1.AcceptanceIndexID == o.AcceptanceIndexID
                    }));
                });

              }else{
                return o.DrawingID==scope.imageUrl
                  && o.AcceptanceItemID==scope.acceptanceItem
                  //&& scope.measureIndexes.length&&!!scope.measureIndexes.find(function(m){
                  //  return m.AcceptanceIndexID == o.AcceptanceIndexID
                  //    ||(m.Children && m.Children.find(function (m1) {
                  //      return m1.AcceptanceIndexID == o.AcceptanceIndexID
                  //    }));
                  //});
              }
            }).then(function(r){

              points.findAll(function(o){
                return r.rows.find(function(i){
                    if(i.MeasurePointID == o._id){
                      if(r.rows.find(function(i){
                          return i.MeasurePointID == o._id && i.CheckRegionID==scope.regionId && i.MeasureValue || i.MeasureValue===0
                        })) {
                        o.geometry.options.color = 'blue';
                      }
                      else{
                        o.geometry.options.color = 'red';
                      }
                      o.geometry.options.v = i;
                      o.CreateTime = moment(i.CreateTime).toDate();
                      return true;
                    }
                    return false;
                  })!=null;
              }).then(function(p){
                 fg.data = r.rows.filter(function (row) {
                  return row.CheckRegionID==scope.regionId;
                });
                scope.MeasureValues.forEach(function(r){
                  fg.data.push(r);
                })
                //fg.addLayer(p);
                p.rows.sort(function (p1,p2) {
                  return p1.CreateTime.getTime()-p2.CreateTime.getTime();
                });
                p.rows.forEach(function(geo){
                  layer.addData(geo.geometry);
                });
              })
            });

          },
          onUpdate:function(layer,isNew,group){
            //这里是修正用户点的位置,尽可能在最近点的同一水平或竖直线上
            if(layer instanceof L.Stamp){
              var neaser = null,
                p0 = layer.getLatLng();
              layer._fg.eachLayer(function (ly) {
                if(ly != layer && ly instanceof L.Stamp){
                  if(!neaser ||
                    Math.pow(neaser._latlng.lat-p0.lat,2)+Math.pow(neaser._latlng.lng-p0.lng,2)>
                    Math.pow(ly._latlng.lat-p0.lat,2)+Math.pow(ly._latlng.lat-p0.lat,2)){
                    neaser = ly;
                  }
                }
              });
              if(neaser){
                var p1 = neaser.getLatLng(),
                  point0 = neaser._map.latLngToLayerPoint(p0),
                  point1 = neaser._map.latLngToLayerPoint(p1),
                  radius = neaser._radius,
                  dx = Math.abs(point0.x - point1.x),
                  dy = Math.abs(point0.y - point1.y),
                  min = Math.min(dx,dy);
                if(min<radius){
                  if(dx<dy){
                    p0.lng = p1.lng;
                  }
                  else{
                    p0.lat = p1.lat;
                  }
                  layer.setLatLng(p0);
                }
              }
            }
            var point = layer.toGeoJSON();
            point = {
              _id:point.properties.$id,
              geometry:point
            };
            points.addOrUpdate(point);
            if(isNew || !fg.data.find(function (d) {
                return d.MeasurePointID == point._id;
              })){
              scope.measureIndexes.forEach(function (m) {
                var ms = [];
                if (m.Children && m.Children.length) {
                  m.Children.forEach(function (m1) {
                    ms.push(m1);
                  });
                }
                else {
                  ms.push(m);
                }
                ms.forEach(function (m) {
                  var v = {
                    _id: sxt.uuid(),
                    RecordType: 4,
                    CreateTime:now(),
                    RelationID: scope.db,
                    MeasurePointID: point._id,
                    DrawingID:scope.imageUrl,
                    CheckRegionID: scope.regionId,
                    RegionType: scope.regionType,
                    AcceptanceItemID: scope.acceptanceItem,
                    AcceptanceIndexID: m.AcceptanceIndexID
                  };
                  v.MeasureValueId = v._id;
                  data.addOrUpdate(v);
                  fg.data.push(v);
                });
              })
            }
            if(group){
              var groupId = group.getValue().$id,//添加或移出的groupId
                measureIndexs = xhUtils.findAll(scope.measureIndexes,function (m) {
                  return m.QSKey=='4';
                }),//需要区测量的指标
                values = xhUtils.findAll(fg.data,function (d) {
                  return d.MeasurePointID == point._id && !!measureIndexs.find(function (m) {
                      return m.AcceptanceIndexID==d.AcceptanceIndexID;
                    });
                });//相关操作记录值
              if(!point.geometry.properties.$groupId){//清除groupId
                values.forEach(function (v) {
                  v.ParentMeasureValueID = null;
                  data.addOrUpdate(v);
                })
              }
              else{//添加或更改groupId
                values.forEach(function (v) {
                  var parent = fg.data.find(function (m) {
                    return m.AcceptanceIndexID == v.AcceptanceIndexID && m.MeasurePointID==groupId;
                  });
                  v.ParentMeasureValueID = parent._id;
                  data.addOrUpdate(v);
                });
              }
            }
            //如果是画区域,而区域内没有点的话,默认生成9点或5个点
            if(isNew && layer instanceof L.AreaGroup){
              var p=null,b = layer.getBounds();
              fg.eachLayer(function (ly) {
                if(p===null && ly instanceof L.Stamp){
                  if(L.SvFeatureGroup.isMiddleNumber(b._southWest.lat, b._northEast.lat,ly._latlng.lat)
                    && L.SvFeatureGroup.isMiddleNumber(b._southWest.lng, b._northEast.lng,ly._latlng.lng)){
                    p = ly;
                  }
                }
              });
              if(p==null) {
                var b = layer.getBounds(),
                  x1 = b._northEast.lat,
                  y1 = b._northEast.lng,
                  x2 = b._southWest.lat,
                  y2 = b._southWest.lng;
                var ps = [], ps1 = [];
                var offsetX = Math.abs(x2 - x1) / 8,
                  minX = Math.min(x2, x1),
                  offsetY = Math.abs(y2 - y1) / 8,
                  minY = Math.min(y2, y2);
                for (var i = 1; i <= 3; i++) {
                  for (var j = 1; j <= 3; j++) {
                    ps.push([minX + offsetX * (i == 1 ? 1 : i == 2 ? 4 : 7), minY + offsetY * (j == 1 ? 1 : j == 2 ? 4 : 7)]);
                  }
                }
                ps1[0] = ps[0];
                ps1[1] = ps[1];
                ps1[2] = ps[2];
                ps1[3] = ps[5];
                ps1[4] = ps[8];
                ps1[5] = ps[7];
                ps1[6] = ps[6];
                ps1[7] = ps[3];
                ps1[8] = ps[4];
                if (!scope.measureIndexes.find(function (m) {
                    return m.QSKey == '4' && m.QSOtherValue == '9'
                  }) && scope.measureIndexes.find(function (m) {
                    return m.QSKey == '4' && m.QSOtherValue == '5';
                  })) {
                  ps1.splice(7, 1);
                  ps1.splice(5, 1);
                  ps1.splice(3, 1);
                  ps1.splice(1, 1);
                }
                ps1.forEach(function (p) {
                  fg.addLayer(new L.Stamp(p), false);
                });
              }
            }

          },
          onPopupClose:function (e) {
            var self = this;
            var edit = mapPopupSerivce.get('mapPopup'),
              scope = edit.scope;
            if(scope.data && scope.isSaveData!==false){
              scope.isSaveData = false;
              self.options.onUpdateData(scope.context,scope.data.updates,scope);
              if(scope.data.updates.find(function (m) {
                  return m.v &&(m.v.MeasureValue || m.v.MeasureValue===0);
                })){
                scope.context.layer.setStyle({
                  color:'blue'
                });
              }
              else{
                scope.context.layer.setStyle({
                  color:'red'
                });
              }
            }
          },
          onUpdateData:function(context,updates,editScope){
            updates.forEach(function(m){
              if(!m.v)return;
              if(!m.v._id){
                m.v = angular.extend({
                  _id:sxt.uuid(),
                  CreateTime:now(),
                  RelationID:scope.db,
                  RecordType:4,
                  DrawingID:scope.imageUrl,
                  MeasurePointID:editScope.context.layer._value.$id,
                  CheckRegionID:scope.regionId,
                  RegionType:scope.regionType,
                  AcceptanceItemID:scope.acceptanceItem,
                  AcceptanceIndexID:m.m.AcceptanceIndexID
                },m.v);
                m.v.MeasureValueId = m.v._id;
              }
              if(m.v.values){
                var minV=1000000,maxV=-1000000,vs=[];
                for(var k in m.v.values){
                  var v = m.v.values[k];
                  if(m.v.values.hasOwnProperty(k) && v) {
                    minV = Math.min(minV, v);
                    maxV = Math.max(maxV,v);
                    vs.push(v);
                  }
                };
                m.v.MeasureValue = maxV;
                m.v.DesignValue = minV;
                m.v.ExtendedField1 = vs.join(',');
              }

              data.addOrUpdate(m.v);
            });
          },
          onDelete:function (layer) {
            var id = layer.getValue().$id,
              values = xhUtils.findAll(fg.data,function (d) {
                return d.MeasurePointID == id && !!scope.measureIndexes.find(function (m) {
                    return m.AcceptanceIndexID==d.AcceptanceIndexID;
                  });
              });
            points.delete(id);
            values.forEach(function (v) {
              data.delete(v._id);
            })
          },
          onPopup:function(e){
            if(e.layer instanceof L.Stamp
              || e.layer instanceof L.AreaGroup
              || e.layer instanceof L.LineGroup)
              var edit = mapPopupSerivce.get('mapPopup');
            if(edit) {
              if(e.layer instanceof L.Stamp) {
                $timeout(function () {
                  var center = fg._map.getCenter();
                  fg._map.setView([center.lat,e.layer._latlng.lng]);
                },300);
              };
              edit.scope.context = e;
              if(!scope.measureIndexes.length){
                scope.indexs.forEach(function(m){
                  if(m.AcceptanceIndexID == e.layer.options.v.AcceptanceIndexID){
                    e.layer.options.v.QSKey = m.QSKey;
                  }else if(m.Children && m.Children.find(function (m1) {
                      return m1.AcceptanceIndexID == e.layer.options.v.AcceptanceIndexID
                    })){

                  }
                })
                edit.scope.data = {
                  measureIndexes:[e.layer.options.v],
                  regionId:scope.regionId,
                  regionType:scope.regionType,
                  acceptanceItem:scope.acceptanceItem,
                  values:fg.data
                };
              }else{
                edit.scope.data = {
                  measureIndexes:scope.measureIndexes,
                  regionId:scope.regionId,
                  regionType:scope.regionType,
                  acceptanceItem:scope.acceptanceItem,
                  values:fg.data
                };
              }
              edit.scope.readonly = scope.readonly;
              edit.scope.apply && edit.scope.apply();
              return edit.el[0];
            }
          }
        }).addTo(map._map);
        toolbar = new L.Control.Draw({
          featureGroup:fg,
          group:{
            lineGroup: false,
            areaGroup:scope.measureIndexes.length&&!!scope.measureIndexes.find(function (m) {
              return m.QSKey=='4'
            })
          }
        }).addTo(map._map);

      };
      $timeout(function(){
        scope.$watchCollection('measureIndexes',function(){
          install();
        });
        scope.$watch('regionId',function(){
          install();
        });
      },500);
    }
  }


})();
