!function(mod){"object"==typeof exports&&"object"==typeof module?mod(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],mod):mod(CodeMirror)}(function(CodeMirror){var defaults={pairs:"()[]{}''\"\"",closeBefore:")]}'\":;>",triples:"",explode:"[]{}"},Pos=CodeMirror.Pos;function getOption(conf,name){return"pairs"==name&&"string"==typeof conf?conf:"object"==typeof conf&&null!=conf[name]?conf[name]:defaults[name]}CodeMirror.defineOption("autoCloseBrackets",!1,function(cm,val,old){old&&old!=CodeMirror.Init&&(cm.removeKeyMap(keyMap),cm.state.closeBrackets=null),val&&(ensureBound(getOption(val,"pairs")),cm.state.closeBrackets=val,cm.addKeyMap(keyMap))});var keyMap={Backspace:handleBackspace,Enter:handleEnter};function ensureBound(chars){for(var i=0;i<chars.length;i++){var ch=chars.charAt(i),key="'"+ch+"'";keyMap[key]||(keyMap[key]=handler(ch))}}function handler(ch){return function(cm){return handleChar(cm,ch)}}function getConfig(cm){var deflt=cm.state.closeBrackets,mode;return!deflt||deflt.override?deflt:cm.getModeAt(cm.getCursor()).closeBrackets||deflt}function handleBackspace(cm){var conf=getConfig(cm);if(!conf||cm.getOption("disableInput"))return CodeMirror.Pass;for(var pairs=getOption(conf,"pairs"),ranges=cm.listSelections(),i=0;i<ranges.length;i++){if(!ranges[i].empty())return CodeMirror.Pass;var around=charsAround(cm,ranges[i].head);if(!around||pairs.indexOf(around)%2!=0)return CodeMirror.Pass}for(var i=ranges.length-1;i>=0;i--){var cur=ranges[i].head;cm.replaceRange("",Pos(cur.line,cur.ch-1),Pos(cur.line,cur.ch+1),"+delete")}}function handleEnter(cm){var conf=getConfig(cm),explode=conf&&getOption(conf,"explode");if(!explode||cm.getOption("disableInput"))return CodeMirror.Pass;for(var ranges=cm.listSelections(),i=0;i<ranges.length;i++){if(!ranges[i].empty())return CodeMirror.Pass;var around=charsAround(cm,ranges[i].head);if(!around||explode.indexOf(around)%2!=0)return CodeMirror.Pass}cm.operation(function(){var linesep=cm.lineSeparator()||"\n";cm.replaceSelection(linesep+linesep,null),moveSel(cm,-1),ranges=cm.listSelections();for(var i=0;i<ranges.length;i++){var line=ranges[i].head.line;cm.indentLine(line,null,!0),cm.indentLine(line+1,null,!0)}})}function moveSel(cm,dir){for(var newRanges=[],ranges=cm.listSelections(),primary=0,i=0;i<ranges.length;i++){var range=ranges[i];range.head==cm.getCursor()&&(primary=i);var pos=range.head.ch||dir>0?{line:range.head.line,ch:range.head.ch+dir}:{line:range.head.line-1};newRanges.push({anchor:pos,head:pos})}cm.setSelections(newRanges,primary)}function contractSelection(sel){var inverted=CodeMirror.cmpPos(sel.anchor,sel.head)>0;return{anchor:new Pos(sel.anchor.line,sel.anchor.ch+(inverted?-1:1)),head:new Pos(sel.head.line,sel.head.ch+(inverted?1:-1))}}function handleChar(cm,ch){var conf=getConfig(cm);if(!conf||cm.getOption("disableInput"))return CodeMirror.Pass;var pairs=getOption(conf,"pairs"),pos=pairs.indexOf(ch);if(-1==pos)return CodeMirror.Pass;for(var closeBefore=getOption(conf,"closeBefore"),triples=getOption(conf,"triples"),identical=pairs.charAt(pos+1)==ch,ranges=cm.listSelections(),opening=pos%2==0,type,i=0;i<ranges.length;i++){var range=ranges[i],cur=range.head,curType,next=cm.getRange(cur,Pos(cur.line,cur.ch+1));if(opening&&!range.empty())curType="surround";else if(!identical&&opening||next!=ch)if(identical&&cur.ch>1&&triples.indexOf(ch)>=0&&cm.getRange(Pos(cur.line,cur.ch-2),cur)==ch+ch){if(cur.ch>2&&/\bstring/.test(cm.getTokenTypeAt(Pos(cur.line,cur.ch-2))))return CodeMirror.Pass;curType="addFour"}else if(identical){var prev=0==cur.ch?" ":cm.getRange(Pos(cur.line,cur.ch-1),cur);if(CodeMirror.isWordChar(next)||prev==ch||CodeMirror.isWordChar(prev))return CodeMirror.Pass;curType="both"}else{if(!opening||!(0===next.length||/\s/.test(next)||closeBefore.indexOf(next)>-1))return CodeMirror.Pass;curType="both"}else curType=identical&&stringStartsAfter(cm,cur)?"both":triples.indexOf(ch)>=0&&cm.getRange(cur,Pos(cur.line,cur.ch+3))==ch+ch+ch?"skipThree":"skip";if(type){if(type!=curType)return CodeMirror.Pass}else type=curType}var left=pos%2?pairs.charAt(pos-1):ch,right=pos%2?ch:pairs.charAt(pos+1);cm.operation(function(){if("skip"==type)moveSel(cm,1);else if("skipThree"==type)moveSel(cm,3);else if("surround"==type){for(var sels=cm.getSelections(),i=0;i<sels.length;i++)sels[i]=left+sels[i]+right;cm.replaceSelections(sels,"around"),sels=cm.listSelections().slice();for(var i=0;i<sels.length;i++)sels[i]=contractSelection(sels[i]);cm.setSelections(sels)}else"both"==type?(cm.replaceSelection(left+right,null),cm.triggerElectric(left+right),moveSel(cm,-1)):"addFour"==type&&(cm.replaceSelection(left+left+left+left,"before"),moveSel(cm,1))})}function charsAround(cm,pos){var str=cm.getRange(Pos(pos.line,pos.ch-1),Pos(pos.line,pos.ch+1));return 2==str.length?str:null}function stringStartsAfter(cm,pos){var token=cm.getTokenAt(Pos(pos.line,pos.ch+1));return/\bstring/.test(token.type)&&token.start==pos.ch&&(0==pos.ch||!/\bstring/.test(cm.getTokenTypeAt(pos)))}ensureBound(defaults.pairs+"`")});
//# sourceMappingURL=closebrackets.js.map
