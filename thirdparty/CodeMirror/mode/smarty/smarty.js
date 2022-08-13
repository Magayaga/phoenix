!function(mod){"object"==typeof exports&&"object"==typeof module?mod(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],mod):mod(CodeMirror)}(function(CodeMirror){"use strict";CodeMirror.defineMode("smarty",function(config,parserConf){var rightDelimiter=parserConf.rightDelimiter||"}",leftDelimiter=parserConf.leftDelimiter||"{",version=parserConf.version||2,baseMode=CodeMirror.getMode(config,parserConf.baseMode||"null"),keyFunctions=["debug","extends","function","include","literal"],regs={operatorChars:/[+\-*&%=<>!?]/,validIdentifier:/[a-zA-Z0-9_]/,stringChar:/['"]/},last;function cont(style,lastType){return last=lastType,style}function chain(stream,state,parser){return state.tokenize=parser,parser(stream,state)}function doesNotCount(stream,pos){return null==pos&&(pos=stream.pos),3===version&&"{"==leftDelimiter&&(pos==stream.string.length||/\s/.test(stream.string.charAt(pos)))}function tokenTop(stream,state){for(var string=stream.string,scan=stream.pos;;){var nextMatch=string.indexOf(leftDelimiter,scan);if(scan=nextMatch+leftDelimiter.length,-1==nextMatch||!doesNotCount(stream,nextMatch+leftDelimiter.length))break}if(nextMatch==stream.pos)return stream.match(leftDelimiter),stream.eat("*")?chain(stream,state,tokenBlock("comment","*"+rightDelimiter)):(state.depth++,state.tokenize=tokenSmarty,last="startTag","tag");nextMatch>-1&&(stream.string=string.slice(0,nextMatch));var token=baseMode.token(stream,state.base);return nextMatch>-1&&(stream.string=string),token}function tokenSmarty(stream,state){if(stream.match(rightDelimiter,!0))return 3===version?(state.depth--,state.depth<=0&&(state.tokenize=tokenTop)):state.tokenize=tokenTop,cont("tag",null);if(stream.match(leftDelimiter,!0))return state.depth++,cont("tag","startTag");var ch=stream.next();if("$"==ch)return stream.eatWhile(regs.validIdentifier),cont("variable-2","variable");if("|"==ch)return cont("operator","pipe");if("."==ch)return cont("operator","property");if(regs.stringChar.test(ch))return state.tokenize=tokenAttribute(ch),cont("string","string");if(regs.operatorChars.test(ch))return stream.eatWhile(regs.operatorChars),cont("operator","operator");if("["==ch||"]"==ch)return cont("bracket","bracket");if("("==ch||")"==ch)return cont("bracket","operator");if(/\d/.test(ch))return stream.eatWhile(/\d/),cont("number","number");if("variable"==state.last){if("@"==ch)return stream.eatWhile(regs.validIdentifier),cont("property","property");if("|"==ch)return stream.eatWhile(regs.validIdentifier),cont("qualifier","modifier")}else{if("pipe"==state.last)return stream.eatWhile(regs.validIdentifier),cont("qualifier","modifier");if("whitespace"==state.last)return stream.eatWhile(regs.validIdentifier),cont("attribute","modifier")}if("property"==state.last)return stream.eatWhile(regs.validIdentifier),cont("property",null);if(/\s/.test(ch))return last="whitespace",null;var str="";"/"!=ch&&(str+=ch);for(var c=null;c=stream.eat(regs.validIdentifier);)str+=c;for(var i=0,j=keyFunctions.length;i<j;i++)if(keyFunctions[i]==str)return cont("keyword","keyword");return/\s/.test(ch)?null:cont("tag","tag")}function tokenAttribute(quote){return function(stream,state){for(var prevChar=null,currChar=null;!stream.eol();){if(currChar=stream.peek(),stream.next()==quote&&"\\"!==prevChar){state.tokenize=tokenSmarty;break}prevChar=currChar}return"string"}}function tokenBlock(style,terminator){return function(stream,state){for(;!stream.eol();){if(stream.match(terminator)){state.tokenize=tokenTop;break}stream.next()}return style}}return{startState:function(){return{base:CodeMirror.startState(baseMode),tokenize:tokenTop,last:null,depth:0}},copyState:function(state){return{base:CodeMirror.copyState(baseMode,state.base),tokenize:state.tokenize,last:state.last,depth:state.depth}},innerMode:function(state){if(state.tokenize==tokenTop)return{mode:baseMode,state:state.base}},token:function(stream,state){var style=state.tokenize(stream,state);return state.last=last,style},indent:function(state,text,line){return state.tokenize==tokenTop&&baseMode.indent?baseMode.indent(state.base,text,line):CodeMirror.Pass},blockCommentStart:leftDelimiter+"*",blockCommentEnd:"*"+rightDelimiter}}),CodeMirror.defineMIME("text/x-smarty","smarty")});
//# sourceMappingURL=smarty.js.map
