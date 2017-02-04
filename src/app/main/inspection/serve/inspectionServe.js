/**
 * Created by shaoshun on 2017/1/21.
 */
/**
 * Created by shaoshun on 2017/1/19.
 */
/**
 * Created by leshuangshuang on 16/4/15.
 */
(function() {
  'use strict';

  angular
    .module('app.inspection')
    .factory('inspectionServe', inspectionServe);

  function inspectionServe($mdDialog, $q,$window,$http,api,ys_file) {
    var  serve={
        downloadDeliveryTask:function (item) {
          var  task=[];
          task.push(function () {
            return api.inspection.estate.getDelivery(item.delivery_id).then(function (r) {
              if (r.data){
                r.data.downloaded=true;
              }
              return r.data;
            }).then(function (m) {
              task.push(function () {
                return  $q(function (resove,reject) {
                  if (m.room&&m.room.layout&&m.room.layout.drawing_url){
                    return ys_file.downUniqueFile(m.room.room_id,m.room.layout.drawing_url).then(function () {
                      resove();
                    });
                  }else {
                    resove();
                  }
                })
              });
            })
          })
          return task;
        },
        markerImgOption:{
          all:function (marker) {
            var imgs=[];
            if (marker && marker.tag) {
              var record =marker.tag;
              if (record.pictures) {
                imgs = record.pictures.split(",");
              }else {
                imgs=[];
              }
            }
            return imgs;
          },
          clear:function (marker,isUpload) {
            if (marker && marker.tag) {
              var record = scope.marker.tag;
              record.pictures="";
              if (!isUpload){
                api.inspection.estate.postRepair_tasks_off(record.pictures)
              }
            }
          },
          add:function (id,marker,isUpload) {
            var imgs=this.all(marker);
            if (imgs&&id){
              imgs.push(id);
              marker.tag.pictures=imgs.join(",")
              if (!isUpload){
                api.inspection.estate.postRepair_tasks_off(marker.tag)
              }
            }
          },
          remove:function (id,marker,isUpload) {
            var imgs=this.all(marker);
            if (imgs&&id){
              var index=imgs.indexOf(id);
              if (index>-1){
                imgs.splice(index,1);
              }
              marker.tag.pictures=imgs.join(",");
              if (!isUpload){
                api.inspection.estate.postRepair_tasks_off(marker.tag)
              }
            }
          }
        }
    }
    return serve;
  }
})();
