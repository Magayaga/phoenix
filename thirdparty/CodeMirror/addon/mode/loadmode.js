!function(mod){"object"==typeof exports&&"object"==typeof module?mod(require("../../lib/codemirror"),"cjs"):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],function(CM){mod(CM,"amd")}):mod(CodeMirror,"plain")}(function(CodeMirror,env){CodeMirror.modeURL||(CodeMirror.modeURL="../mode/%N/%N.js");var loading={};function splitCallback(cont,n){var countDown=n;return function(){0==--countDown&&cont()}}function ensureDeps(mode,cont,options){var modeObj=CodeMirror.modes[mode],deps=modeObj&&modeObj.dependencies;if(!deps)return cont();for(var missing=[],i=0;i<deps.length;++i)CodeMirror.modes.hasOwnProperty(deps[i])||missing.push(deps[i]);if(!missing.length)return cont();for(var split=splitCallback(cont,missing.length),i=0;i<missing.length;++i)CodeMirror.requireMode(missing[i],split,options)}CodeMirror.requireMode=function(mode,cont,options){if("string"!=typeof mode&&(mode=mode.name),CodeMirror.modes.hasOwnProperty(mode))return ensureDeps(mode,cont,options);if(loading.hasOwnProperty(mode))return loading[mode].push(cont);var file=options&&options.path?options.path(mode):CodeMirror.modeURL.replace(/%N/g,mode);if(options&&options.loadMode)options.loadMode(file,function(){ensureDeps(mode,cont,options)});else if("plain"==env){var script=document.createElement("script");script.src=file;var others=document.getElementsByTagName("script")[0],list=loading[mode]=[cont];CodeMirror.on(script,"load",function(){ensureDeps(mode,function(){for(var i=0;i<list.length;++i)list[i]()},options)}),others.parentNode.insertBefore(script,others)}else"cjs"==env?(require(file),cont()):"amd"==env&&requirejs([file],cont)},CodeMirror.autoLoadMode=function(instance,mode,options){CodeMirror.modes.hasOwnProperty(mode)||CodeMirror.requireMode(mode,function(){instance.setOption("mode",instance.getOption("mode"))},options)}});
//# sourceMappingURL=loadmode.js.map
