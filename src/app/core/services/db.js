/**
 * Created by jiuyuong on 2016/4/28.
 */
(function(angular){
  'use strict';

  angular
    .module('app.core')
    .provider('db',adapter);

  function adapter() {
    var $get;
    if (!window.cordova) {
      $get = new pouchDB().$get;
    }
    else {
      $get =new db().$get;
    }
    var self = this;
    self.$get = $get;
  }


/** @ngInject */
  function pouchDB() {

  var self = this;
  self.methods = {
    destroy: 'qify',
    put: 'qify',
    post: 'qify',
    get: 'qify',
    remove: 'qify',
    bulkDocs: 'qify',
    bulkGet: 'qify',
    allDocs: 'qify',
    putAttachment: 'qify',
    getAttachment: 'qify',
    removeAttachment: 'qify',
    query: 'qify',
    viewCleanup: 'qify',
    info: 'qify',
    compact: 'qify',
    revsDiff: 'qify',
    changes: 'eventEmitter',
    sync: 'eventEmitter',
    replicate: {
      to: 'eventEmitter',
      from: 'eventEmitter'
    },
    add:function () {
      var args = Array.prototype.slice.call(arguments);
      this.create(args);
    },
    addOrUpdate:function(obj){
      var self = this;
      if(obj._id){
        return self.get(obj._id).then(function(doc){
          obj._rev = doc._rev;
          return self.put(obj);
        }).catch(function(){
          return self.put(obj);
        });
      }
    },
    bulkAddOrUpdate:function(arr){
     var self=this;
     return this.findAll().then(function(o){
         var  rows= o.rows,tmp;
         arr.forEach(function(t){
            if (t._id){
              tmp=rows.find(function(e){ return t._id= e._id });
              if (tmp){
                t._rev=tmp._rev
              }
            }
         })
         return self.bulkDocs(arr);
      });
    },
    getOrAdd:function (obj) {
      var self = this;
      if(obj._id){
        return self.get(obj._id).then(function(doc){
          return doc;
        }).catch(function(){
          return self.put(obj).then(function () {
            return obj;
          });
        });
      }
    },
    update:function (obj) {
      var self = this;
      if(obj._id){
        return self.get(obj._id).then(function(doc){
          obj._rev = doc._rev;
          return self.put(obj);
        });
      }
      //this.create(Array.prototype.slice.call(arguments));
    },
    create:function(obj){
      if(!angular.isArray(obj)){
        obj = [obj];
      }
      obj.forEach(function (o) {
        if(!o._id)
          o._id = o.id;
      });
      return this.bulkDocs(obj);
    },
    delete:function (id) {
      var db = this;
      return db.get(id).then(function (doc) {
        return db.remove(doc);
      });
    },
    findAll:function (filter,options) {
      if (!options){
        options={};
      }
      if (!options.include_docs){
        options.include_docs=true;
      }
      return _allDoc.apply(this,[filter,options])
    },
    find:function (filter,option) {
      var def={include_docs:true};
      if (angular.isObject(option)){
        angular.extend(def,option);
      }
      return this.allDocs(def).then(function (result) {
        for(var i=0,l=result.rows.length;i<l;i++){
          if(!filter || filter(result.rows[i].doc)!==false){
            return result.rows[i].doc;
          }
        }
      })
    }
  };

  function _allDoc (filter,option){
    return this.allDocs(option).then(function (result) {
      var r = {
        "total_rows":result.total_rows,
        "offset":result.offset,
        "rows":[],
        "_id":result._id,
        "_rev":result._rev
      }
      for(var i=0,l=result.rows.length;i<l;i++){
        if(!filter || filter(result.rows[i].doc)!==false){
          r.rows.push(result.rows[i].doc);
        }
      }
      return r;
    })
  }

  self.$get = $get;

  /** @ngInject */
  function $get($window, $q,sxtlocaStorage) {
    // PouchDB.plugin(PouchAdapterCordovaSqlite);
    var pouchDBDecorators = {
      qify: function (fn) {
        return function () {
          return $q.when(fn.apply(this, arguments));
        }
      },
      eventEmitter: function (fn) {
        return function () {
          var deferred = $q.defer();
          var emitter = fn.apply(this, arguments)
            .on('change', function (change) {
              return deferred.notify({
                change: change
              });
            })
            .on('paused', function (paused) {
              return deferred.notify({
                paused: paused
              });
            })
            .on('active', function (active) {
              return deferred.notify({
                active: active
              });
            })
            .on('denied', function (denied) {
              return deferred.notify({
                denied: denied
              });
            })
            .on('complete', function (response) {
              return deferred.resolve(response);
            })
            .on('error', function (error) {
              return deferred.reject(error);
            });
          emitter.$promise = deferred.promise;
          return emitter;
        };
      }
    };
    function wrapMethods(db, methods, parent) {
      for (var method in methods) {
        var wrapFunction = methods[method];


        if(angular.isFunction(wrapFunction)){
          db[method] = wrapFunction;
          continue;
        }

        if (!angular.isString(wrapFunction)) {
          wrapMethods(db, wrapFunction, method);
          continue;
        }

        wrapFunction = pouchDBDecorators[wrapFunction];

        if (!parent) {
          db[method] = wrapFunction(db[method]);
          continue;
        }

        if (db[parent]&&db[parent][method]){
          db[parent][method] = wrapFunction(db[parent][method]);
        }
      }
      return db;
    }
    return function pouchDB(name) {
      var dbs= sxtlocaStorage.getItem("dbs");
      if (!dbs){
        dbs=[];
        dbs.push(name);
        sxtlocaStorage.setItem("dbs",dbs);

      }else {
        dbs=dbs.split(",");
        if (!dbs.find(function (o) {
            return name==o;
          })){
          dbs.push(name);
          sxtlocaStorage.setItem("dbs",dbs);
        }
      }
      // var db = new $window.PouchDB(name,{
      //   adapter: 'cordova-sqlite',
      //   iosDatabaseLocation: 'Library'
      // });
      var db = new $window.PouchDB(name);
      return wrapMethods(db, self.methods);
    };
  };

  function toDoc(doc) {
    if(doc instanceof Error)
      return doc;
    return doc;
  }
  function now() {
    return new Date().toISOString();
  }

  function addTimestamps(object) {
    object.updatedAt = now();
    object.createdAt = object.createdAt || object.updatedAt

    if (object._deleted) {
      object.deletedAt = object.deletedAt || object.updatedAt
    }

    return object
  }
}

  /** @ngInject */
  function db() {
    getApi.$inject = ["$q", "$window", "$cordovaFileTransfer", "$timeout", "$cordovaFile", "$rootScope"];
    var provider = this,globalDb={
      id:'sxt-global'
    };
    var poolss = {};

    function  cache() {
      var defaultOptions={
        timeout:60000
      }

      function  _cache() {
        this.cacheContainer={};
        this.options=defaultOptions;
        this.clearfun={};
      }

      _cache.prototype.setOption=function (options) {
        if (angular.isObject(options)){
          this.options=angular.extend(this.options,options)
        }
      }

      _cache.prototype.clear=function (key) {
        if (!key){
          this.cacheContainer={};
        }else {
          if (this.cacheContainer.hasOwnProperty(key)){
            this.cacheContainer[key]=null;
          }
        }

      }


      _cache.prototype.getValue=function (key) {
        var self=this;
        if (this.clearfun.hasOwnProperty(key)&&this.clearfun[key]){
          clearTimeout(this.clearfun[key]);
        }
        this.clearfun[key]=setTimeout(function () {
          self.clear(key);
        },self.options.timeout);
        if (key&&this.cacheContainer.hasOwnProperty(key)){
          return this.cacheContainer[key];
        }
        return null;
      }

      _cache.prototype.setValue=function (key,value) {
        var self=this;
        if (!key){
          return;
        }
        if (this.clearfun.hasOwnProperty(key)&&this.clearfun[key]){
          clearTimeout(this.clearfun[key]);
        }
        this.clearfun[key]=setTimeout(function () {
          self.clear(key);
        },self.options.timeout);
        self.cacheContainer[key]=value;
      }

      return new  _cache();
    }
    provider.$get = getApi;
    /** @ngInject */
    function getApi($q, $window, $cordovaFileTransfer, $timeout,$cordovaFile,$rootScope) {
      provider.cache=cache();
      provider.$q = $q;
      provider.$cordovaFileTransfer = $cordovaFileTransfer;
      provider.$timeout = $timeout;
      provider.$window = $window;
      provider.$rootScope = $rootScope;
      provider.$cordovaFile = $cordovaFile;
      return function pouchDB(name, options) {
        var dbs= window.localStorage.getItem("dbs");
        if (!dbs){
          dbs=[];
          dbs.push(name);
          window.localStorage.removeItem("dbs");
          window.localStorage.setItem("dbs",dbs);

        }else {
          dbs=dbs.split(",");
          if (!dbs.find(function (o) {
              return name==o;
            })){
            dbs.push(name);
            window.localStorage.removeItem("dbs");
            window.localStorage.setItem("dbs",dbs);
          }
        }
        return new SingleDB({
          idField:'_id',
          _id:name,
          dataType:1,
          fileField:options && options.fileField
        });
      };
    }


    function SingleDB(cfg) {
      var self = this;
      self.cfg = cfg;
      var idIsFunction = angular.isFunction(cfg.idField);
      self.idFn = function (item) {
        return angular.isObject(item) ? (idIsFunction ? cfg.idField(item) : item[cfg.idField]) : item;
      };
    }

    SingleDB.prototype.destroy = function(){
      var self = this;
      if (self.cfg.fileField){
        return provider.$q(function (resolve,reject) {
          db_findAll(self.cfg).then(function (r) {
            if (r.rows && r.rows.length){
              r.rows.forEach(function (m) {
                get_globalDb().destroy(m._id)
              })
            }
            get_globalDb().destroy(self.cfg._id).then(function () {
              resolve();
            })
          }).catch(function () {
            get_globalDb().destroy(self.cfg._id).then(function () {
              resolve();
            })

          })
        })
      }else {
        return get_globalDb().destroy(self.cfg._id);
      }

    }
    SingleDB.prototype.clear = function(){
      return get_globalDb().clear();
    }
    SingleDB.prototype.findAll = function (filter) {
      var self = this;
      return db_findAll(this.cfg, filter).then(function (r) {
        if(self.cfg.fileField && r.rows && r.rows.length){
          var task=[];
          // return $q(function (resolve,reject) {
          //
          // })
          r.rows.forEach(function (k) {
            task.push(get_globalDb().get(k._id))
          })
          return provider.$q.all(task).then(function (res) {
             r.rows=[];
             res.forEach(function (m) {
               r.rows.push(m)
             })
            return r;
          })
        }
        return r;
      });
    }
    SingleDB.prototype.delete = function (id) {
      if (!angular.isArray(id))
        id = [id];

      return db_save({
        _id: this.cfg._id,
        delete: !0,
        fileField:this.cfg.fileField,
      }, id, this.idFn);
    }
    SingleDB.prototype.addOrUpdate = function (items) {
      var cfg = this.cfg;
      if (cfg.dataType == 3)
        return db_save(this.cfg, items, this.idFn);

      if (!angular.isArray(items))
        items = [items];
      return db_save({_id: cfg._id, fileField:cfg.fileField, upload: !0}, items, this.idFn);
    }
    SingleDB.prototype.bulkAddOrUpdate=function(arr){
      return db_save(this.cfg,arr,this.idFn);
    }
    SingleDB.prototype.getOrAdd=function (obj) {
      return this.addOrUpdate(obj).then(function () {
        return obj;
      });
    };
    SingleDB.prototype.saveItems = function (result) {
      return db_save(this.cfg, result, this.idFn);
    }
    SingleDB.prototype.get = function (id) {
      var self = this;
      return self.findAll(function (item) {
        return  (id && self.idFn(item) == id) || (self.cfg.filter && self.cfg.filter(id)) ||self.cfg.single===true;
      }).then(function (r) {
        if(self.cfg.fileField && r.rows && r.rows[0]){
          return get_globalDb().get(r.rows[0]._id)
        }
        return r.rows[0];
      });
    }
    SingleDB.prototype.allDocs = function () {
      return provider.$q(function (resolve) {
        resolve();
      })
    }

    function get_globalDb() {
      if(!globalDb.db && provider.$window.cordova){
        globalDb.db = (function () {
          var cache = {}, locks = {};
          return {
            get: get,
            put: put,
            allDocs: function () {
              return provider.$q(function (resolve) {
                resolve();
              })
            },
            clear: function () {
              provider.cache.clear();
              return provider.$cordovaFile.removeRecursively(provider.$window.cordova.file.dataDirectory, "")
                .then(function (success) {
                  alert(success);
                }, function (error) {
                  console.log(error);
                });
            },
            destroy: function (id) {
              delete cache[id];
              provider.cache.clear(id);
              return provider.$q(function (resolve, reject) {
                lock(id, function (cb) {
                  if(!provider.$window.cordova){
                    resolve();
                  }
                  else {
                    provider.$cordovaFile.removeFile(provider.$window.cordova.file.dataDirectory, id + '.bin').then(function () {
                      resolve();
                      cb();
                    }).catch(function () {
                      resolve();
                      cb();
                    })
                  }
                })
              });
            }
          }
          function lock(id, doFn) {
            var cb = function () {
              var buff = locks[id];
              buff.shift();
              run();
            }, run = function () {
              var buff = locks[id];
              if (buff && buff.length) {
                if (!buff.find(function (fn) {
                    return fn.runing === true;
                  })) {
                  var fn = locks[id][0];
                  fn.runing = true;
                  fn(cb);
                }
              }
            };
            if (!locks[id]) {
              locks[id] = [];
            }
            locks[id].push(doFn);
            run();
          }

          function get(id, cfg) {
            return provider.$q(function (resolve, reject) {
              lock(id, function (cb) {
                var value=provider.cache.getValue(id);
                if (value){
                  cb();
                  resolve(value)
                }else {
                  provider.$cordovaFile.readAsText(provider.$window.cordova.file.dataDirectory,id + '.bin').then(function (result) {
                      if (!result){
                        readText(provider.$window.cordova.file.dataDirectory,id + '.bin').then(function (k) {
                          var r = provider.$window.JSON.parse(k);
                          provider.cache.setValue(id,r);
                          cb();
                          resolve(r);
                        },function () {
                          cb();
                          reject(null);
                        });
                      }else {
                        var r = provider.$window.JSON.parse(result);
                        provider.cache.setValue(id,r);
                        cb();
                        resolve(r);
                      }
                  },function () {
                    cb();
                    reject(null);
                  })
                }
              })
            });
          }




          function utf8ByteToUnicodeStr(utf8Bytes) {
            var unicodes = [];
            for (var pos = 0; pos < utf8Bytes.length;){
              var flag= utf8Bytes[pos];
              var unicode = 0 ;
              if ((flag >>>7) === 0 ) {
                unicodes.push(String.fromCharCode(utf8Bytes[pos]));
                pos += 1;

              } else if ((flag &0xFC) === 0xFC ){
                unicode = (utf8Bytes[pos] & 0x3) << 30;
                unicode |= (utf8Bytes[pos+1] & 0x3F) << 24;
                unicode |= (utf8Bytes[pos+2] & 0x3F) << 18;
                unicode |= (utf8Bytes[pos+3] & 0x3F) << 12;
                unicode |= (utf8Bytes[pos+4] & 0x3F) << 6;
                unicode |= (utf8Bytes[pos+5] & 0x3F);
                unicodes.push(String.fromCharCode(unicode));
                pos += 6;

              }else if ((flag &0xF8) === 0xF8 ){
                unicode = (utf8Bytes[pos] & 0x7) << 24;
                unicode |= (utf8Bytes[pos+1] & 0x3F) << 18;
                unicode |= (utf8Bytes[pos+2] & 0x3F) << 12;
                unicode |= (utf8Bytes[pos+3] & 0x3F) << 6;
                unicode |= (utf8Bytes[pos+4] & 0x3F);
                unicodes.push(String.fromCharCode(unicode));
                pos += 5;

              } else if ((flag &0xF0) === 0xF0 ){
                unicode = (utf8Bytes[pos] & 0xF) << 18;
                unicode |= (utf8Bytes[pos+1] & 0x3F) << 12;
                unicode |= (utf8Bytes[pos+2] & 0x3F) << 6;
                unicode |= (utf8Bytes[pos+3] & 0x3F);
                unicodes.push(String.fromCharCode(unicode));
                pos += 4;

              } else if ((flag &0xE0) === 0xE0 ){
                unicode = (utf8Bytes[pos] & 0x1F) << 12;
                unicode |= (utf8Bytes[pos+1] & 0x3F) << 6;
                unicode |= (utf8Bytes[pos+2] & 0x3F);
                unicodes.push(String.fromCharCode(unicode));
                pos += 3;

              } else if ((flag &0xC0) === 0xC0 ){ //110
                unicode = (utf8Bytes[pos] & 0x3F) << 6;
                unicode |= (utf8Bytes[pos+1] & 0x3F);
                unicodes.push(String.fromCharCode(unicode));
                pos += 2;

              } else{
                unicodes.push(String.fromCharCode(utf8Bytes[pos]));
                pos += 1;
              }
            }
            return unicodes.join('');
          }


          function readText(dir,fileName) {
            return  provider.$q(function (resolve,reject) {
              provider.$cordovaFile.readAsArrayBuffer(dir, fileName).then(function (data) {
                  var arr= new Uint8Array(data);
                  var  res=utf8ByteToUnicodeStr(arr);
                  resolve(res);

              }).catch(function (err) {
                reject(err);
              })

            })
          }

          function put(doc, cfg) {
            //if((!cfg || !cfg.upload) && !globalDb.noCache && !cfg.fileField)
            //  cache[doc._id] = doc;

            //if(cfg && cfg.upload && cache[doc._id])
            //  delete cache[doc._id];
            provider.cache.setValue(doc._id,doc);
            return provider.$q(function (resolve, reject) {
              lock(doc._id, function (cb) {
                provider.$cordovaFile.writeFile(provider.$window.cordova.file.dataDirectory, doc._id + '.bin',provider.$window.JSON.stringify(doc) , true)
                  .then(function (result) {
                    resolve(result)
                    cb();
                  }).catch(function (result) {
                  reject(result);
                  cb();
                })
              })
            });
          }
        })();
      }
      return globalDb.db || (globalDb.db = pouchdb(globalDb.id));
    }

    function db_findAll(cfg, filter) {
      var db = get_globalDb();
      return provider.$q(function (resolve, reject) {
        var result = {
          "rows": []
        };
        db.get(cfg._id,cfg).then(function (r) {
          for (var i = 0, l = r.rows.length; i < l; i++) {
            if (!filter || filter(r.rows[i]) !== false) {
              result.rows.push(r.rows[i]);
            }
          }
          resolve(result);
        }).catch(function () {
          resolve(result);
        });
      })
    }

    function copySave(obj,exFields) {
      var o = {};
      for(var k in obj){
        if(obj.hasOwnProperty(k) && exFields.indexOf(k)==-1){
          o[k] = obj[k];
        }
      }
      return o;
    }

    function db_save(cfg, result, idFn) {
      return provider.$q(function (resolve, reject) {
        var pools = poolss[cfg._id];
        if(!pools)
          pools = poolss[cfg._id] = [];
        pools.push(task(cfg,result,idFn));
        if(pools.length===1){
          run();
        }
        function run() {
          var first = pools[0];
          if(first) {
            first().then(function (r) {
              pools.shift();
              return r;
            },function (r) {
              pools.shift();
              provider.$q.reject(r);
            }).then(run, run);
          }
        }
        function task(cfg, result, idFn) {
          return function () {
            return db_save1(cfg, result, idFn).then(resolve,reject);
          }
        }
      });
    }
    function db_save1(cfg, result, idFn) {
      if(!result) return provider.$q(function (resolve, reject) {resolve()});
      var db = get_globalDb();
      return provider.$q(function (resolve, reject) {
        db.get(cfg._id,cfg).then(save_to).catch(save_to);
        function save_to(doc) {
          provider.$q(function (resolve, reject) {
            if (cfg.fileField) {
              if (!angular.isArray(cfg.fileField)) {
                cfg.fileField = [cfg.fileField];
              }
              var _saveList = [],
                nResult;
              if (angular.isArray(result)) {
                nResult = [];
                result.forEach(function (r) {
                  r._id = idFn(r);
                  _saveList.push(db.put(r, {
                    upload: true
                  }));
                  nResult.push(copySave(r, cfg.fileField));
                })
              }
              else {
                result._id = idFn(result);
                nResult = copySave(result, cfg.fileField);
                _saveList.push(db.put(result, {
                  upload: true
                }));
              }
              provider.$q.all(_saveList).then(function () {
                resolve(nResult);
              }, function () {
                resolve(nResult);
              });
            }
            else {
              resolve(result);
            }
          }).then(function (result) {
            if (!doc || !doc.rows)
              doc = {_id: cfg._id, rows: []};

            if (cfg.delete) {
              result.forEach(function (item) {
                delete_db(item, doc.rows, idFn);
              });
            }
            else {
              if (cfg.upload || cfg.dataType == 1) {
                if(angular.isArray(result))
                  replace_db(result, doc.rows, idFn);
                else
                  replace_db_single(result, doc.rows, idFn);
              }
              /*          else if (cfg.dataType == 1) {
               replace_db(result, doc.rows, idFn);
               }*/
              else if (cfg.dataType == 3) {
                if (cfg.single)
                  doc.rows = [result];
                else
                  replace_db_single(result, doc.rows, idFn);
              }
              else if (result.rows && angular.isArray(result.rows)) {
                replace_db(result.rows, doc.rows, idFn);
              }
              else if (result.data && angular.isArray(result.data)) {
                replace_db(result.data, doc.rows, idFn);
              }
              else if (result.Rows && angular.isArray(result.Rows)) {
                replace_db(result.Rows, doc.rows, idFn);
              }
            }
            return db.put(doc, cfg).then(resolve, reject);

          });
        }
      });

      function replace_db(src, dist, id) {
        src.forEach(function (item) {
          replace_db_single(item, dist, id);
        });
      }

      function replace_db_single(item, dist, id) {
        var _id = id(item), flag = false;
        for (var i = 0, l = dist.length; i < l; i++) {
          if (_id == id(dist[i])) {
            dist[i] = item;
            flag = true;
            break;
          }
        }
        if (!flag) {
          dist.push(item);
        }
      }
      function delete_db(item, dist, id) {
        var _id = id(item);
        for (var i = 0, l = dist.length; i < l; i++) {
          if (_id == id(dist[i])) {
            dist.splice(i, 1);
            break;
          }
        }
      }
    }
  }
})(angular);
