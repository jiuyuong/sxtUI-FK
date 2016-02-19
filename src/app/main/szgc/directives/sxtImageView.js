/**
 * Created by zhangzhaoyong on 16/2/16.
 */
(function(){
  'use strict';

  angular
    .module('app.szgc')
    .directive('sxtImageView',sxtImageViewDirective);

  /** @ngInject */
  function sxtImageViewDirective(){
    return {
      restrict:'EA',
      scope:{
        imageData:'=sxtImageView'
      },
      link:link
    }

   function link(scope,element,attr,ctrl){

      element.click(function(e){

        var preview,defaultIndex = 0;
        var imagedata = scope.imageData;
        if(!imagedata){
          imagedata=[];
          $('img',element).each(function(index,el){
            imagedata.push($(el).attr('src'));
          })
          defaultIndex = $('img',element).index($(e.target))
          if(defaultIndex==-1)
            defaultIndex=0;
        }
        var str=[];
        str.push('<div class="piclayer">\
        <div class="swiper-container"><div class="swiper-wrapper">')
        angular.forEach(imagedata, function(data){
          var arl=data;
          str.push('<div class="swiper-slide"><p><img src="'+arl+'"></p></div>');
        });
        str.push('</div><div class="swiper-pagination"></div></div></div>');
        var o = $(str.join('')).appendTo('body')
        //$('body').append(o);

        var iWidth=$(window).width();
        var iHeight=$(window).height();

        var iSh=iHeight;//-150;

        $('.swiper-container').width(iWidth+'px');
        $('.swiper-container').height(iSh+'px');
        $('.swiper-slide').height(iSh+'px');
        $('.swiper-slide p').height(iSh+'px');//.css('line-height',iSh+'px');

        preview = new Swiper(o.find('.swiper-container')[0], {
          initialSlide:defaultIndex,
          pagination: '.swiper-pagination',
          paginationClickable: true
        });//'.swiper-container'
        o.find('.pic_close button').click(function(){
          //preview.destroy();
          //o.remove();
        })
        //$('.picplayer').is(':visible')
        if($('.piclayer').css('display')){
          $('body .swiper-container').click(function(e){
            preview.destroy();
            o.remove();
            e.preventDefault();
          })


        }

      });
      scope.$on('destroy',function(){
        o.remove();
        preview.destroy();
      });
    }
  }
})();
