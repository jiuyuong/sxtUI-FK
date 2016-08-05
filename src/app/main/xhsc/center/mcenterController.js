/**
 * Created by emma on 2016/6/8.
 */
(function(){
  'use strict';

  angular
    .module('app.xhsc')
    .controller('mcenterController',mcenterController);

  /**@ngInject*/
  function mcenterController($scope,$rootScope,$http,xhUtils,sxt,remote,  utils){

    var vm = this;

    function reloadMessage() {

      remote.message.messageList(0, 0).then(function (result) {

        vm.messages = [];

        //for (var item = 0; item < result.data.count; item++) {
        //  vm.messages.push({
        //    id:sxt.uuid(),
        //    name:'系统',
        //    time:item.SendTime,
        //    title:item.Title,
        //    description:item.Content
        //  });
        //}


        result.data.Items.forEach(function (item) {
          vm.messages.push({
            id: sxt.uuid(),
            name: '系统',
            time: item.SendTime,
            title: item.Title,
            description: item.Content
          });

        })

        //for (var i = 0; i < vm.messages.count; i++) {
        //  vm.messages.push(i);
        //}



      })
    }

    reloadMessage();
    var onMessage = $rootScope.$on('receiveMessage',function(){
      reloadMessage();
    })

    $scope.$on('destroy',function(){
      onMessage();
    })



    console.log(vm.messages)

    vm.messages&&vm.messages.forEach(function(t){
      t.checked = false;
    })
    $scope.$watch('vm.msgList',function(){
      var i=0;
      vm.messages&&vm.messages.forEach(function(t){
        console.log(t.checked)
        if(t.checked){
          i++;
        }
      })
      if(i){
        vm.showSend = true;
      }else{
        vm.showSend  = false;
      }
    },true)

    function operateMsg(ev){

      utils.confirm('确认全部删除?',ev,'','').then(function(){
        remote.message.deleteAllMessage().then(function () {

          utils.alert('删除成功!');
          reloadMessage();

        })

      })


      }
    $rootScope.$on('operateMsg',operateMsg);


  }
})();
