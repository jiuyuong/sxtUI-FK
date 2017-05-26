/**
 * Created by 陆科桦 on 2016/10/23.
 */

(function () {
  'use strict';

  angular
    .module('app.xhsc')
    .config(config);

  /** @ngInject */
  function config(apiProvider) {
    var $http = apiProvider.$http,
      $q = apiProvider.$q;
    apiProvider.register('xhsc', {
      materialPlan: {
        getMaterialPlanBatch: $http.db({
          _id: 'materialPlan',
          idField: 'SectionId',
          dataType: 3,
          filter: function (item, sectionId) {
            return item.SectionId == sectionId;
          }
        }).bind(function (sectionId, status, role) {
          return $http.get($http.url('/api/MaterialPlan/GetMaterialPlansBatchBySectionId', { sectionId: sectionId, status: status, role: role })).then(function (res) {
            return {
              data: {
                SectionId: sectionId,
                Result: res.data
              }
            }
          });
        }, function (res) {
          return {
            data: res.data.Result
          }
        }),
        deleteMaterialPlanBatch: $http.db({
          _id: 'materialPlan',
          idField: 'Id',
          delete: true,
          local: true
        }).bind(),
        getMaterialBatchIntoFactory: $http.db({
          _id: 'materialBatchIntoFactory',
          idField: 'Id',
          dataType: 1
        }).bind(),
        // updateMaterialBatchIntoFactory: $http.db({
        //   _id: 'materialBatchIntoFactory',
        //   idField: 'Id',
        //   update: true,
        //   local: true
        // }).bind(),
        getMaterialPlanDetailList: $http.db({
          _id: 'materialPlanDetailList',
          idField: 'SectionId',
          dataType: 3
        }).bind(function (sectionId, status, role) {
          return $http.get($http.url('/api/MaterialPlan/GetMaterialPlanListAsync', { sectionId: sectionId, status: status, role: role })).then(function (res) {
            return {
              data: {
                SectionId: sectionId,
                Result: res.data
              }
            }
          });
        }, function (res) {
          return {
            data: res.data.Result
          }
        }),
        getMaterialPlanDetail: $http.db({
          _id: 'materialPlanDetailList',
          idField: 'SectionId',
          dataType: 3,
          filter:function(item, sectionId) {
            return item.SectionId = sectionId;
          }
        })
        .bind(function (batchId) {
          return $http.get($http.url('/api/MaterialPlan/GetMaterialPlanAsync?batchId=' + batchId));
        }),
        getMaterialPlanBatchById: function (id) {
          return $http.get($http.url('/api/MaterialPlan/GetMaterialPlanBatchById?id=' + id));
        },
        // GetMaterialPlanBatchByPlanId:function (planId) {
        //   return $http.get($http.url('/api/MaterialPlan/GetMaterialPlanBatchByPlanId?planId='+planId));
        // },
        // GetExcessMaterialExitByPlanId:function (planId) {
        //     return $http.get($http.url('/api/MaterialPlan/GetExcessMaterialExitAsync?planId='+planId));
        // },
        GetMaterialPlanInfolById: function (id) {
          return $http.get($http.url('/api/MaterialPlan/GetMaterialPlanInfolById/' + id));
        },

        //图片
        MaterialFile: $http.db({
          _id: 'materialFile',
          idField: 'Id',
          upload: true
        }).bind(function (data) {
          return $http.post('/api/MaterialPlan/MaterialFileAsync', data);
        }),

        PostCheckInfo: $http.db({
          _id: 'materialPlanCheckInfo',
          idField: 'Id',
          upload: true
        }).bind(function (data) {
          return $http.put('/api/MaterialPlan/InsertCheckInfo', data);
        }),
        PostReportInfo: $http.db({
          _id: 'materialPlanReportInfo',
          idField: 'Id',
          upload: true
        }).bind(function (data) {
          return $http.put('/api/MaterialPlan/InsertReportInfo', data);
        }),
        PostApprovalInfo: $http.db({
          _id: 'materialPlanApprovalInfo',
          idField: 'Id',
          upload: true
        }).bind(function (flag, data) {
          return $http.put('/api/MaterialPlan/InsertApproval?flag=' + flag, data);
        }),
        PostExitInfo: $http.db({
          _id: 'materialExitInfo',
          idField: 'ExitId',
          upload: true
        }).bind(function (data) {
          return $http.post('/api/MaterialPlan/InsertExitInfo', data);
        }),
        IntoFactoryMaterialBatch: $http.db({
          _id: 'materialBatchIntoFactory',
          idField: 'Id',
          upload: true
        }).bind(function (data) {
          return $http.post('/api/MaterialPlan/IntoFactoryMaterialBatch', data);
        }),

        MaterialInspection: $http.db({
          _id: 'materialBatchInspection',
          idField: 'Id',
          dataType: 3,
          upload: true
        }).bind(function (data) {
          return $http.put('/api/MaterialPlan/MaterialInspection', data);
        }),
        materialUnqualifiedExit: $http.db({
          _id: 'materialUnqualifiedExit',
          idField: 'Id',
          dataType: 3,
          upload: true
        }).bind(function (data) {
          return $http.put('/api/MaterialPlan/UnMaterialExit', data);
        }),
        getMaterialBatchProgress: $http.db({
          _id: 'materialBatchProgress',
          idField: 'SectionId',
          dataType: 3
        }).bind(function (sectionId, status, role) {
          return $http.get($http.url('/api/MaterialPlan/GetMaterialBatchProgress', { sectionId: sectionId, status: status, role: role })).then(function (res) {
            return {
              data: {
                SectionId: sectionId,
                Result: res.data
              }
            }
          });
        }, function (res) {
          return {
            data: res.data.Result
          }
        }),
        getBatchProgressById: $http.db({
          _id: 'materialBatchProgress',
          idField: 'Id',
          dataType: 3
        }).bind()
      }
    });
  }

})(angular, undefined);
