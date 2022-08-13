define(function(require,exports,module){var EditorManager=require("editor/EditorManager"),EventDispatcher=require("utils/EventDispatcher"),PreferencesManager=require("preferences/PreferencesManager"),_=require("thirdparty/lodash"),SYNC_ERROR_CLASS="live-preview-sync-error";function LiveDocument(protocol,urlResolver,doc,editor,roots){this.protocol=protocol,this.urlResolver=urlResolver,this.doc=doc,this.roots=roots||[],this._onActiveEditorChange=this._onActiveEditorChange.bind(this),this._onCursorActivity=this._onCursorActivity.bind(this),this._onHighlightPrefChange=this._onHighlightPrefChange.bind(this),EditorManager.on("activeEditorChange",this._onActiveEditorChange),PreferencesManager.stateManager.getPreference("livedev.highlight").on("change",this._onHighlightPrefChange),$(window).focus(this._onHighlightPrefChange),editor&&this._attachToEditor(editor)}EventDispatcher.makeEventDispatcher(LiveDocument.prototype),LiveDocument.prototype.close=function(){this._clearErrorDisplay(),this._detachFromEditor(),EditorManager.off("activeEditorChange",this._onActiveEditorChange),PreferencesManager.stateManager.getPreference("livedev.highlight").off("change",this._onHighlightPrefChange)},LiveDocument.prototype.isLiveEditingEnabled=function(){return!1},LiveDocument.prototype.setInstrumentationEnabled=function(enabled){},LiveDocument.prototype.getResponseData=function(enabled){return{body:this.doc.getText()}},LiveDocument.prototype._onHighlightPrefChange=function(){this.isHighlightEnabled()?this.updateHighlight():this.hideHighlight()},LiveDocument.prototype._onActiveEditorChange=function(event,newActive,oldActive){newActive&&newActive.document===this.doc&&this._attachToEditor(newActive)},LiveDocument.prototype._attachToEditor=function(editor){this.editor=editor,this.editor&&(this.editor.on("cursorActivity",this._onCursorActivity),this.updateHighlight())},LiveDocument.prototype._detachFromEditor=function(){this.editor&&(this.hideHighlight(),this.editor.off("cursorActivity",this._onCursorActivity),this.editor=null)},LiveDocument.prototype._onCursorActivity=function(event,editor){this.editor&&this.updateHighlight()},LiveDocument.prototype._updateErrorDisplay=function(){var self=this,startLine,endLine,i,lineHandle;this.editor&&(this.editor._codeMirror.operation(function(){self._clearErrorDisplay(),self._errorLineHandles=self._errorLineHandles||[],self.errors.forEach(function(error){for(startLine=error.startPos.line,endLine=error.endPos.line,i=startLine;i<endLine+1;i++)lineHandle=self.editor._codeMirror.addLineClass(i,"wrap",SYNC_ERROR_CLASS),self._errorLineHandles.push(lineHandle)})}),this.trigger("errorStatusChanged",!!this.errors.length))},LiveDocument.prototype._clearErrorDisplay=function(){var self=this,lineHandle;this.editor&&this._errorLineHandles&&this._errorLineHandles.length&&this.editor._codeMirror.operation(function(){for(;lineHandle=self._errorLineHandles.pop();)self.editor._codeMirror.removeLineClass(lineHandle,"wrap",SYNC_ERROR_CLASS)})},LiveDocument.prototype.isHighlightEnabled=function(){return PreferencesManager.getViewState("livedev.highlight")},LiveDocument.prototype.updateHighlight=function(){},LiveDocument.prototype.hideHighlight=function(temporary){temporary||(this._lastHighlight=null),this.protocol.evaluate("_LD.hideHighlight()")},LiveDocument.prototype.highlightRule=function(name){this._lastHighlight!==name&&(this._lastHighlight=name,this.protocol.evaluate("_LD.highlightRule("+JSON.stringify(name)+")"))},LiveDocument.prototype.highlightDomElement=function(ids){var selector="";Array.isArray(ids)||(ids=[ids]),_.each(ids,function(id){""!==selector&&(selector+=","),selector+="[data-brackets-id='"+id+"']"}),this.highlightRule(selector)},LiveDocument.prototype.redrawHighlights=function(){this.isHighlightEnabled()&&this.protocol.evaluate("_LD.redrawHighlights()")},module.exports=LiveDocument});
//# sourceMappingURL=LiveDocument.js.map
