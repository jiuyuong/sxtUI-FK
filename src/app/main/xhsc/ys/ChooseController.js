/**
 * Created by jiuyuong on 2016/3/30.
 */
(function(){
  'use strict';

  angular
    .module('app.xhsc')
    .controller('ChooseController',ChooseController);

  /** @ngInject */
  function ChooseController($scope,$stateParams,db,$rootScope,xhUtils){
    var vm=this,
      id = $stateParams.assessmentID;

    var pk = db('pack'+id);
    
  }

})();
