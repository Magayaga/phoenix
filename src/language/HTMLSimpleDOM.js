define(function(require,exports,module){var Tokenizer=require("language/HTMLTokenizer").Tokenizer,MurmurHash3=require("thirdparty/murmurhash3_gc"),PerfUtils=require("utils/PerfUtils"),seed=Math.floor(65535*Math.random()),tagID=1,openImpliesClose={li:{li:!0},dt:{dd:!0,dt:!0},dd:{dd:!0,dt:!0},address:{p:!0},article:{p:!0},aside:{p:!0},blockquote:{p:!0},colgroup:{caption:!0},details:{p:!0},dir:{p:!0},div:{p:!0},dl:{p:!0},fieldset:{p:!0},figcaption:{p:!0},figure:{p:!0},footer:{p:!0},form:{p:!0},h1:{p:!0},h2:{p:!0},h3:{p:!0},h4:{p:!0},h5:{p:!0},h6:{p:!0},header:{p:!0},hgroup:{p:!0},hr:{p:!0},main:{p:!0},menu:{p:!0},nav:{p:!0},ol:{p:!0},p:{p:!0},pre:{p:!0},section:{p:!0},table:{p:!0},ul:{p:!0},rb:{rb:!0,rt:!0,rtc:!0,rp:!0},rp:{rb:!0,rt:!0,rp:!0},rt:{rb:!0,rt:!0,rp:!0},rtc:{rb:!0,rt:!0,rtc:!0,rp:!0},optgroup:{optgroup:!0,option:!0},option:{option:!0},tbody:{caption:!0,colgroup:!0,thead:!0,tbody:!0,tfoot:!0},tfoot:{caption:!0,colgroup:!0,thead:!0,tbody:!0},thead:{caption:!0,colgroup:!0},tr:{tr:!0,th:!0,td:!0,caption:!0},th:{th:!0,td:!0},td:{th:!0,td:!0},body:{head:!0}},optionalClose={html:!0,body:!0,li:!0,dd:!0,dt:!0,p:!0,rb:!0,rt:!0,rtc:!0,rp:!0,optgroup:!0,option:!0,colgroup:!0,caption:!0,tbody:!0,tfoot:!0,tr:!0,td:!0,th:!0},voidElements={area:!0,base:!0,basefont:!0,br:!0,col:!0,command:!0,embed:!0,frame:!0,hr:!0,img:!0,input:!0,isindex:!0,keygen:!0,link:!0,menuitem:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0};function SimpleNode(properties){$.extend(this,properties)}function getTextNodeID(textNode){var childIndex=textNode.parent.children.indexOf(textNode);return 0===childIndex?textNode.parent.tagID+".0":textNode.parent.children[childIndex-1].tagID+"t"}function _addPos(pos1,pos2){return{line:pos1.line+pos2.line,ch:0===pos2.line?pos1.ch+pos2.ch:pos2.ch}}function _offsetPos(pos,offset){return{line:pos.line,ch:pos.ch+offset}}function Builder(text,startOffset,startOffsetPos){this.stack=[],this.text=text,this.t=new Tokenizer(text),this.currentTag=null,this.startOffset=startOffset||0,this.startOffsetPos=startOffsetPos||{line:0,ch:0}}function build(text,strict){var builder;return new Builder(text).build(strict)}function _dumpDOM(root){var result="",indent="";function walk(node){node.tag?result+=indent+"TAG "+node.tagID+" "+node.tag+" "+JSON.stringify(node.attributes)+"\n":result+=indent+"TEXT "+(node.tagID||"- ")+node.content+"\n",node.isElement()&&(indent+="  ",node.children.forEach(walk),indent=indent.slice(2))}return walk(root),result}SimpleNode.prototype={update:function(){if(this.isElement()){var i,subtreeHashes="",childHashes="",child;for(i=0;i<this.children.length;i++)(child=this.children[i]).isElement()?(childHashes+=String(child.tagID),subtreeHashes+=String(child.tagID)+child.attributeSignature+child.subtreeSignature):(childHashes+=child.textSignature,subtreeHashes+=child.textSignature);this.childSignature=MurmurHash3.hashString(childHashes,childHashes.length,seed),this.subtreeSignature=MurmurHash3.hashString(subtreeHashes,subtreeHashes.length,seed)}else this.textSignature=MurmurHash3.hashString(this.content,this.content.length,seed)},updateAttributeSignature:function(){var attributeString=JSON.stringify(this.attributes);this.attributeSignature=MurmurHash3.hashString(attributeString,attributeString.length,seed)},isElement:function(){return!!this.children},isText:function(){return!this.children}},Builder.prototype._logError=function(token){var error={token:token},startPos=token?token.startPos||token.endPos:this.startOffsetPos,endPos=token?token.endPos:this.startOffsetPos;error.startPos=_addPos(this.startOffsetPos,startPos),error.endPos=_addPos(this.startOffsetPos,endPos),this.errors||(this.errors=[]),this.errors.push(error)},Builder.prototype.build=function(strict,markCache){var self=this,token,lastClosedTag,lastTextNode,stack=this.stack,attributeName=null,nodeMap={};markCache=markCache||{};var timerBuildFull="HTMLInstr. Build DOM Full",timerBuildPart="HTMLInstr. Build DOM Partial",timers;function closeTag(endIndex,endPos){lastClosedTag=stack[stack.length-1],stack.pop(),lastClosedTag.update(),lastClosedTag.end=self.startOffset+endIndex,lastClosedTag.endPos=_addPos(self.startOffsetPos,endPos)}for(timerBuildFull=(timers=PerfUtils.markStart([timerBuildFull,timerBuildPart]))[0],timerBuildPart=timers[1];null!==(token=this.t.nextToken());){if("text"!==token.type&&"comment"!==token.type&&lastTextNode&&(lastTextNode=null),"error"===token.type)return PerfUtils.finalizeMeasurement(timerBuildFull),PerfUtils.addMeasurement(timerBuildPart),this._logError(token),null;if("opentagname"===token.type){var newTagName=token.contents.toLowerCase(),newTag;if(openImpliesClose.hasOwnProperty(newTagName))for(var closable=openImpliesClose[newTagName];stack.length>0&&closable.hasOwnProperty(stack[stack.length-1].tag);)closeTag(token.start-1,_offsetPos(token.startPos,-1));(newTag=new SimpleNode({tag:token.contents.toLowerCase(),children:[],attributes:{},parent:stack.length?stack[stack.length-1]:null,start:this.startOffset+token.start-1,startPos:_addPos(this.startOffsetPos,_offsetPos(token.startPos,-1))})).tagID=this.getID(newTag,markCache),nodeMap[newTag.tagID]&&(newTag.tagID=this.getNewID()),nodeMap[newTag.tagID]=newTag,newTag.parent&&newTag.parent.children.push(newTag),this.currentTag=newTag,voidElements.hasOwnProperty(newTag.tag)?newTag.update():stack.push(newTag)}else if("opentagend"===token.type||"selfclosingtag"===token.type)this.currentTag&&("selfclosingtag"===token.type&&stack.length&&stack[stack.length-1]===this.currentTag?closeTag(token.end,token.endPos):(this.currentTag.end=this.startOffset+token.end,this.currentTag.endPos=_addPos(this.startOffsetPos,token.endPos),lastClosedTag=this.currentTag,this.currentTag.updateAttributeSignature(),this.currentTag=null));else if("closetag"===token.type){var closeTagName=token.contents.toLowerCase();if(!voidElements.hasOwnProperty(closeTagName)){var i;for(i=stack.length-1;i>=0&&stack[i].tag!==closeTagName;i--);if(i>=0)do{if(stack.length===i+1)closeTag(token.end+1,_offsetPos(token.endPos,1));else{if(strict&&!optionalClose.hasOwnProperty(stack[stack.length-1].tag))return PerfUtils.finalizeMeasurement(timerBuildFull),PerfUtils.addMeasurement(timerBuildPart),this._logError(token),null;closeTag(token.start-2,_offsetPos(token.startPos,-2))}}while(stack.length>i);else if(strict)return PerfUtils.finalizeMeasurement(timerBuildFull),PerfUtils.addMeasurement(timerBuildPart),this._logError(token),null}}else if("attribname"===token.type)attributeName=token.contents.toLowerCase(),this.currentTag.attributes[attributeName]="";else if("attribvalue"===token.type&&null!==attributeName)this.currentTag.attributes[attributeName]=token.contents,attributeName=null;else if("text"===token.type&&stack.length){var parent=stack[stack.length-1],newNode;lastTextNode?(newNode=lastTextNode).content+=token.contents:(newNode=new SimpleNode({parent:stack[stack.length-1],content:token.contents}),parent.children.push(newNode),newNode.tagID=getTextNodeID(newNode),nodeMap[newNode.tagID]=newNode,lastTextNode=newNode),newNode.update()}}for(;stack.length;){if(strict&&!optionalClose.hasOwnProperty(stack[stack.length-1].tag))return PerfUtils.finalizeMeasurement(timerBuildFull),PerfUtils.addMeasurement(timerBuildPart),this._logError(token),null;closeTag(this.text.length,this.t._indexPos)}var dom=lastClosedTag;return dom?(dom.nodeMap=nodeMap,PerfUtils.addMeasurement(timerBuildFull),PerfUtils.finalizeMeasurement(timerBuildPart),dom):(this._logError(token),null)},Builder.prototype.getNewID=function(){return tagID++},Builder.prototype.getID=Builder.prototype.getNewID,exports.build=build,exports.Builder=Builder,exports.SimpleNode=SimpleNode,exports._dumpDOM=_dumpDOM,exports._offsetPos=_offsetPos,exports._getTextNodeID=getTextNodeID,exports._seed=seed});
//# sourceMappingURL=HTMLSimpleDOM.js.map
