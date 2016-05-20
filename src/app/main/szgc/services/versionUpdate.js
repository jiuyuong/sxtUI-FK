/**
 * Created by leshuangshuang on 16/4/15.
 */
(function() {
  'use strict';

  angular
    .module('app.szgc')
    .service('versionUpdate', versionUpdate);

  function versionUpdate($mdDialog, $cordovaFileTransfer, $cordovaAppVersion, $cordovaFileOpener2,$http){

    this.check = function() {



      //服务器上保存版本信息
      $http.get('http://vkde.sxtsoft.com/api/vkapi/Version')
        .then(function (data) {
          var serverAppVersion = data.data.verInfo;//服务器 版本
          console.log("====>>服务器" + serverAppVersion);

         // $cordovaAppVersion.getVersionNumber().then(function (version) {
          //  console.log("version=====本机>>>" + version + "====>>服务器" + serverAppVersion);

          var version='1.4.4'
            if (version != serverAppVersion) {
              //弹出选择框 是否进行更新


              var confirm = $mdDialog.confirm()
                .title('发现新版本')
                .textContent('是否更新新版本')
                .ok('更新!')//Please do it!
                .cancel('暂不更新');//Sounds like a scam
              $mdDialog.show(confirm).then(function () {

                window.location.replace("https://m.vanke.com/pcStore/detailsPhone/vkappcan10102_1");

            //    // $scope.status = 'You decided to get rid of your debt.';//Please do it!点击更新的事件
            //    var url = "https://vkde.sxtsoft.com:4443/apps/android-release.apk";
            //    var targetPath = "file:///mnt/sdcard/Download/android-release.apk";
            //    var trustHosts = true
            //    var options = {};
            //    $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
            //      $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive'
            //      ).then(function () {
            //      }, function (err) {
            //      });
            //      //$ionicLoading.hide();
            //    }, function (err) {
            //      alert('下载失败');
            //    }, function (progress) {
            //      $timeout(function () {
            //        var downloadProgress = (progress.loaded / progress.total) * 100;
            //        //$ionicLoading.show({
            //        //  template: "已经下载：" + Math.floor(downloadProgress) + "%"
            //        //});
            //        if (downloadProgress > 99) {
            //          //$ionicLoading.hide();
            //        }
            //      })
            //    });
            //
            //  }, function () {
            //    //  $scope.status = 'You decided to keep your debt.';//Sounds like a scam点击暂不更新的事件
            //  });
            //
            //
            //  //$ionicLoading.show({
            //  //  template: "已经下载：0%"
            });

            }
          });
      //  });

    }


}



})();
