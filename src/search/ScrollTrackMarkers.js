define(function(require,exports,module){var _=require("thirdparty/lodash"),WorkspaceManager=require("view/WorkspaceManager"),editor,trackOffset,trackHt,marks=[],$markedTickmark,scrollbarTrackOffset;switch(brackets.platform){case"win":scrollbarTrackOffset=0;break;case"mac":scrollbarTrackOffset=4;break;case"linux":scrollbarTrackOffset=2}function getScrollbarTrackOffset(){return scrollbarTrackOffset}function setScrollbarTrackOffset(offset){scrollbarTrackOffset=offset}function _getScrollbar(editor){return $(editor.getRootElement()).children(".CodeMirror-vscrollbar")}function _calcScaling(){var $sb=_getScrollbar(editor);if((trackHt=$sb[0].offsetHeight)>0)trackOffset=getScrollbarTrackOffset(),trackHt-=2*trackOffset;else{var codeContainer=$(editor.getRootElement()).find("> .CodeMirror-scroll > .CodeMirror-sizer > div > .CodeMirror-lines > div")[0];trackHt=codeContainer.offsetHeight,trackOffset=codeContainer.offsetTop}}function _renderMarks(posArray){var html="",cm=editor._codeMirror,editorHt=cm.getScrollerElement().scrollHeight,wrapping=cm.getOption("lineWrapping"),singleLineH=wrapping&&1.5*cm.defaultTextHeight(),curLine=null,curLineObj=null;function getY(cm,pos){return curLine!==pos.line&&(curLine=pos.line,curLineObj=cm.getLineHandle(curLine)),wrapping&&curLineObj.height>singleLineH?cm.charCoords(pos,"local").top:cm.heightAtLine(curLineObj,"local")}posArray.forEach(function(pos){var cursorTop=getY(cm,pos),top=Math.round(cursorTop/editorHt*trackHt)+trackOffset;html+="<div class='tickmark' style='top:"+--top+"px'></div>"}),$(".tickmark-track",editor.getRootElement()).append($(html))}function clear(){editor&&($(".tickmark-track",editor.getRootElement()).empty(),marks=[],$markedTickmark=null)}function setVisible(curEditor,visible){if(!(visible&&curEditor===editor||!visible&&!editor))if(visible){if(console.assert(!editor),(editor=curEditor).isTextSubset())return;var $sb=_getScrollbar(editor),$overlay=$("<div class='tickmark-track'></div>");$sb.parent().append($overlay),_calcScaling(),WorkspaceManager.on("workspaceUpdateLayout.ScrollTrackMarkers",_.debounce(function(){marks.length&&(_calcScaling(),$(".tickmark-track",editor.getRootElement()).empty(),_renderMarks(marks))},300))}else console.assert(editor===curEditor),$(".tickmark-track",curEditor.getRootElement()).remove(),editor=null,marks=[],WorkspaceManager.off("workspaceUpdateLayout.ScrollTrackMarkers")}function addTickmarks(curEditor,posArray){console.assert(editor===curEditor),marks=marks.concat(posArray),_renderMarks(posArray)}function markCurrent(index){$markedTickmark&&($markedTickmark.removeClass("tickmark-current"),$markedTickmark=null),-1!==index&&($markedTickmark=$(".tickmark-track > .tickmark",editor.getRootElement()).eq(index).addClass("tickmark-current"))}function _getTickmarks(){return marks}exports._getTickmarks=_getTickmarks,exports.clear=clear,exports.setVisible=setVisible,exports.addTickmarks=addTickmarks,exports.markCurrent=markCurrent,exports.getScrollbarTrackOffset=getScrollbarTrackOffset,exports.setScrollbarTrackOffset=setScrollbarTrackOffset});
//# sourceMappingURL=ScrollTrackMarkers.js.map
