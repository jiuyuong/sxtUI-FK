/**
 * Created by jiuyuong on 2016/9/26.
 */
(function (angular, undefined) {
  'use strict';

  angular
    .module('app.plan')
    .config(config);

  /** @ngInject */
  function config(apiProvider) {
    var $http = apiProvider.$http,
      $q = apiProvider.$q;
    apiProvider.register('plan',{

    });
  }
})(angular,undefined);
