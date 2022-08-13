define(function(require,exports,module){var DocumentManager=require("document/DocumentManager"),HTMLDOMDiff=require("language/HTMLDOMDiff"),HTMLSimpleDOM=require("LiveDevelopment/MultiBrowserImpl/language/HTMLSimpleDOM"),allowIncremental=!0,_cachedValues={};function _removeDocFromCache(evt,document){_cachedValues.hasOwnProperty(document.file.fullPath)&&(delete _cachedValues[document.file.fullPath],document.off(".htmlInstrumentation"))}function _posEq(pos1,pos2){return pos1&&pos2&&pos1.line===pos2.line&&pos1.ch===pos2.ch}function _getSortedTagMarks(marks,markCache){return(marks=marks.filter(function(mark){return!!mark.tagID}).map(function(mark){return markCache[mark.tagID]||(markCache[mark.tagID]={mark:mark,range:mark.find()}),markCache[mark.tagID]})).sort(function(mark1,mark2){return mark1.range.from.line===mark2.range.from.line?mark1.range.from.ch-mark2.range.from.ch:mark1.range.from.line-mark2.range.from.line}),marks}function _getMarkerAtDocumentPos(editor,pos,preferParent,markCache){var marks,match;return markCache=markCache||{},(marks=_getSortedTagMarks(editor._codeMirror.findMarksAt(pos),markCache)).length?(match=marks[marks.length-1],preferParent&&(_posEq(match.range.from,pos)||_posEq(match.range.to,pos))&&(match=marks.length>1?marks[marks.length-2]:null),match.mark):null}function _getTagIDAtDocumentPos(editor,pos,markCache){var match=_getMarkerAtDocumentPos(editor,pos,!1,markCache);return match?match.tagID:-1}function _markTags(cm,node){var mark;node.children.forEach(function(childNode){childNode.isElement()&&_markTags(cm,childNode)}),cm.markText(node.startPos,node.endPos).tagID=node.tagID}function _markTextFromDOM(editor,dom){var cm=editor._codeMirror,marks=cm.getAllMarks();cm.operation(function(){marks.forEach(function(mark){mark.hasOwnProperty("tagID")&&mark.clear()})}),_markTags(cm,dom)}function DOMUpdater(previousDOM,editor,changeList){var text,startOffset=0,startOffsetPos;function isDangerousEdit(text){return/[<>\/=\"\']/.test(text)}if(this.isIncremental=!1,changeList&&1===changeList.length){var change=changeList[0];if(!isDangerousEdit(change.text)&&!isDangerousEdit(change.removed)){var startMark=_getMarkerAtDocumentPos(editor,change.from,!0);if(startMark){var range=startMark.find();range&&(text=editor._codeMirror.getRange(range.from,range.to),this.changedTagID=startMark.tagID,startOffsetPos=range.from,startOffset=editor._codeMirror.indexFromPos(startOffsetPos),this.isIncremental=!0)}}}this.changedTagID||(text=editor.document.getText()),HTMLSimpleDOM.Builder.call(this,text,startOffset,startOffsetPos),this.editor=editor,this.cm=editor._codeMirror,this.previousDOM=previousDOM}function _hasAncestorWithID(node,id){for(var ancestor=node.parent;ancestor&&ancestor.tagID!==id;)ancestor=ancestor.parent;return!!ancestor}function _updateDOM(previousDOM,editor,changeList){allowIncremental||(changeList=void 0);var updater=new DOMUpdater(previousDOM,editor,changeList),result=updater.update();if(!result)return{errors:updater.errors};var edits=HTMLDOMDiff.domdiff(result.oldSubtree,result.newSubtree);return result.newSubtree!==result.newDOM&&delete result.newSubtree.nodeMap,{dom:result.newDOM,edits:edits,_wasIncremental:updater.isIncremental}}function getUnappliedEditList(editor,changeList){var cachedValue=_cachedValues[editor.document.file.fullPath];cachedValue&&cachedValue.dom&&!_cachedValues[editor.document.file.fullPath].invalid||(changeList=null);var result=_updateDOM(cachedValue&&cachedValue.dom,editor,changeList);return result.errors?(cachedValue&&(cachedValue.invalid=!0),{errors:result.errors}):(_cachedValues[editor.document.file.fullPath]={timestamp:editor.document.diskTimestamp,dom:result.dom,dirty:!1},result.dom.fullBuild=!1,{edits:result.edits})}function _processBrowserSimpleDOM(browserRoot,editorRootTagID){var nodeMap={},root;function _processElement(elem){elem.tagID=elem.attributes["data-brackets-id"],delete elem.attributes["data-brackets-id"],elem.children.forEach(function(child){child.parent=elem,child.isElement()?_processElement(child):child.isText()&&(child.update(),child.tagID=HTMLSimpleDOM.getTextNodeID(child),nodeMap[child.tagID]=child)}),elem.update(),nodeMap[elem.tagID]=elem,elem.tagID===editorRootTagID&&(root=elem)}return _processElement(browserRoot),(root=root||browserRoot).nodeMap=nodeMap,root}function _getBrowserDiff(editor,browserSimpleDOM){var cachedValue,editorRoot=_cachedValues[editor.document.file.fullPath].dom,browserRoot;return browserRoot=_processBrowserSimpleDOM(browserSimpleDOM,editorRoot.tagID),{diff:HTMLDOMDiff.domdiff(editorRoot,browserRoot),browser:browserRoot,editor:editorRoot}}function scanDocument(doc){_cachedValues.hasOwnProperty(doc.file.fullPath)||(_cachedValues[doc.file.fullPath]=null);var cachedValue=_cachedValues[doc.file.fullPath];if(cachedValue&&!cachedValue.invalid&&cachedValue.timestamp===doc.diskTimestamp)return cachedValue.dom;var text=doc.getText(),dom=HTMLSimpleDOM.build(text);return dom&&(_cachedValues[doc.file.fullPath]={timestamp:doc.diskTimestamp,dom:dom,dirty:!1},dom.fullBuild=!0),dom}function generateInstrumentedHTML(editor,remoteScript){var doc=editor.document,dom=scanDocument(doc),orig=doc.getText(),gen="",lastIndex=0,remoteScriptInserted=!1,markCache;if(!dom)return null;function walk(node){if(node.tag){var attrText=" data-brackets-id='"+node.tagID+"'",startOffset;if(dom.fullBuild)startOffset=node.start;else{var mark=markCache[node.tagID];mark?startOffset=editor._codeMirror.indexFromPos(mark.range.from):(console.warn("generateInstrumentedHTML(): couldn't find existing mark for tagID "+node.tagID),startOffset=node.start)}var insertIndex=startOffset+node.tag.length+1;gen+=orig.substr(lastIndex,insertIndex-lastIndex)+attrText,lastIndex=insertIndex,remoteScript&&!remoteScriptInserted&&"head"===node.tag&&(insertIndex=node.openEnd,gen+=orig.substr(lastIndex,insertIndex-lastIndex)+remoteScript,lastIndex=insertIndex,remoteScriptInserted=!0)}node.isElement()&&node.children.forEach(walk)}return dom.fullBuild?_markTextFromDOM(editor,dom):(markCache={},editor._codeMirror.getAllMarks().forEach(function(mark){mark.tagID&&(markCache[mark.tagID]={mark:mark,range:mark.find()})})),walk(dom),gen+=orig.substr(lastIndex),remoteScript&&!remoteScriptInserted&&(gen+=remoteScript),gen}function _markText(editor){var cache=_cachedValues[editor.document.file.fullPath],dom=cache&&cache.dom;dom?dom.fullBuild?_markTextFromDOM(editor,dom):console.error("Tried to mark text from a stale DOM for "+editor.document.file.fullPath):console.error("Couldn't find the dom for "+editor.document.file.fullPath)}function _resetCache(){_cachedValues={}}DOMUpdater.prototype=Object.create(HTMLSimpleDOM.Builder.prototype),DOMUpdater.prototype.getID=function(newTag,markCache){var currentTagID=_getTagIDAtDocumentPos(this.editor,HTMLSimpleDOM._offsetPos(newTag.startPos,1),markCache);if(-1===currentTagID||_hasAncestorWithID(newTag,currentTagID))currentTagID=this.getNewID();else{var oldNode=this.previousDOM.nodeMap[currentTagID];oldNode&&oldNode.tag===newTag.tag||(currentTagID=this.getNewID())}return currentTagID},DOMUpdater.prototype._updateMarkedRanges=function(nodeMap,markCache){var updateIDs=Object.keys(nodeMap),cm=this.cm,marks=cm.getAllMarks();cm.operation(function(){marks.forEach(function(mark){if(mark.hasOwnProperty("tagID")&&nodeMap[mark.tagID]){var node=nodeMap[mark.tagID],markInfo=markCache[mark.tagID];markInfo&&_posEq(markInfo.range.from,node.startPos)&&_posEq(markInfo.range.to,node.endPos)||(mark.clear(),(mark=cm.markText(node.startPos,node.endPos)).tagID=node.tagID),updateIDs.splice(updateIDs.indexOf(String(node.tagID)),1)}}),updateIDs.forEach(function(id){var node=nodeMap[id],mark;node.isElement()&&((mark=cm.markText(node.startPos,node.endPos)).tagID=Number(id))})})},DOMUpdater.prototype._buildNodeMap=function(root){var nodeMap={};function walk(node){node.tagID&&(nodeMap[node.tagID]=node),node.isElement()&&node.children.forEach(walk)}walk(root),root.nodeMap=nodeMap},DOMUpdater.prototype._handleDeletions=function(nodeMap,oldSubtreeMap,newSubtreeMap){var deletedIDs=[],marks;(Object.keys(oldSubtreeMap).forEach(function(key){newSubtreeMap.hasOwnProperty(key)||(deletedIDs.push(key),delete nodeMap[key])}),deletedIDs.length)&&this.cm.getAllMarks().forEach(function(mark){mark.hasOwnProperty("tagID")&&-1!==deletedIDs.indexOf(mark.tagID)&&mark.clear()})},DOMUpdater.prototype.update=function(){var markCache={},newSubtree=this.build(!0,markCache),result={newDOM:newSubtree,oldSubtree:this.previousDOM,newSubtree:newSubtree};if(!newSubtree)return null;if(this.changedTagID){var oldSubtree=this.previousDOM.nodeMap[this.changedTagID],parent=oldSubtree.parent;if(parent){var childIndex=parent.children.indexOf(oldSubtree);if(-1===childIndex)console.error("DOMUpdater.update(): couldn't locate old subtree in tree");else{oldSubtree.parent=null,newSubtree.parent=parent,parent.children[childIndex]=newSubtree,$.extend(this.previousDOM.nodeMap,newSubtree.nodeMap),this._updateMarkedRanges(newSubtree.nodeMap,markCache),this._buildNodeMap(oldSubtree),this._handleDeletions(this.previousDOM.nodeMap,oldSubtree.nodeMap,newSubtree.nodeMap);for(var curParent=parent;curParent;)curParent.update(),curParent=curParent.parent;result.newDOM=this.previousDOM,result.oldSubtree=oldSubtree}}}else _markTextFromDOM(this.editor,result.newDOM);return result},DocumentManager.on("beforeDocumentDelete",_removeDocFromCache),exports._markText=_markText,exports._getMarkerAtDocumentPos=_getMarkerAtDocumentPos,exports._getTagIDAtDocumentPos=_getTagIDAtDocumentPos,exports._markTextFromDOM=_markTextFromDOM,exports._updateDOM=_updateDOM,exports._allowIncremental=allowIncremental,exports._getBrowserDiff=_getBrowserDiff,exports._resetCache=_resetCache,exports.scanDocument=scanDocument,exports.generateInstrumentedHTML=generateInstrumentedHTML,exports.getUnappliedEditList=getUnappliedEditList});
//# sourceMappingURL=HTMLInstrumentation.js.map
