!function(mod){"object"==typeof exports&&"object"==typeof module?mod(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],mod):mod(CodeMirror)}(function(CodeMirror){"use strict";function bracketFolding(pairs){return function(cm,start){var line=start.line,lineText=cm.getLine(line);function findOpening(pair){for(var tokenType,at=start.ch,pass=0;;){var found=at<=0?-1:lineText.lastIndexOf(pair[0],at-1);if(-1!=found){if(1==pass&&found<start.ch)break;if(tokenType=cm.getTokenTypeAt(CodeMirror.Pos(line,found+1)),!/^(comment|string)/.test(tokenType))return{ch:found+1,tokenType:tokenType,pair:pair};at=found-1}else{if(1==pass)break;pass=1,at=lineText.length}}}function findRange(found){var count=1,lastLine=cm.lastLine(),end,startCh=found.ch,endCh;outer:for(var i=line;i<=lastLine;++i)for(var text=cm.getLine(i),pos=i==line?startCh:0;;){var nextOpen=text.indexOf(found.pair[0],pos),nextClose=text.indexOf(found.pair[1],pos);if(nextOpen<0&&(nextOpen=text.length),nextClose<0&&(nextClose=text.length),(pos=Math.min(nextOpen,nextClose))==text.length)break;if(cm.getTokenTypeAt(CodeMirror.Pos(i,pos+1))==found.tokenType)if(pos==nextOpen)++count;else if(!--count){end=i,endCh=pos;break outer}++pos}return null==end||line==end?null:{from:CodeMirror.Pos(line,startCh),to:CodeMirror.Pos(end,endCh)}}for(var found=[],i=0;i<pairs.length;i++){var open=findOpening(pairs[i]);open&&found.push(open)}found.sort(function(a,b){return a.ch-b.ch});for(var i=0;i<found.length;i++){var range=findRange(found[i]);if(range)return range}return null}}CodeMirror.registerHelper("fold","brace",bracketFolding([["{","}"],["[","]"]])),CodeMirror.registerHelper("fold","brace-paren",bracketFolding([["{","}"],["[","]"],["(",")"]])),CodeMirror.registerHelper("fold","import",function(cm,start){function hasImport(line){if(line<cm.firstLine()||line>cm.lastLine())return null;var start=cm.getTokenAt(CodeMirror.Pos(line,1));if(/\S/.test(start.string)||(start=cm.getTokenAt(CodeMirror.Pos(line,start.end+1))),"keyword"!=start.type||"import"!=start.string)return null;for(var i=line,e=Math.min(cm.lastLine(),line+10);i<=e;++i){var text,semi=cm.getLine(i).indexOf(";");if(-1!=semi)return{startCh:start.end,end:CodeMirror.Pos(i,semi)}}}var startLine=start.line,has=hasImport(startLine),prev;if(!has||hasImport(startLine-1)||(prev=hasImport(startLine-2))&&prev.end.line==startLine-1)return null;for(var end=has.end;;){var next=hasImport(end.line+1);if(null==next)break;end=next.end}return{from:cm.clipPos(CodeMirror.Pos(startLine,has.startCh+1)),to:end}}),CodeMirror.registerHelper("fold","include",function(cm,start){function hasInclude(line){if(line<cm.firstLine()||line>cm.lastLine())return null;var start=cm.getTokenAt(CodeMirror.Pos(line,1));return/\S/.test(start.string)||(start=cm.getTokenAt(CodeMirror.Pos(line,start.end+1))),"meta"==start.type&&"#include"==start.string.slice(0,8)?start.start+8:void 0}var startLine=start.line,has=hasInclude(startLine);if(null==has||null!=hasInclude(startLine-1))return null;for(var end=startLine;;){var next;if(null==hasInclude(end+1))break;++end}return{from:CodeMirror.Pos(startLine,has+1),to:cm.clipPos(CodeMirror.Pos(end))}})});
//# sourceMappingURL=brace-fold.js.map
