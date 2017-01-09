/**
 * Created by jiuyuong on 2016/3/30.
 */
(function(){
  'use strict';

  angular
    .module('app.xhsc')
    .controller('gxhousechooseController',gxhousechooseController);

  /** @ngInject */
  function gxhousechooseController($scope,$stateParams,db,$rootScope,xhUtils,remote,$timeout,$q,$state,$mdDialog,utils,api,xhscService){
    var vm=this,
      areaId = $stateParams.projectId,
      projectId = areaId.substr(0,5),
      acceptanceItemID=$stateParams.acceptanceItemID,
      acceptanceItemName = $stateParams.acceptanceItemName,
      role=$stateParams.role;
      ;
      vm.maxRegion = $stateParams.maxRegion;

    $rootScope.title = $stateParams.acceptanceItemName;
    if(role == "zb"){
      $rootScope.sendBt = true;
    }
    vm.building=[];
    function  load(){
      vm.nums={
        qb:0, //全部
        wtj:0,//未提交
        dy:0,//待验收
        hg:0, //合格
        bhg:0,//不合格
        yzg:0,//已整改
        wzg:0//未整改
      }
      function  setNum(status,region){
        function  addNum(status){
          vm.nums.qb++;
          switch (status){
            case  0:
              vm.nums.wtj++;
              break;
            case  1:
              vm.nums.dy++;
              break;
            case  2:
              vm.nums.hg++;
              break;
            case  4:
              vm.nums.bhg++;
              break;
            case  8:
              vm.nums.wzg++;
              break;
            case  16:
              vm.nums.yzg++;
              break;
          }
        }
        if (vm.maxRegion==8){
            if (region.RegionType==8&&region.hasShowRight){
              if (region.inspectionRows&&region.inspectionRows.length){
                region.inspectionRows.forEach(function (k) {
                  if (!k.Status){
                    k.Status=0;
                  }
                  addNum(k.Status);
                })
              }else {
                addNum(status);
              }
            }
        }else {
            if (region.RegionType>=8&&region.hasShowRight){
              if (region.inspectionRows&&region.inspectionRows.length){
                region.inspectionRows.forEach(function (k) {
                  if (!k.Status){
                    k.Status=0;
                  }
                  addNum(k.Status);
                })
              }else {
                addNum(status);
              }
            }
        }
      }
      //状态设置与用户区域权限
      function filterOrSetting(status,region){
        var st=status.find(function(o){
          return o.AreaId.indexOf(region.RegionID)!=-1;
        });
        if (st){
          region.hasShowRight=true;
        }
        if (region.RegionType>4){
          statusSetting(status,region);
        }
      }

      var st2 =[];
      function setInspection(region){
        var percentage= 0,status=0;
        if(region.inspectionRows.length){
          region.inspectionRows && region.inspectionRows.forEach(function(t){
            percentage += t.Percentage;
            status = t.Status;
            t.style=ConvertClass(t.Status);
          })
        }else{
          percentage = region.percentage;
          status = [0];
        }
        // if(percentage > 100){
        //   percentage = 100;
        // }
        // region.Percentage = percentage;
        region.status = status;
        region.style=ConvertClass(status);
        setNum(status,region);
      }
      //状态设置
      function statusSetting(status,region){
        if(!angular.isArray(status)){
          status=[status];
        }
        var st1 = [];
        region.inspectionRows=[];
        status.forEach(function(t){
          if(t.AcceptanceItemID==acceptanceItemID && t.AreaId == region.RegionID){
            if (!region.inspectionRows.find(function (k) {
                k.InspectionId==t.InspectionId;
              })){
              region.inspectionRows.push(t);
            }
          }
        })
        setInspection(region);
      }
      function ConvertClass(status){
        var style;
        switch (status){
          case 0:
            style="wait";
            break;
          case 1:
            style="dy";
            break;
          case 2:
            style="pass";
            break;
          case 4:
            style="ng";
            break;
          case 8:
            style="ng";
            break;
          case 16:
            style="yzg";
            break;
          default:
            break;
        }
        return style;
      }
      return $q.all([
        xhscService.getRegionTreesOnline(projectId,31,1),
        remote.Procedure.getRegionStatus(projectId)
      ]).then(function(res){
        vm.loading = true;
        var result= res[0][0];
        var status=res[1]&&res[1].data?res[1].data:[];
        result.Children.forEach(function(d){
          if (d.RegionID==areaId){
            d.selected=true;
            filterOrSetting(status,d);
            d.projectTree =  result.RegionName;
            d.projectTitle = result.RegionName + d.RegionName;
            d.Children && d.Children.forEach(function(c){
              c.floors=[];
              filterOrSetting(status,c)
              c.projectTree = d.projectTree + c.RegionName;
              c.checked = false;
              vm.building.push(c);
              c.Children && c.Children.forEach(function(r){
                r.projectTree = c.projectTree + r.RegionName;
                r.checked = false;
                filterOrSetting(status,r);
                vm.floors=vm.floors?vm.floors:[];
                vm.floors.push(r);
                if (! r.Children||!r.Children.length){
                  c.floors.push(r);
                }
                r.Children && r.Children.forEach(function(_r){
                  _r.projectTree = r.projectTree + _r.RegionName;
                  _r.checked = false;
                  filterOrSetting(status,_r);
                })
              })
            })
          }
        })
        vm.houses =  result.Children;
        return vm.houses;
      });
    }

    load();

    vm.callBack=function(){
      utils.alert('报验成功',null,function(){
        $state.go("app.xhsc.gx.gxmain");
      })
    };
    vm.selected = function(r){
      switch (r.status){
        case 0:
          r.checked = !r.checked;
          break;
        case 1:
          r.checked = r.Percentage==100?false:(!r.checked);
          break;
      }
    }


    vm.zk = function(item){
      item.show = !item.show;
    }
    vm.filterNum = -1;
    vm.filter = function(num){
      vm.filterNum = num;
    }

    function compare(region,operator){
      if (region.Children){
        for (var  i=0;i<region.Children.length;i++){
          if (vm.regionfilterByStatus(region.Children[i])){
              return true;
          }
        }
        return  operator(region.status);
      }else {
        return  operator(region.status);
      }
    }

    vm.regionfilterByStatus=function(region){
       if (vm.filterNum==-1){
           return compare(region,function(status){
              return vm.statusRight(status);
           });
       }
       return compare(region,function(status){
         return status== vm.filterNum
       });
    }

    vm.statusRight=function(status){
      var show=[0,1,2,4,8,16];
      switch (role){
        case "zb":
          show=[0,1,2,8,16];
          break;
        case  "jl":
          show=[0,1,2,8,16];
          break;
        case  "jf":
          show=[0,1,2,4];
          break;
      }
      return show.indexOf(status)>-1;
    }

    var sendgxResult =$rootScope.$on('sendGxResult',function(){
      vm.data = {
        projectId:projectId,
        Rows:[],
        Sign:1,
        acceptanceItemName:acceptanceItemName,
        acceptanceItemID:acceptanceItemID
      }

      vm.houses.forEach(function(t){
        if (!t.Children){
          t.Children=[];
        }
        t.Children.forEach(function(_t){
          if(_t.checked){
            vm.data.Rows.push(_t);
          }
          _t.Children && _t.Children.forEach(function(_tt){
            if(_tt.checked){
              vm.data.Rows.push(_tt);
            }
            _tt.Children && _tt.Children.forEach(function(l){
              if(l.checked){
                vm.data.Rows.push(l)
              }
            })
          })
        })
      })
      if(vm.data.Rows.length){
        vm.showmyDialog = true;
      }else{
        utils.alert('请选择区域');
      }
    });
    $scope.$on("$destroy",function(){
      //$mdDialog
      sendgxResult();
      sendgxResult=null;
    });
  }
})();
