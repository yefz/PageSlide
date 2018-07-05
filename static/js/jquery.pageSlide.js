;(function ($) {
  "use strict"; // 严格模式

  // 构造函数
  var PageSlide = (function () {

    function PageSlide (element, options) {

      // this 指向选择器返回的 DOM 元素集
      this.element = element;
      // 合并配置参数
      this.settings = $.extend({}, $.fn.PageSlide.defaults, options || {});

      console.log(this.settings);
      // 执行初始化方法
      this.init();
    }

    // 将插件常用方法包装到对象上
    PageSlide.prototype = {

      // todo: 初始化页面布局及事件绑定
      init: function () {
        var me = this,               // this 多次调用，缓存起来
            userAgent = navigator.userAgent;

        // 获取 DOM 元素
        me.selector = me.settings.selector;
        me.items = me.element.find(me.selector.items);  // 容器
        me.item = me.items.find(me.selector.item);      // 子项
        me.pages = me.element.find(me.selector.pages);  // 分页

        // 获取索引
        me.index = (me.settings.index >= 0 && me.settings.index < me.pageCount()) ? me.settings.index : 0;
        // 获取浏览器信息


        if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1) {
          me.isIE8 = navigator.userAgent.toLowerCase().match(/msie ([\d.]+)/)[1] == "8.0" ? true : false;
        }


        me._initLayout(); // 页面布局
        me._initEvent();  // 事件绑定
        me._autoPlay();

      },

      // todo: 获取页面总数
      pageCount: function () {
        return this.item.length;
      },

      // todo: 上一页
      prev: function () {
        var me = this;
        me.index--;
        me._switchPage();
      },

      // todo: 下一页
      next: function () {
        var me = this;
        me.index++;
        me._switchPage();

      },

      // todo: 页面布局
      _initLayout: function () {
        var me = this;

        // 分页布局
        if (me.settings.pages) {

          // 生成分页控制点
          var spans = "";
          for (var i = 0; i < me.pageCount(); i++) {
            spans += "<span></span>"
          }
          me.pages.append(spans);

          me.pages.children("span").eq(me.index).addClass("on"); // 高亮当前索引控制点

          // 生成左右切换按钮
          if (me.settings.pagesArrows) {
            me.element.append('<div class = "btn L">&lt;</div><div class = "btn R">&gt;</div>');
          }
        }

        // 子页横向布局
        me.items.css("width", (me.pageCount() + 1) * 100 + "%");
        me.item.push(me.item.eq(0).clone().appendTo(me.items)); // 追加首元素至末尾, 用以css无缝切换
        me.item.each(function () {
          $(this).css("width", 100 / (me.pageCount()) + "%");
        });

      },

      // todo: 事件绑定
      _initEvent: function () {
        var me = this,
          btn = me.element.children(".btn");

        // 控制点移入切换
        if (me.settings.pagesDot) {
          me.pages.find("span").on("mouseover", function () {
            me.index = me._oddIndex($(this).index());
            me._switchPage();
          });
        }

        // 左右切换箭头按钮
        if (me.settings.pagesArrows) {
          btn.eq(0).on("click", function () {
            me.prev();
          });
          btn.eq(1).on("click", function () {
            me.next();
          });
        }

        // 绑定键盘事件
        if (me.settings.keyboard) {
          $(window).keydown(function (e) {
            var keyCode = e.keyCode;
            if (keyCode == 37 || keyCode == 38) {
              me.prev();
            } else if (keyCode == 39 || keyCode == 40) {
              me.next();
            }
          });
        }

        // 绑定鼠标滚轮事件
        if (me.settings.mouseRoll) {
          me.element.on("mousewheel DOMMouseScroll", function (e) {
            e.preventDefault();
            var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;

            if (delta > 0 && (me.index && !me.settings.loop || me.settings.loop)) {
              me.prev();
            } else if (delta < 0 && (me.index < (me.pageCount() - 1) && !me.settings.loop || me.settings.loop)) {
              me.next();
            }
          });
        }

      },

      // todo: 自动播放
      _autoPlay: function () {
        var me = this;

        if (me.settings.loop) {
          // 设置定时器
          var timer = setInterval(function() {
            me.index++;
            me._switchPage();
          }, me.settings.interval);

          // 移入清除定时器
          me.element.hover(function() {
            clearInterval(timer);
          },function() {
            timer = setInterval(function() {
              me.index++;
              me._switchPage();
            }, me.settings.interval);
          });
        }
      },

      // todo: 切换页面
      _switchPage: function () {
        var me = this;
        console.log(me.index);

        // 末页切首页
        if (me.index == me.pageCount()) {
          me.items.css("left", "0");
          me.index = 0;
        }

        // 首页切末页
        if (me.index == -1) {
          me.items.css("left", -(me.pageCount() - 2) * 100 + "%");
          me.index = me.pageCount() - 2;
        }

        // 控制点高亮切换
        if (me.index >= me.pageCount() - 1) {
          me.pages.children("span").eq(0).addClass("on").siblings().removeClass("on")
        } else {
          me.pages.children("span").eq(me.index).addClass("on").siblings().removeClass("on");
        }

        // 过渡动画
        me.items.stop().animate({
          left: -(me.index * 100) + "%"
        }, me.settings.speed);
      },

      // todo: IE8控制点索引受PIE生成的元素影响, 这里做一个索引转换
      _oddIndex: function (index) {
        var me = this;
        if (!me.isIE8) return index;

        var arr = [1];

        for (var i = 1; i <= me.pageCount(); i++) {
          arr.push(arr[arr.length - 1] + 2);
        }

        // 让IE8兼容indexOf方法
        if (!Array.prototype.indexOf) {
          Array.prototype.indexOf = function(val){
            var me = this;
            for(var i =0; i < me.length; i++){
              if(me[i] == val) return i;
            }
            return -1;
          };
        }

        return arr.indexOf(index);
      }

    };
    return PageSlide;
  })();

  // 注册 jQuery 组件
  $.fn.PageSlide = function (options) {

    // 实现单例模式
    return this.each(function () {
      var me = $(this),
        instance = me.data("PageSlide"); // 获取实例对象

      // 若实例不存在，则创建实例对象
      if (!instance) {
        me.data("PageSlide", (instance = new PageSlide(me, options)));
      }

      // 若实例已存在，直接返回该实例
      if ($.type(options) === "string") return instance[options]();
    });

  };

  // 默认配置参数
  $.fn.PageSlide.defaults = {
    selector: {
      items: ".items", // 容器
      item: ".item",   // 子项
      pages: ".pages"  // 分页
    },

    index: 0,          // 索引

    loop: true,        // 启用循环切换
    interval: 1500,    // 切换间隔
    speed: 800,        // 过渡时间

    pages: true,       // 启用分页
    pagesArrows: true, // 分页箭头控制
    pagesDot: true,    // 分页点控制
    keyboard: false,   // 启用键盘控制
    mouseRoll: false  // 启用鼠标滚轮控制
  }

})(jQuery);