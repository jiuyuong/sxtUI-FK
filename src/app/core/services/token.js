﻿/**
 * Created by jiuyuong on 2016/1/22.
 */
(function(){
  'use strict';
  angular
    .module('app.core')
    .factory('authToken',authToken);
  /** @ngInject */
  function authToken($cookies,$rootScope,$injector,$timeout){
    var token,tokenInjector,_401,lastTipTime,
      lastRequestTime={},isNetworking;

    tokenInjector = {
      setToken      : setToken,
      getToken      : getToken,
      request       : onHttpRequest,
      response      : onResponse,
      responseError : onHttpResponseError,
      on401         : on401
    };

    return tokenInjector;

    function setToken(tk){
      token = tk && tk.access_token ? (tk.token_type||'Bearer') + ' ' + tk.access_token : null;
      if(token)
        $cookies.put('token',token);
      else
        $cookies.remove('token');
    }

    function getToken(){
      if(!token)
        token = $cookies.get('token');
      return token;
    }

    function onHttpRequest(config){
      var token = getToken();
      if(token && !config.headers['Authorization'])
        config.headers['Authorization'] = token;
      if(config.url.indexOf('api')!=-1) {
        lastRequestTime[config.url] = $timeout(function () {
          isNetworking = true;
          console.log('isNetworking',isNetworking)
          $rootScope.$emit('sxt:onNetworking', config);
        }, 5000);
      }
      return config;
    }

    function onResponse(response) {
      cancelNetworking(response.config);
      return response;
    }

    function cancelNetworking(config) {
      if(lastRequestTime[config.url]) {
        cancelNetworking(config.url);
        $timeout.cancel(lastRequestTime[config.url]);
        delete lastRequestTime[config.url];
        if (isNetworking) {
          $rootScope.$emit('sxt:cancelNetworking');
        }
      }
    }


    function onHttpResponseError(rejection) {
      cancelNetworking(rejection.config);
      if(rejection.status == -1){
        $rootScope.$emit('$cordovaNetwork:setNetwork',1);
      }
      if (rejection.status == 401 && !rejection.config.isRetry) {
        if (_401) {
          rejection.config.isRetry = true;
          return _401.call(tokenInjector, rejection).then(function () {
            return $injector.get('$http')(rejection.config);
          }).catch(function () {
            $rootScope.$emit('user:needlogin');
          });
        }
        else {
          $rootScope.$emit('user:needlogin');
        }
      }
      else {
        if (rejection && rejection.status != -1 && rejection.status != 401) {
          if (!lastTipTime || new Date().getTime() - lastTipTime < 10000) {
            lastTipTime = new Date().getTime();
            $injector.invoke(['utils', function (utils) {
              utils.alert(rejection.data && rejection.data.Message ? rejection.data.Message : '网络错误');
            }]);
          }
        }
      }
    }

    function on401(fn) {
      _401 = fn;
    }

  }
})();
