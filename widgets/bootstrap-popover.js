!function($){"use strict";var Popover=function(element,options){this.init("popover",element,options)};Popover.prototype=$.extend({},$.fn.tooltip.Constructor.prototype,{constructor:Popover,setContent:function(){var $tip=this.tip(),title=this.getTitle(),content=this.getContent();$tip.find(".popover-title")[this.options.html?"html":"text"](title),$tip.find(".popover-content")[this.options.html?"html":"text"](content),$tip.removeClass("fade top bottom left right in")},hasContent:function(){return this.getTitle()||this.getContent()},getContent:function(){var content,$e=this.$element,o=this.options;return content=("function"==typeof o.content?o.content.call($e[0]):o.content)||$e.attr("data-content")},tip:function(){return this.$tip||(this.$tip=$(this.options.template)),this.$tip},destroy:function(){this.hide().$element.off("."+this.type).removeData(this.type)}});var old=$.fn.popover;$.fn.popover=function(option){return this.each(function(){var $this=$(this),data=$this.data("popover"),options="object"==typeof option&&option;data||$this.data("popover",data=new Popover(this,options)),"string"==typeof option&&data[option]()})},$.fn.popover.Constructor=Popover,$.fn.popover.defaults=$.extend({},$.fn.tooltip.defaults,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),$.fn.popover.noConflict=function(){return $.fn.popover=old,this}}(window.jQuery);
//# sourceMappingURL=bootstrap-popover.js.map
