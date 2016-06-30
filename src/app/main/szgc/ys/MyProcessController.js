/**
 * Created by zhangzhaoyong on 16/2/1.
 */
/**
 * Created by zhangzhaoyong on 16/2/1.
 */
(function(){
  'use strict';

  angular
    .module('app.szgc')
    .controller('MyProcessController',MyProcessController);

  /** @ngInject */
  function MyProcessController($scope, api, utils, $state){

    var vm = this;
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
      api.szgc.addProcessService.delProcess(BatchRelationId).then(function(result) {

        if (result.status == 200) {
          $scope.project.filter(true);
          utils.alert('删除成功！')
        }
      });
    };




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
        $scope.project.filter();
      },
      //filterBatch: function (sources) {
      //    console.log('sources', sources);
      //},
      filter: function(reload) {
        if (!$scope.project.procedureId || !$scope.project.data || !$scope.project.data.items) return;
        if (reload === true || ($scope.project.data && !$scope.project.data.fd)) {
          $scope.project.data.fd = true;
          api.szgc.CheckStepService.getAll($scope.project.procedureId, {
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

        } else if ($scope.project.data.items) {
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
    api.szgc.ProcedureTypeService.getAll({startrowIndex:0,maximumRows:100,Status:5}).then(function(result) {
      $scope.project.procedureTypes = result.data.Rows;
    });
    var pt, ptype;
    var queryProcedures = function() {
      var t = 1;
      if ($scope.project.type) {
        switch ($scope.project.type) {
          case 1:
              t = 2;
            break;
          case 2:
            t = 8;
            break;
          case 8:
            t = 32;
            break;
          case 32:
            t = 64;
            break;
        }
      }
      if (pt == t && $scope.project.procedureTypeId == ptype) return;
      pt = t;
      ptype = $scope.project.procedureTypeId;
      api.szgc.BatchSetService.getAll({status:4,batchType: t}).then(function(result) {
        var data = [];
        result.data.Rows.forEach(function(item) {
          //if ($scope.project.procedureTypeName != item.ProcedureType)
          //$scope.project.ProcedureType = item.ProcedureType;
          if (!$scope.project.procedureTypeId || $scope.project.procedureTypeId == item.ProcedureTypeId) {
            data.push(item);
          }
        });
        $scope.project.procedures = data;
      });
    }

    //$scope.$watch('project.type', queryProcedures);
    //$scope.$watch('project.procedureTypeId', queryProcedures);
    $scope.$watch('project.procedureId', function(a,b) {
      if(a != b){
        if ( !$scope.project.pid) {
          utils.alert("项目不能为空！");
          return;
        }else{
          $scope.project.filter(true);
        }
      }

    });

    //以下离线相关
    api.szgc.vanke.projects().then(function (r) {
      $scope.project.projects = r.data.data;
      $scope.project.projects.forEach(function (p) {
        api.setting('p_'+p.$id).then(function (d) {
          p.online = d?1:0;
        });
      })
    });
    $scope.download =function (project) {
      api.task([
        //项目区域/合作伙伴
        function (tasks) {
          return api.szgc.vanke.projects().then(function (result) {
            result.data.data.forEach(function (p) {
              tasks.push(function () {
                return api.szgc.vanke.project_items({
                  project_id: p.project_id,
                  page_size: 0,
                  page_number: 1
                }).then(function (result) {
                  result.data.data.forEach(function (item) {
                    tasks.push(function () {
                      return api.szgc.vanke.buildings({
                        project_id: item.project_id,
                        project_item_id: item.project_item_id,
                        page_size: 0,
                        page_number: 1
                      }).then(function (result) {
                        result.data.data.forEach(function (build) {
                          tasks.push(function () {
                            return api.szgc.vanke.rooms({
                              building_id: build.building_id,
                              page_size: 0,
                              page_number: 1
                            });
                          })
                        });
                      })
                    });
                  })
                });
              });
              tasks.push(function () {
                return api.szgc.addProcessService.getBatchRelation({regionIdTree:p.project_id});
              });
              tasks.push(function () {
                return api.szgc.CheckStepService.cache(p.project_id);
              })
            })
          });
        },
        //专业
        function () {
          return api.szgc.vanke.skills({page_size:0,page_number:1});
        },
        //工序级别关系
        function () {
          return api.szgc.BatchSetService.getAll({status:4,batchType:255})
        },
        //专业分类关系
        function () {
          return api.szgc.ProcedureTypeService.getAll({startrowIndex:0,maximumRows:100,Status:5});
        },
        //工序验收批设置
        function () {
          return api.szgc.ProcedureBathSettingService.query();
        },
        //工序验收表
        function () {
          return api.szgc.TargetService.getAll()
        }
      ])(function (percent,current,total,context) {
        project.percent = parseInt(percent *100) +' %';
        project.current = current;
        project.total = total;
      })
    }
  }
})();
