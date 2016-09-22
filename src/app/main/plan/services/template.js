/**
 * Created by jiuyuong on 2016/9/22.
 */
(function (angular,undefined) {
  angular
    .module('app.plan')
    .factory('template',template);
  /** @ngInject */
  function template($window) {

    var graphTemplate = new $window.GitGraph.Template({
      colors: [ "#EF9A9A", "#42A5F5", "#26A69A","#CE93D8" ],
      branch: {
        lineWidth: 3,
        spacingX: 60,
        mergeStyle: "straight",
        showLabel: true,                // display branch names on graph
        labelFont: "normal 10pt Arial"
      },
      commit: {
        spacingY: -30,
        dot: {
          size: 10,
          strokeColor: "#000000",
          strokeWidth: 4
        },
        tag: {
          font: "normal 10pt Arial",
          strokeWidth: 1
        },
        message: {
          font: "normal 12pt Arial",
          display:false
        },
        shouldDisplayTooltipsInCompactMode:false,
        tooltipHTMLFormatter:function (commit) {
          return commit.message;
        }
      },
      arrow: {
        size: 8,
        offset: 0.5
      }
    });

    function FTemplate(options) {
      this.options = extend(options, {});
      this.options.config = extend(this.options.config,{
        template:graphTemplate,
        mode:'extend',
        orientation:'vertical'
      });
      this.init();
    }
    FTemplate.prototype.init = function () {
      var gitGraph = this.gitGraph = new GitGraph(this.options.config);
      gitGraph.canvas.addEventListener( "graph:render", function ( event ) {
        //console.log( event.data.id, "graph has been rendered" );
      } );

      gitGraph.canvas.addEventListener( "commit:mouseover", function ( event ) {
        //console.log( "You're over a commit.", event.data );
        this.style.cursor = "pointer";
      } );

      gitGraph.canvas.addEventListener("commit:mouseout", function (event) {
        //console.log( "You just left this commit ->", event.data );
        this.style.cursor = "auto";
      });
    }
    FTemplate.prototype.load = function load(task) {
      this.task = task;
      var groups = [],lines = [],times=[];
      this.line = fillTask(groups,lines,0,task);
      groups.forEach(function (g) {
        if(!g.parentCategoryId){
          appendRoot(times,groups,lines,g);
        }
      });
      this.times = times;
      this.render();
    }
    FTemplate.prototype.onClick = function (e) {
      var data = this.times.find(function (d) {
        return d.categoryId === e.author;
      })
      this.options.onClick && this.options.onClick({e:e,data:data});
    }
    FTemplate.prototype.render = function () {
      this.gitGraph = null;
      this.init();
      var self = this,times = this.times,
        branch = this.branch = [],
        gitGraph = this.gitGraph;
      gitGraph.branches.length = 0;
      gitGraph.commits.length = 0;
      function onClick(e) {
        self.onClick(e);
      }
      function getBranch(line) {
        var b1 = branch.find(function (b) {
          return b.line==line;
        });
        return b1 && b1.b;
      }
      times.forEach(function (t) {
        switch (t.type){
          case 'line':
            branch.push({
              line: t.line,
              b: gitGraph.branch({
                name: t.name || ('b' + branch.length),
                showLabel: !!t.name,
                column: t.line,
                parentBranch: getBranch(t.parent)
              })
            });
            break;
          case 'merge':
            var ix=t.merge.length===1?2:0;
            t.merge.forEach(function (m) {
              getBranch(m).merge(getBranch(t.line),{
                author:t.categoryId,
                tag:ix!==0?t.name:undefined,
                dotSize:ix===0?1:0,
                dotStrokeWidth:ix===0?1:0,
                dotStrokeColor:ix===0?'transparent':0,
                onClick:onClick
              });
              ix++;
            });
            break;
          default:
            if(t.line || t.line===0){
              getBranch(t.line).commit({
                author:t.categoryId,
                tag:t.name,
                message:t.name,
                onClick:onClick
              });
            }
            break;
        }
      });
    }
    FTemplate.prototype.add = function (data,prev,isBranch) {
      var container = !prev||prev.line===0?this.task.master:this.task.branch.find(function (b) {
        return b.indexOf(prev)!=-1;
      });
      if(prev)
        data.parentCategoryId = prev.categoryId;
      if(isBranch){
        this.branch.push([data]);
      }
      else{
        container.push(data);
      }
      this.render();
    }
    FTemplate.prototype.edit = function (data) {
      this.render();
    }
    FTemplate.prototype.remove = function (data) {
      var container = this.task.master.indexOf(data)!=-1?
        this.task.master:
        this.task.branch.find(function (b) {
          return b.indexOf(b)!=-1;
        });
      var index = container.indexOf(data);
      if(index===0 && container===this.task.master && container.length===1){
        this.task.master = [];
        this.task.branch = [];
      }
      else{
        var next = container[index+1];
        next.parentCategoryId = data.parentCategoryId;
        container.splice(index,1);
        this.task.branch.forEach(function (b) {
          if(b[0].parentCategoryId===data.categoryId){
            b[0].parentCategoryId = next.categoryId;
          }
        });
      }
      for(var l=this.task.branch.length-1;l>=0;l--){
        if(this.task.branch[l].length===0){
          this.task.branch.splice(l,1);
        }
      }
      this.render();
    }
    function getLast(array) {
      return array.length?array[array.length-1]:null;
    }
    function extend(obj,ext) {
      obj = obj||{};
      for(var k in ext){
        if(ext.hasOwnProperty(k) && !obj.hasOwnProperty(k)){
          obj[k] = ext[k];
        }
      }
      return obj;
    }
    function appendRoot(times,groups,lines,g) {
      if(g.categoryId && !times.find(function (t) {
          return t.categoryId===g.categoryId;
        })) {
        var line = lines.find(function (l) {
          return l.line === g.line;
        });
        times.push(line);
        times.push(g);
      }
      appendTask(times,groups,lines,g);
    }
    function appendTask(times,groups,lines,gp) {
      if(!gp || !gp.categoryId) return;
      var fds = groups.filter(function (g) {
        return g.parentCategoryId === gp.categoryId;
      });
      fds.sort(function (s1,s2) {
        if(s1.line===gp.line)
          return 1;
        if(s2.line===gp.line)
          return -1;
        return 0;
      }).forEach(function (fd) {
        var ends = fd.categoryId && groups.filter(function (g) {
            return g.endFlagCategoryId === fd.categoryId;
          });
        ends.forEach(function (e) {
          if(!fd.merge) {
            fd.merge = [];
            fd.type = 'merge';
          }
          fd.merge.push(e.line);
          //var eRoot = findLineRoot(groups,e);
          //appendRoot(times,groups,lines,eRoot);
        })
        if(fd.line != gp.line){
          var line = lines.find(function (l) {
            return l.line === fd.line;
          });
          line.parent = gp.line;
          times.push(line);
        }
        if(fd.categoryId && times.find(function (g) {
            return g.categoryId===fd.categoryId;
          })) {
          return;
        }
        times.push(fd);
        appendTask(times, groups, lines, fd);
        //
        /*      if(fd.endFlagCategoryId){
         var ed = groups.find(function (g) {
         return g.categoryId === fd.endFlagCategoryId;
         });
         if(ed){
         var eRoot = findLineRoot(groups,ed);
         appendRoot(times,groups,lines,eRoot);
         }
         }*/
      });
      /*    fds.forEach(function (fd) {
       appendTask(times, groups, lines, fd);
       })*/
    }
    function findLineRoot(groups,g1) {
      var prev = groups.find(function (g) {
        return g.line===g1.line && g1.parentCategoryId===g.categoryId;
      });
      return prev?findLineRoot(groups,prev):g1;
    }
    function fillTask(groups,lines,t,task,parent) {
      var t2 = t;
      task.type = 'line';
      task.line = t2;
      lines.push(task);
      var prev = null;
      var laskTask;
      task.master && task.master.forEach(function (g) {
        g.parentCategoryId = prev ? prev.categoryId : parent && parent.categoryId;
        prev = g;
        g.line = t2;
        groups.push(g);

        if (laskTask) {
          laskTask.endFlagCategoryId = g.categoryId;
          laskTask = null;
        }
        g.tasks && g.tasks.forEach(function (tk) {
          if (tk.master.length) {
            tk.master[0].parentCategoryId = g.categoryId;
            laskTask = tk.master[tk.master.length - 1];
            t = fillTask(groups, lines, t + 1, tk, g);
          }
        });
      });
      task.branch && task.branch.forEach(function (b) {
        lines.push({
          type:'line',
          line:(++t)
        });
        b.forEach(function (g) {
          g.line = t;
          groups.push(g);
          g.tasks && g.tasks.forEach(function (tk) {
            t = fillTask(groups,lines,t+1,tk,g);
          })
        });
      });

      return t;
    }
    return FTemplate;
  }
})(angular,undefined)
