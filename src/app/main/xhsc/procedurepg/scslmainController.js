/**
 * Created by emma on 2016/6/21.
 */
(function(){
  'use strict';
  angular
    .module('app.xhsc')
    .controller('scslmainController',scslmainController);
  function scslmainController($mdDialog,db,scRemote,sxt,$rootScope,$scope,scPack,utils,$q,api,$state){
    var vm = this;
    var remote=  scRemote;
    var pack=scPack;
    var xcpk = db('scxcpk'),dbpics=db('pics');


    remote.Procedure.authorityByUserId().then(function(res){
      if (res&&res.data&&res.data.length){
        vm.role=res.data[0].MemberType;
      }else {
        vm.role=0;
      }
      //业务数据包
      xcpk.get('xcpk').then(function (result) {
        vm.data = result;
        queryOnline();
      }).catch(function (err) {
        vm.data = {
          _id:'xcpk',
          rows:[]
        };
        queryOnline();
      });
    }).catch(function(r){
    });


    //项目包
    function projectTask(projectId) {
      return [
        function (tasks) {
          return $q(function(resolve,reject) {
            var arr=[
              remote.Project.getDrawingRelations(projectId),
              dbpics.findAll()
            ];
            $q.all(arr).then(function(res){
                var result=res[0],offPics=res[1].rows;
                var pics = [];
                result.data.forEach(function (item) {
                  if (pics.indexOf(item.DrawingID) == -1&&!offPics.find(function(r){
                      return r._id==item.DrawingID;
                    })) {
                    pics.push(item.DrawingID);
                  }
                });
                pics.forEach(function (drawingID) {
                  tasks.push(function () {
                    return remote.Project.getDrawing(drawingID).then(function(){
                      dbpics.addOrUpdate({
                        _id:drawingID
                      })
                    });
                  })
                });
                resolve(result);
            }).catch(function(){
              reject();
            });
          })
        },
        function () {
          return remote.Project.queryAllBulidings(projectId);
        }
      ]
    }

    vm.download=function(item,isReflsh){
      vm.current=item;
      //下载成功回掉
      function callBack(){
        var ix = vm.onlines.indexOf(item);
        if (ix != -1)
          vm.onlines.splice(ix, 1);
        ix = vm.offlines.indexOf(item);
        if(ix!=-1){
          vm.offlines.splice(ix, 1);
        }
        var it1 = vm.data.rows.find(function (it) {
          return it.ProjectID==item.ProjectID;
        }),ix=it1?vm.data.rows.indexOf(it1):-1;
        if(ix!=-1){
          vm.data.rows.splice(ix, 1);
        }
        delete item.pack;
        remote.Project.getMap().then(function (result) {
          var project=result.data.find(function(r){
            return r.ProjectID== item.ProjectID;
          });
          project.AssessmentID='scsl'+ project.ProjectID+'_'+vm.role;
          project.AssessmentSubject= project.ProjectName;
          var fd = vm.data.rows.find(function (a) {
            return a.ProjectID ==project.ProjectID;
          }),ix=fd?vm.data.rows.indexOf(fd):-1;
          if(ix==-1) {
            vm.data.rows.push(project);
            vm.offlines.push(project);
          }
          else{
            vm.data.rows[ix] = project;
          }
          xcpk.addOrUpdate(vm.data).then(function () {
            item.downloading = false;
            utils.alert('下载完成');
          })
        })
      }

      $mdDialog.show({
        controller: ['$scope','utils','$mdDialog',function ($scope,utils,$mdDialog) {
          $scope.item=item;
          var tasks = [];
          tasks.push(function () {
            return remote.Assessment.getUserMeasureValue(item.ProjectID,1,item.AssessmentID,"Pack"+item.AssessmentID+"sc",sxt);
          });
          tasks.push(function () {
            return remote.Assessment.getUserMeasurePoint(item.ProjectID,1,"Pack"+item.AssessmentID+"point");
          });
          tasks.push(function(){
            return remote.Assessment.getAllMeasureReportData({RegionID:item.ProjectID,RecordType:1})
          })
          tasks.push(function () {
            return $q(function (resolve) {
              item.pack = pack.sc.down(item);
              $rootScope.$on('pack'+item.AssessmentID,function (e,d) {
                if(!item.pack)return;
                if(item.pack && item.pack.completed) {
                  resolve();
                }
              })
            });
          });
          tasks = tasks.concat(projectTask(item.ProjectID));
          item.percent = item.current =0; item.total = tasks.length;
          api.task(tasks,{
            event:'downloadsc',
            target:item
          })(null,function () {
                if (!isReflsh){
                  callBack();
                }else {
                  utils.alert("刷新成功!");
                }
          }, function (timeout) {
            item.percent = item.current = item.total = null;
            var msg=timeout?'请求超时,任务下载失败!':'下载失败,请检查网络';
            utils.alert(msg);
            $mdDialog.cancel();
          })
        }],
        template: '<md-dialog aria-label="正在下载"  ng-cloak><md-dialog-content> <md-progress-circular md-mode="indeterminate"></md-progress-circular><p style="padding-left: 6px;">正在下载：{{item.ProjectName}} {{item.percent}}({{item.current}}/{{item.total}})</p></md-dialog-content></md-dialog>',
        parent: angular.element(document.body),
        clickOutsideToClose:false,
        fullscreen: false
      });
    }

    api.event('downloadsc',function (s,e) {
      var current =vm.current;
      if(current) {
        switch (e.event) {
          case 'progress':
            current.percent = parseInt(e.percent * 100) + ' %';
            current.current = e.current;
            current.total = e.total;
            break;
        }
      }
    },$scope);


    function queryOnline() {
      vm.onlines = [];
      vm.offlines = [];
      vm.data.rows.forEach(function (m) {
        m.progress = 0;
        vm.offlines.push(m);
      });
      remote.Project.getMap().then(function (result) {
        if(!result || result.data.length==0){
          utils.alert('暂无项目！');
        }
        else {
          result.data.forEach(function (m) {
            m.AssessmentID='scsl'+ m.ProjectID+'_'+vm.role;
            m.AssessmentSubject= m.ProjectName;
            var fd = vm.data.rows.find(function (a) {
              return a.AssessmentID == m.AssessmentID;
            });
            if (!fd) {
              vm.onlines.push(m);
            }
          });
          vm.projects=result.data;
        }
      }).then(function(){

      }).catch(function () {

      });
    }

    vm.go=function(item){
      var pk = db('pack'+item.AssessmentID);
      pk.get('GetRegionTreeInfo').then(function(r){
        if (r&& r.data&& r.data.Children){
          var areas=r.data.Children;
          var  routeData={
            projectId:item.ProjectID,
            assessmentID:item.AssessmentID,
            role:vm.role
            //isReport:fa
          };
          if (angular.isArray(areas)&&areas.length>1){
            $state.go("app.xhsc.scsl.chooseArea",routeData)
          }else {
            $state.go("app.xhsc.scsl.sclist",angular.extend(routeData,{area:areas[0].RegionID}));
          }
        }
      })
    }
  }
})();
