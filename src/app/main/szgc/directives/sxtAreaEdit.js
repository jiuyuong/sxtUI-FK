
/**
 * Created by zhangzhaoyong on 16/2/16.
 */
(function(){
  'use strict';

  angular
    .module('app.szgc')
    .directive('sxtAreaEdit',sxtAreaEdit);

  /** @ngInject */
  function sxtAreaEdit($timeout,$http,$state,utils,msUtils,$mdDialog,auth){
    return {
      scope:{

      },
      link:link
    }

    function  link(scope,element,attr,ctrl){

      $timeout(function() {
        $http.get ('http://vkde.sxtsoft.com/api/ProjectEx/'+utils.id).then (function (result) {
          var project = result.data || {ProjectId:utils.id};

          var map = L.map (element[0], {
              crs: L.extend ({}, L.CRS, {
                projection: L.Projection.LonLat,
                transformation: new L.Transformation (1, 0, 1, 0),
                scale: function (e) {
                  return 512 * Math.pow (2, e);
                }
              }),
              center: [.23531902026005, .18],
              zoom: 1,
              minZoom: 0,
              maxZoom: 3,
              scrollWheelZoom: true,
              annotationBar: false,
              attributionControl: false
            }
          );
          L.tileLayer (
            //'http://vkde.sxtsoft.com/api/picMap/load/{z}_{x}_{y}.png?path=/upload/hx.jpg',
            'http://vkde.sxtsoft.com/upload/hx_tile_{z}_{x}_{y}.png',
            {
              attribution: false
            }).addTo (map);
          var drawnItems = new L.FeatureGroup ();
          map.addLayer (drawnItems);

          var cmenu,apiLayer = L.GeoJSON.api ({
            get: function (cb) {
              if (project.AreaRemark) {
                try {
                  var d = JSON.parse(project.AreaRemark);
                  cb(d);
                }
                catch (ex) {
                  cb();
                }
              }
              else {
                cb();
              }
            },
            post: function (data, cb) {
              project.AreaRemark = JSON.stringify(data);
              $http.put('http://vkde.sxtsoft.com/api/ProjectEx/'+project.ProjectId,project).then(function () {
                cb();
              });
            },
            click: function (layer, cb) {
              if (layer.editing && layer.editing._enabled) return;
              {
                if (layer._icon && msUtils.isMobile()) {
                  $state.go('app.szgc.zgdetail',{pid:layer.options.pid});
                }
                else {
                }
              }

            },
            contextMenu:function(e,cb){
              var layer = e.layer;
              if(layer instanceof L.Polygon || layer instanceof L.Rectangle) {
                if(cmenu!=null){
                  cmenu.hide();
                  cmenu = null;
                }
                var fn = function(data){
                  var p = layer.getBounds().getCenter();
                  var marker = layer.mk || (layer.mk = L.marker(p, {
                      icon: new ST.L.LabelIcon({
                        html: data.text,
                        color: layer.options.color
                      }),
                      saved:false,
                      draggable: true,       // Allow label dragging...?
                      zIndexOffset: 1000     // Make appear above other map features
                    }).on('dragend',function(e){
                      var p = this.getLatLng();
                      layer.options.areaLabel.lat = p.lat;
                      layer.options.areaLabel.lng = p.lng;
                      cb();
                    }).addTo(layer._map));
                  marker.options.icon.setText(data.text);
                  layer.options.areaLabel = data;
                  layer.options.areaLabel.lat = p.lat;
                  layer.options.areaLabel.lng = p.lng;
                  cb();
                }
                cmenu = new ST.L.ContextMenu (e, {
                  contextmenuWidth: 150,
                  actions: [
                    {
                      text: '客厅',
                      callback: function () {
                        fn({
                          text: '客厅',
                          id:1
                        })
                      }
                    },
                    {
                      text: '主卧室',
                      callback: function () {
                        fn({
                          text: '主卧室',
                          id:2
                        })
                      }
                    },
                    {
                      text: '次卧室',
                      callback: function () {
                        fn({
                          text: '次卧室',
                          id:3
                        })
                      }
                    },
                    {
                      text: '厨房',
                      callback: function () {
                        fn({
                          text: '厨房',
                          id:4
                        })
                      }
                    },
                    {
                      text: '主卫',
                      callback: function () {
                        fn({
                          text: '主卫',
                          id:5
                        })
                      }
                    },
                    {
                      text: '卫生间',
                      callback: function () {
                        fn({
                          text: '卫生间',
                          id:6
                        })
                      }
                    },
                    {
                      text: '餐厅',
                      callback: function () {
                        fn({
                          text: '餐厅',
                          id:7
                        })
                      }
                    }
                  ]
                });
                cmenu.show ();
              }
            },
            onAdd: function (layer,cb) {
              if(layer.options.icon){
                layer.options.pid = msUtils.guidGenerator();
                layer.options.date = moment().format('YYYY-MM-DD HH:mm');
                layer.options.user = auth.current().Username;

                $mdDialog.show({
                  locals:{
                    options:layer.options
                  },
                  controller: function($scope, $mdDialog,options,$cordovaCamera) {
                    $scope.photo = function ($event) {
                      if ($event) {
                        $event.preventDefault ();
                        $event.stopPropagation ();
                      }
                      $cordovaCamera.getPicture ({
                        quality: 50,
                        destinationType: 0,
                        sourceType: 1,
                        allowEdit: true,
                        encodingType: 0,
                        saveToPhotoAlbum: false,
                        correctOrientation: true
                      }).then (function (imageData) {

                        if (imageData) {
                          //var image = document.createElement ('img');
                          //image.src = "data:image/jpeg;base64," + imageData;
                          //element.append (image);
                          imageData = imageData.replace('data:image/jpeg;base64,','').replace('data:image/png;base64,','')
                          $scope.title = '正在上传图片';
                          $http.post ('http://vkde.sxtsoft.com/api/Files/' + layer.options.pid + '/base64', {Url: imageData}).then (function (result) {
                            $scope.images.push (result.data.Files[0]);
                            $scope.title = null;
                            //utils.alert('上传成功');
                          })
                        }
                      }, function (err) {

                      });
                    }

                    $scope.images = [];
                    $scope.options = options;
                    $scope.hide = function () {
                      $mdDialog.hide ();
                    };

                    $scope.cancel = function () {
                      $mdDialog.cancel ();
                    };

                    $scope.answer = function () {
                      cb ();
                      $mdDialog.hide ();
                      $state.go ('app.szgc.tzg', {pid: options.pid})
                    };
                    $scope.photo ();
                  },
                    template: '<md-dialog aria-label="拍照"  ng-cloak><form><md-toolbar style="background:#1f6db4"><div class="md-toolbar-tools"><h2>{{title || \'拍照\'}}</h2></div></md-toolbar>\
                  <md-dialog-content><div class="md-dialog-content" >\
                <img width="120" class="cimages" ng-repeat="img in images" ng-src="{{img.Url|fileurl}}" /></div></md-dialog-content>\
                <md-dialog-actions layout="row" style="border-top:solid 2px #1f6db4">\
                  <md-button  class="md-raised" ng-click="cancel()" >取消</md-button>\
                <span flex></span>\
                <md-button  class="md-raised" ng-click="photo($event)" >\
                    添加 \
                  </md-button>\
                <md-button  class="md-raised" ng-click="answer()"  md-autofocus style="margin-right:20px;">发送整改通知</md-button>\
                  </md-dialog-actions>\
                  </form>\
                  </md-dialog>',
                    parent: angular.element(document.body),
                    clickOutsideToClose:true,
                    fullscreen: true
                  })
                  .then(function(answer) {

                  }, function() {

                  });
                return false;
              }
            }
          }).addTo (map);


          var photoMaker = L.Icon.extend ({
            options: {
              shadowUrl: null,
              iconAnchor: [15, 15],
              iconSize: [30, 30],
              iconUrl: 'assets/leaflet/css/images/photo.png'
            }
          });
          var drawControl = new L.Control.Draw ({
            draw: {
              polygon: {
                allowIntersection: false,
                drawError: {
                  color: '#b00b00',
                  timeout: 1000
                },
                shapeOptions: {
                  color: '#ff0000'
                },
                showArea: false
              },
              rectangle: true,
              polyline: false,
              circle: false,
              marker: {
                icon: new photoMaker ()
              }
            },
            edit: {
              edit: true,
              remove: true,
              featureGroup: apiLayer
            }
          });
          map.addControl (drawControl);
        });
      }, 500);
    }
  }


})();
