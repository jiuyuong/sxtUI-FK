/**
 * Created by zhangzhaoyong on 16/2/1.
 */
/**
 * Created by zhangzhaoyong on 16/2/1.
 */
(function(){
  'use strict';

  angular
    .module('app.material')
    .controller('MMyProcessController',MMyProcessController);

  /** @ngInject */
  function MMyProcessController($scope, api, utils, $state,$q,sxt,xhUtils,$timeout, $mdDialog,$stateParams){

    var vm = this;
    vm.AttachmentSHow = false;

    vm.checkData={};
    vm.EnclosureType = [];
    vm.checkData.WgCheck = 1;
    vm.checkData.IsInspection = 1;
    vm.checkData.CheckTime = new Date();
    vm.checkData.sjReport = null;
    $scope.data = {
      imgs1:[],
      imgs2:[],
      imgs3:[],
      imgs4:[],
      imgs5:[]

    };

    $scope.save = function(addForm) {
      vm.checkData.InspectionReport = vm.checkData.sjReport;
      vm.checkData.ProjectId = $scope.project.projectId;
      vm.checkData.MaterialId = $scope.project.procedureId;
      vm.checkData.RegionNameTree = $scope.project.nameTree;
      vm.checkData.RegionId = $scope.project.pid;
      vm.checkData.ProjectName = $scope.project.projectName;
      vm.checkData.RegionName = $scope.project.typeName;


      if(vm.checkData.WgCheck == 0 || vm.checkData.InspectionReport == 0) {
        $mdDialog.show({
          controller: ['$scope',function ($scope) {
            $scope.hide = function() {
              $mdDialog.hide();
            };
            $scope.cancel = function() {
              $mdDialog.cancel();
            };
            $scope.answer = function() {
              vm.checkData.CheckResult = 0;  //状态：不合格
              if (vm.checkData.InspectionReport == null)
                vm.checkData.InspectionReport = 3; //   N/A

              vm.checkData.HandleOption = $scope.clyj;

              api.material.addProcessService.Insert({
                Id:sxt.uuid(),
                CheckData:vm.checkData,
                CheckDataOptions:vm.EnclosureType
              }).then(function (result) {
                if(result){
                  $scope.isSaveing = false;
                  utils.alert('提交完成').then(function () {
                    $state.go('app.szgc.ys');
                  });
                }else{
                  utils.alert('提交失败').then(function () {
                    $scope.isSaveing = false;
                  });
                }
              });
            };

          }],
          templateUrl: 'app/main/material/ys/treatmentOption.html',
          bindToController:true,
          fullscreen: $scope.customFullscreen
        });
      }
      else{
        if (vm.checkData.WgCheck == 1 && vm.checkData.InspectionReport == null && vm.checkData.IsInspection == 1) {
          vm.checkData.CheckResult = 2; //状态：未知
          vm.checkData.InspectionReport = 2; //未提供
        }else{
          vm.checkData.CheckResult = 1; //状态：合格
          if (vm.checkData.InspectionReport == null)
            vm.checkData.InspectionReport = 3; //   N/A
        }

        vm._save(addForm);
      }
    };

    vm._save = function (addForm) {
      api.material.addProcessService.Insert({
        Id:sxt.uuid(),
        CheckData:vm.checkData,
        CheckDataOptions:vm.EnclosureType
      }).then(function (result) {
        if(result){
          $scope.isSaveing = false;
          utils.alert('提交完成').then(function () {
            $state.go('app.szgc.ys');
          });
        }else{
          utils.alert('提交失败').then(function () {
          });
        }
      });
    };

    vm.Type = [
      {name:'出厂合格证',value:2,groupId:sxt.uuid()},
      {name:'材料验收单',value:4,groupId:sxt.uuid()},
      {name:'实拍照片',value:8,groupId:sxt.uuid()},
      {name:'送检报告',value:16,groupId:sxt.uuid()},
      {name:'其他',value:32,groupId:sxt.uuid()}
    ];

    vm.checkDataId = $stateParams.id;

    if(vm.checkDataId != ''){
      vm.AttachmentSHow = true;
      vm.fjType = 16;
      vm.Type.find(function (t) {
        if(t.value == 16){
          vm.groupId_16 =  t.groupId;
        }
      });
    }else{
      vm.fjType = 2;

      if(vm.EnclosureType.length != 0){
        vm.Type.forEach(function (item) {
          vm.EnclosureType.find(function (e)
          {
            if(item.value == e.OptionType)
              item.groupId = e.GroupImg;
          });
        });
        vm.fjType = vm.EnclosureType[vm.EnclosureType.length-1].OptionType; //显示最后一次选中
      }

      vm.Type.find(function (t) {
        if(t.value == 2){
          vm.groupId_2 =  t.groupId;
        }
      });

      vm.Type.find(function (t) {
        if(t.value == 4){
          vm.groupId_4 =  t.groupId;
        }
      });

      vm.Type.find(function (t) {
        if(t.value == 8){
          vm.groupId_8 =  t.groupId;
        }
      });

      vm.Type.find(function (t) {
        if(t.value == 16){
          vm.groupId_16 =  t.groupId;
        }
      });

      vm.Type.find(function (t) {
        if(t.value == 32){
          vm.groupId_32 =  t.groupId;
        }
      });
    }

    vm.ok = function(){
      vm.checkData.HandleOption = null;
      if(vm.checkDataId != ''){
        if(vm.checkData.sjReport == 0){
          $mdDialog.show({
            controller: ['$scope',function ($scope) {
              $scope.hide = function() {
                $mdDialog.hide();
              };
              $scope.cancel = function() {
                $mdDialog.cancel();
              };
              $scope.answer = function() {
                vm.checkData.HandleOption = $scope.clyj;

                api.material.addProcessService.Insert({
                  CheckData:{Id:vm.checkDataId,InspectionReport:vm.checkData.sjReport,CheckResult:vm.checkData.sjReport,HandleOption:vm.checkData.HandleOption},
                  CheckDataOptions:[{OptionType:16,GroupImg:vm.groupId_16}]
                }).then(function (result) {
                  if(result){
                    utils.alert('提交完成').then(function () {
                      $state.go('app.szgc.ys');
                    });
                  }else{
                    utils.alert('提交失败').then(function () {
                    });
                  }
                });
              };
            }],
            templateUrl: 'app/main/material/ys/treatmentOption.html',
            bindToController:true,
            fullscreen: $scope.customFullscreen
          });
        }else {
          api.material.addProcessService.Insert({
            CheckData:{Id:vm.checkDataId,InspectionReport:vm.checkData.sjReport,CheckResult:vm.checkData.sjReport,HandleOption:vm.checkData.HandleOption},
            CheckDataOptions:[{OptionType:16,GroupImg:vm.groupId_16}]
          }).then(function (result) {
            if(result){
              utils.alert('提交完成').then(function () {
                $state.go('app.szgc.ys');
              });
            }else{
              utils.alert('提交失败').then(function () {
              });
            }
          });
        }
      }else {
        if($scope.data.imgs1.length != 0 && vm.EnclosureType.find(function (e){return e.OptionType == 2}) == null)
          vm.EnclosureType.push({OptionType:2,GroupImg:vm.groupId_2});
        if($scope.data.imgs2.length != 0 && vm.EnclosureType.find(function (e){return e.OptionType == 4}) == null)
          vm.EnclosureType.push({OptionType:4,GroupImg:vm.groupId_4});
        if($scope.data.imgs3.length != 0 && vm.EnclosureType.find(function (e){return e.OptionType == 8}) == null)
          vm.EnclosureType.push({OptionType:8,GroupImg:vm.groupId_8});
        if($scope.data.imgs4.length != 0 && vm.EnclosureType.find(function (e){return e.OptionType == 16}) == null)
          vm.EnclosureType.push({OptionType:16,GroupImg:vm.groupId_16});
        if($scope.data.imgs5.length != 0 && vm.EnclosureType.find(function (e){return e.OptionType == 32}) == null)
          vm.EnclosureType.push({OptionType:32,GroupImg:vm.groupId_32});
        vm.AttachmentSHow = false;
      }
    };


    //获取材料供应商
    api.material.SupplierService.GetAll({startrowIndex:0,maximumRows:100,Status:4}).then(function(result){
      $scope.supplier = result.data.Rows;
    });




    $scope.is = function(route){
      return $state.is(route);
    }
    $scope.delProcess = function(BatchRelationId) {
      utils.confirm(null, '确认删除验收批吗？',
        function() {
          $scope.delmyProcess(BatchRelationId);
        });
    };

    $scope.delmyProcess = function(BatchRelationId) {
      api.material.addProcessService.delProcess(BatchRelationId).then(function(result) {

        if (result.status == 200) {
          $scope.project.filter(true);
          utils.alert('删除成功！')
        }
      });
    };

    $scope.getNetwork = function () {
      return api.getNetwork();
    }

    $scope.isPartner = api.szgc.vanke.isPartner();
    $scope.project = {
      isMore: true,
      states: [{
        id: -1,
        color: '',
        title: '全部',
        selected: true,
      }, {
        id: 0,
        color: 'slategrey',
        title: '未验收',
        selected: true,
        c: 0
      }, {
        id: 1,
        color: 'brown',
        title: '初验不合格',
        selected: true,
        c: 0
      }, {
        id: 2,
        color: 'green',
        title: '初验合格',
        selected: true,
        c: 0
      }, {
        id: 3,
        color: 'red',
        title: '复验不合格',
        selected: true,
        c: 0
      }, {
        id: 4,
        color: 'blue',
        title: '复验合格',
        selected: true,
        c: 0
      }],
      onQueryed: function(data) {
        $scope.project.data = data;
        //$scope.project.filter();
      },
      //filterBatch: function (sources) {
      //    console.log('sources', sources);
      //},
      filter: function(reload) {
        vm.loading = true;
        if (!$scope.project.procedureId || !$scope.project.data || !$scope.project.data.items) return;
        if (reload === true || ($scope.project.data && !$scope.project.data.fd)) {
          $scope.project.data.fd = true;
          api.material.CheckStepService.getAll($scope.project.procedureId, {
            regionIdTree: $scope.project.idTree,
            Status: 4
          }).then(function(result) {
            $scope.project.data.total = $scope.project.data.items.length;
            var checkedCount = 0,
              cmpCount = 0;
            var results = [];

            $scope.project.data.items.forEach(function(item2) {
              var item = null; //results.find(function (k) { return k.RegionId == it.RegionId && k.BatchNo == it.BatchNo });
              if (!item) {
                item = utils.copy(item2);
                item.state = 0;
                item.checkedCount = 0;
                item.Remark = item.BatchRelationId = item.MinPassRatio = item.CheckDate = item.CheckWorkerName = item.BatchNo = null;
                results.push(item);
              }

              result.data.Rows.forEach(function(it) {
                var qd = item;
                if (it.RegionId == qd.$id) {
                  if (!qd.BatchNo)
                    qd.BatchNo = it.BatchNo;
                  else if (qd.BatchNo != it.BatchNo) {
                    qd = results.find(function(k) {
                      return k.$id == it.RegionId && k.BatchNo == it.BatchNo
                    });
                    if (!qd) {
                      qd = utils.copy(item2);
                      qd.BatchRelationId = it.BatchRelationId;
                      qd.BatchNo = it.BatchNo;
                      qd.state = 0;
                      qd.Remark = it.Remark;
                      qd.checkedCount = 0;
                      qd.MinPassRatio = qd.CheckDate = qd.CheckWorkerName = null;
                      results.push(qd);
                    }
                  }
                  if (!it.CheckNo) {

                  } else if (it.CheckNo == 1) {
                    qd.state = it.AllResult ? 2 : 1;
                  } else {
                    qd.state = it.AllResult ? 4 : 3;
                  }


                  if (it.CheckNo)
                    qd.checkedCount++;
                  if (it.RoleId == 'jl') {
                    qd.BatchRelationId = it.BatchRelationId;
                    qd.Remark = it.Remark;
                    qd.MinPassRatio = it.MinPassRatio;
                    qd.CheckDate = it.CheckDate;
                    qd.CheckWorkerName = it.CheckWorkerName;
                  } else if (it.CheckWorkerName) {
                    qd.MinPassRatio1 = it.MinPassRatio;
                    qd.CheckDate1 = it.CheckDate;
                    qd.CheckWorkerName1 = it.CheckWorkerName;
                  }
                }
              });

              //item.


            });

            results.forEach(function(item) {

              if (item.state != 0)
                checkedCount++;
              if (item.state == 2 || item.state == 4)
                cmpCount++;
            });

            $scope.project.data.checkedCount = checkedCount;
            $scope.project.data.cmpCount = cmpCount;
            $scope.project.data.results = results;
            $scope.project.filter();
          });

        }
        else if ($scope.project.data.items && $scope.project.data.results) {
          //仅通过states过虑
          var rows = [];

          $scope.project.states.forEach(function(item) {
            item.c = 0;
          });
          $scope.project.data.results.forEach(function(item) {
            if ($scope.project.states.find(function(it) {
                if (it.id == item.state || it.id == -1) {
                  it.c++;
                  item.color = it.color;
                  item.stateName = it.title;
                }
                return it.selected && it.id == item.state
              })) {
              rows.push(item);
            }
          });
          $scope.project.rows = rows;
          vm.loading = false;
        }
      }
    };
    $scope.checkState = function(state) {
      if (state.id == -1) {
        if(state.selected){
          state.selected = false;
          $scope.project.states.forEach(function(item) {
            item.selected = false;
          });
        }else{
          state.selected = true;
          $scope.project.states.forEach(function(item) {
            item.selected = true;
          });
        }
      } else {
        state.selected = !state.selected;
        var newArr1 = angular.copy($scope.project.states);
        var newArr = newArr1.splice(1,$scope.project.states.length-1);
        var i=0;
        newArr.forEach(function(item){
          if(!item.selected){
            i--;
          }else{
            i++;
          }
          if(i == newArr.length){
            $scope.project.states[0].selected = true;
          }else{
            $scope.project.states[0].selected = false;
          }

        })

      }
      $scope.project.filter();
    };
    api.material.ProcedureTypeService.getAll({startrowIndex:0,maximumRows:100,Status:5}).then(function(result) {
      $scope.project.procedureTypes = result.data.Rows;
    });

    $scope.$watch(function () {
      return vm.searBarHide;
    },function () {
      if(!vm.searBarHide)return;
      if (!$scope.project.pid || !$scope.project.procedureId) {
        utils.alert("必须选择项目和工序！");
        return;
      }else{
        $timeout(function () {
          $scope.project.filter(true);
        },300);

      }
    })
    /*    $scope.$watch('project.procedureId', function(a,b) {
     if(a != b){
     if ( !$scope.project.pid) {
     utils.alert("项目不能为空！");
     return;
     }else{
     $scope.project.filter(true);
     }
     }

     });*/

    //以下离线相关
    if(api.getNetwork()==0) {
      api.szgc.vanke.projects().then(function (r) {
        $scope.project.projects = r.data.data;
      });
    }
    var queryOffline = function () {
      return api.szgc.ProjectSettings.offline.query().then(function (result) {
        $scope.project.offlines = result.data;
      });
    }
    queryOffline();
    $scope.hasTasks = function (item) {
      return  $scope.project && $scope.project.tasks && $scope.project.tasks.find(function (t) {
          return t.procedure == $scope.project.procedureId
            && t.projectid == item.$id;
        });
    }
    $scope.requeryTasks = function () {
      api.uploadTask(function (cfg,item) {
        return true
      }).then(function (result) {
        $scope.project.tasks = result.rows;
      });
    }
    $scope.requeryTasks();
    $scope.isOffline = function (item) {
      return !!$scope.project.offlines.find(function (t) {
        return t._id.indexOf(item.project_item_id)!=-1;
      });
    }
    $scope.download =function ($event,project,item) {
      item.downloading = true;
      var idTree = project.project_id+'>'+item.project_item_id;
      api.download([
        //项目区域
        function (tasks) {
          return api.szgc.vanke.buildings({
            project_id: item.project_id,
            project_item_id: item.project_item_id,
            page_size: 0,
            page_number: 1
          }).then(function (result) {
            result.data.data.forEach(function (build) {
              tasks.push(function () {
                return api.material.vanke.floors(build.building_id);
              });
            });
          });
        },//下载户型
        function (tasks,downFile) {
          return $q(function (resolve,reject) {
            api.szgc.vanke.room_types(item.project_item_id).then(function (result) {
              var tk = [];
              result.data.data.forEach(function (type) {
                tk.push(api.material.FilesService.group(item.project_item_id+'-'+type.type_id));
                //5类工序
                [1,2,3,4,5,6].forEach(function (m) {
                  tasks.push(function () {
                    return api.material.ProjectExService.get(item.project_item_id+'-'+type.type_id+'-'+m)
                  });
                });
              });
              //图纸
              $q.all(tk).then(function (rs) {
                var pics = xhUtils.getMapPic(2);
                rs.forEach(function (r) {
                  if(r.data.Files && r.data.Files.length){
                    var f = r.data.Files[0];
                    //f.Url = f.Url.replace('~/','/');
                    pics.forEach(function (tile) {
                      tasks.push(function () {
                        return downFile('map','tile_'+f.Id+'_'+tile+'.jpg',sxt.app.api+'/api/picMap/load/'+tile+'.png?path='+f.Url.replace('/s_','/')+'&size=256');
                      });
                    })
                  }
                });

                resolve();
              }).catch(reject);
            })
          });
        },
        function (tasks) {
          return api.material.ProjectSettingsSevice.query({treeId:idTree,unitType:1,includeChild:true}).then(function (result) {
            var units = [];
            result.data.Rows.forEach(function (s) {
              if(units.indexOf(s.UnitId)==-1){
                units.push(s.UnitId);
                tasks.push(function () {
                  return api.szgc.vanke.teams(s.UnitId);
                })
              }
            })
          });
        },
        function (tasks) {
          return api.material.ProjectSettingsSevice.query({treeId:idTree,unitType:2,includeChild:true}).then(function (result) {
            var units = [];
            result.data.Rows.forEach(function (s) {
              if(units.indexOf(s.UnitId)==-1){
                units.push(s.UnitId);
                tasks.push(function () {
                  return api.szgc.vanke.teams(s.UnitId);
                })
              }
            })
          });
        },
        function (tasks) {
          return api.material.ProjectSettingsSevice.query({treeId:idTree,unitType:3,includeChild:true}).then(function (result) {
            var units = [];
            result.data.Rows.forEach(function (s) {
              if(units.indexOf(s.UnitId)==-1){
                units.push(s.UnitId);
                tasks.push(function () {
                  return api.szgc.vanke.teams(s.UnitId);
                })
              }
            });
          });
        },
        //验收状态
        function () {
          return api.material.addProcessService.getBatchRelation({regionIdTree:idTree});
        },
        //检查项目
        function () {
          return api.material.CheckStepService.cache(idTree);
        },
        //专业
        function () {
          return api.szgc.vanke.skills({page_size:0,page_number:1});
        },
        //工序级别关系
        function () {
          return api.material.BatchSetService.getAll({status:4,batchType:255})
        },
        //专业分类关系
        function () {
          return api.material.ProcedureTypeService.getAll({startrowIndex:0,maximumRows:100,Status:5});
        },
        //工序验收批设置
        function () {
          return api.material.ProcedureBathSettingService.query();
        },
        //工序验收表
        function () {
          return api.material.TargetService.getAll()
        }])(function (percent,current,total) {
        item.percent = parseInt(percent *100) +' %';
        item.current = current;
        item.total = total;
      },function () {
        item.downloading = false;
        var offline = {
          Id:idTree,
          name:project.name+'>'+item.name,
          project:project,
          item:item
        };
        api.material.ProjectSettings.offline.create(offline).then(function () {
          queryOffline().then(function () {
            var off = $scope.project.offlines.find(function (item) {
              return item.Id == offline.Id;
            });
            utils.alert('下载完成，系统将创建索引。');
            $scope.indexDb(off);
          });

        });

      },function () {
        item.downloading = false;
        utils.alert('下载失败');
      },{timeout:30000});
    };
    $scope.indexDb =function (item) {
      item.indexing = true;
      api.task([function () {
        return api.material.TargetService.getAll.db().allDocs();
      },function () {
        return api.material.ProjectSettingsSevice.query.db().allDocs();
      },
        function () {
          return api.material.addProcessService.getBatchRelation.db().allDocs();//索引
        },function () {
          return api.material.CheckStepService.getAll.db().allDocs();
        },
        function () {
          return api.material.ProcedureBathSettingService.query.db().allDocs();//索引
        },function () {
          return api.szgc.vanke.teams.db().allDocs();
        }])(function (percent,current,total) {
        item.percent = parseInt(percent *100) +' %';
        item.current = current;
        item.total = total;
      },function () {
        item.indexing = false;
        utils.alert('索引完成');
      },function () {
        item.indexing = false;
      },{
        timeout:300000
      });
    }
    $scope.upload =function () {
      $scope.uploading = true;
      api.upload(function (cfg,item) {
        if(cfg._id=='s_files' && item && item.Url.indexOf('base64')==-1){
          return false;
        }
        return true;
      },function (percent,current,total) {
        $scope.project.percent = parseInt(percent *100) +' %';
        $scope.project.current = current;
        $scope.project.total = total;
      },function () {
        $scope.project.uploaded = 1;
        api.uploadTask(function () {
          return true
        },null);
        utils.alert('上传完成');
        $scope.project.tasks = [];
        $scope.uploading= false;
      },function () {
        $scope.project.uploaded = 0;
        utils.alert('上传失败');
        $scope.uploading =false;
      },{
        uploaded:function (cfg,row,result) {
          cfg.db.delete(row._id);
        }
      });
    }
    $scope.deleteItem = function ($event,project,item) {

    }
    $scope.loadProject_items= function (project) {
      if(!project.items){
        return api.szgc.vanke.project_items({
          project_id: project .project_id,
          page_size: 0,
          page_number: 1
        }).then(function (result) {
          project.items = result.data.data;
        });
      }
      else{
        project.items = null;
      }
    }
  }
})();
