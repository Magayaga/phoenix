!function(mod){"object"==typeof exports&&"object"==typeof module?mod(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],mod):mod(CodeMirror)}(function(CodeMirror){"use strict";function lineIndent(cm,lineNo){var text=cm.getLine(lineNo),spaceTo=text.search(/\S/);return-1==spaceTo||/\bcomment\b/.test(cm.getTokenTypeAt(CodeMirror.Pos(lineNo,spaceTo+1)))?-1:CodeMirror.countColumn(text,null,cm.getOption("tabSize"))}CodeMirror.registerHelper("fold","indent",function(cm,start){var myIndent=lineIndent(cm,start.line);if(!(myIndent<0)){for(var lastLineInFold=null,i=start.line+1,end=cm.lastLine();i<=end;++i){var indent=lineIndent(cm,i);if(-1==indent);else{if(!(indent>myIndent))break;lastLineInFold=i}}return lastLineInFold?{from:CodeMirror.Pos(start.line,cm.getLine(start.line).length),to:CodeMirror.Pos(lastLineInFold,cm.getLine(lastLineInFold).length)}:void 0}})});
//# sourceMappingURL=indent-fold.js.map
