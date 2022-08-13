!function(mod){"object"==typeof exports&&"object"==typeof module?mod(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],mod):mod(CodeMirror)}(function(CodeMirror){"use strict";CodeMirror.registerHelper("wordChars","r",/[\w.]/),CodeMirror.defineMode("r",function(config){function wordObj(words){for(var res={},i=0;i<words.length;++i)res[words[i]]=!0;return res}var commonAtoms=["NULL","NA","Inf","NaN","NA_integer_","NA_real_","NA_complex_","NA_character_","TRUE","FALSE"],commonBuiltins=["list","quote","bquote","eval","return","call","parse","deparse"],commonKeywords=["if","else","repeat","while","function","for","in","next","break"],commonBlockKeywords=["if","else","repeat","while","function","for"];CodeMirror.registerHelper("hintWords","r",commonAtoms.concat(commonBuiltins,commonKeywords));var atoms=wordObj(commonAtoms),builtins=wordObj(commonBuiltins),keywords=wordObj(commonKeywords),blockkeywords=wordObj(commonBlockKeywords),opChars=/[+\-*\/^<>=!&|~$:]/,curPunc;function tokenBase(stream,state){curPunc=null;var ch=stream.next();if("#"==ch)return stream.skipToEnd(),"comment";if("0"==ch&&stream.eat("x"))return stream.eatWhile(/[\da-f]/i),"number";if("."==ch&&stream.eat(/\d/))return stream.match(/\d*(?:e[+\-]?\d+)?/),"number";if(/\d/.test(ch))return stream.match(/\d*(?:\.\d+)?(?:e[+\-]\d+)?L?/),"number";if("'"==ch||'"'==ch)return state.tokenize=tokenString(ch),"string";if("`"==ch)return stream.match(/[^`]+`/),"variable-3";if("."==ch&&stream.match(/.(?:[.]|\d+)/))return"keyword";if(/[a-zA-Z\.]/.test(ch)){stream.eatWhile(/[\w\.]/);var word=stream.current();return atoms.propertyIsEnumerable(word)?"atom":keywords.propertyIsEnumerable(word)?(blockkeywords.propertyIsEnumerable(word)&&!stream.match(/\s*if(\s+|$)/,!1)&&(curPunc="block"),"keyword"):builtins.propertyIsEnumerable(word)?"builtin":"variable"}return"%"==ch?(stream.skipTo("%")&&stream.next(),"operator variable-2"):"<"==ch&&stream.eat("-")||"<"==ch&&stream.match("<-")||"-"==ch&&stream.match(/>>?/)?"operator arrow":"="==ch&&state.ctx.argList?"arg-is":opChars.test(ch)?"$"==ch?"operator dollar":(stream.eatWhile(opChars),"operator"):/[\(\){}\[\];]/.test(ch)?(curPunc=ch,";"==ch?"semi":null):null}function tokenString(quote){return function(stream,state){if(stream.eat("\\")){var ch=stream.next();return"x"==ch?stream.match(/^[a-f0-9]{2}/i):("u"==ch||"U"==ch)&&stream.eat("{")&&stream.skipTo("}")?stream.next():"u"==ch?stream.match(/^[a-f0-9]{4}/i):"U"==ch?stream.match(/^[a-f0-9]{8}/i):/[0-7]/.test(ch)&&stream.match(/^[0-7]{1,2}/),"string-2"}for(var next;null!=(next=stream.next());){if(next==quote){state.tokenize=tokenBase;break}if("\\"==next){stream.backUp(1);break}}return"string"}}var ALIGN_YES=1,ALIGN_NO=2,BRACELESS=4;function push(state,type,stream){state.ctx={type:type,indent:state.indent,flags:0,column:stream.column(),prev:state.ctx}}function setFlag(state,flag){var ctx=state.ctx;state.ctx={type:ctx.type,indent:ctx.indent,flags:ctx.flags|flag,column:ctx.column,prev:ctx.prev}}function pop(state){state.indent=state.ctx.indent,state.ctx=state.ctx.prev}return{startState:function(){return{tokenize:tokenBase,ctx:{type:"top",indent:-config.indentUnit,flags:2},indent:0,afterIdent:!1}},token:function(stream,state){if(stream.sol()&&(0==(3&state.ctx.flags)&&(state.ctx.flags|=2),4&state.ctx.flags&&pop(state),state.indent=stream.indentation()),stream.eatSpace())return null;var style=state.tokenize(stream,state);return"comment"!=style&&0==(2&state.ctx.flags)&&setFlag(state,1),";"!=curPunc&&"{"!=curPunc&&"}"!=curPunc||"block"!=state.ctx.type||pop(state),"{"==curPunc?push(state,"}",stream):"("==curPunc?(push(state,")",stream),state.afterIdent&&(state.ctx.argList=!0)):"["==curPunc?push(state,"]",stream):"block"==curPunc?push(state,"block",stream):curPunc==state.ctx.type?pop(state):"block"==state.ctx.type&&"comment"!=style&&setFlag(state,4),state.afterIdent="variable"==style||"keyword"==style,style},indent:function(state,textAfter){if(state.tokenize!=tokenBase)return 0;var firstChar=textAfter&&textAfter.charAt(0),ctx=state.ctx,closing=firstChar==ctx.type;return 4&ctx.flags&&(ctx=ctx.prev),"block"==ctx.type?ctx.indent+("{"==firstChar?0:config.indentUnit):1&ctx.flags?ctx.column+(closing?0:1):ctx.indent+(closing?0:config.indentUnit)},lineComment:"#"}}),CodeMirror.defineMIME("text/x-rsrc","r")});
//# sourceMappingURL=r.js.map
