define(function(require,exports,module){"use strict";function classNames(){for(var classes="",arg,i=0;i<arguments.length;i++)if(arg=arguments[i])if("string"==typeof arg||"number"==typeof arg)classes+=" "+arg;else if("[object Array]"===Object.prototype.toString.call(arg))classes+=" "+classNames.apply(null,arg);else if("object"==typeof arg)for(var key in arg)arg.hasOwnProperty(key)&&arg[key]&&(classes+=" "+key);return classes.substr(1)}void 0!==module&&module.exports&&(module.exports=classNames)});
//# sourceMappingURL=classnames.js.map
