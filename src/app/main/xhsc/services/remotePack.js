/**
 * Created by jiuyuong on 2016/5/6.
 */
(function () {
  'use strict';

  angular
    .module('app.xhsc')
    .factory('remotePack',remotePack);

  /** @ngInject */
  function remotePack(db,$q,$http,$rootScope,$cordovaFileTransfer,sxt) {
    function Pack(config) {
      var self = this;
      self._id = config._id;
      self.db= {};
      self.max = config.max||20;
      self.status = 0;

      for(var k in config.db){
        self[k] = config.db[k];
        self[k].db = db('Pack'+config._id+k);
      }
    }
    Pack.prototype.upload = function (process) {
      var self = this;
      if(self.isUp)return;
      self.isUp = true;
      self.tasks = [];
      var when=[],dbs=[];
      for(var k in self){
        if(self.hasOwnProperty(k)) {
          var m = self[k];
          if (m.db) {
            dbs.push(m);
            when.push(m.db.findAll());
          }
        }
      }
      $q.all(when).then(function (results) {
        var i = 0;
        results.forEach(function (r) {
          r.rows.forEach(function (t) {
            self.tasks.push({
              data:t,
              url:dbs[i].url,
              index:dbs[i].index||0
            })
          });
          i++;
        });
        self.tasks.sort(function (s1,s2) {
          return s1.index - s2.index;
        });
        self.upTask(process);
      });
    };
    Pack.prototype.getNexts = function (process) {
      var self = this,
        url,tasks=[],type,p=0;
      self.tasks.forEach(function (task) {

        if(task.completed || (task.try && task.try>3 ) ||(type && type=='file') ||(type && type=='fileurl')) {
          p++;
          return;
        }
        if(!url)
          url = task.url;

        if(url==task.url &&  tasks.length<self.max && (!type || type==task.type)){
          //p++;
          tasks.push(task);
        }
        if(!type)
          type = task.type;
      });
      process && process(parseInt( p/self.tasks.length*100));

      return tasks;
    }
    Pack.prototype.upTask = function (process) {
      var self = this,
        tasks = self.getNexts(process);
      if(!tasks.length){
        self.isUp = false;
        self.completed = !self.tasks.find(function (t) {
          return !t.completed;
        });
        process && process(-1);
        return;
      }

      var url=tasks[0].url,
        type = tasks[0].data.type;
      if(type === 'file'){
        $cordovaFileTransfer.upload(url,tasks[0].data.local).then(function () {
          tasks[0].completed = true;
          self.upTask(process);
        },function (err) {
          tasks[0].try = (tasks[0].try||0)+1;
          self.upTask();
        },function (progress) {
          tasks[0].progress = (progress.loaded / progress.total) * 100;
          // (progress.loaded / progress.total) * 100
        });
      }
      else{
        var data=[];
        tasks.forEach(function (item) {
          data.push(item.data);
        });
        $http.post(url,data).then(function () {
          tasks.forEach(function (task) {
            task.completed = true;
          });
          self.upTask(process);
        }).catch(function (err) {
          tasks.forEach(function (task) {
            task.try = (task.try||0)+1;
          });
          self.upTask(process);
        });
      }
    }

    var o = {
      packages:{},
      pack:function (config) {
        var pack = o.packages[config._id] = o.packages[config._id]||new Pack(config);
        return pack;
      },
      unPack:function (id) {
        delete o.packages[id];
      }
    }
    return o;
  }
})();
