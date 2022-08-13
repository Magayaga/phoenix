!function(mod){"object"==typeof exports&&"object"==typeof module?mod(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],mod):mod(CodeMirror)}(function(CodeMirror){"use strict";var HINT_ELEMENT_CLASS="CodeMirror-hint",ACTIVE_HINT_ELEMENT_CLASS="CodeMirror-hint-active";function Completion(cm,options){if(this.cm=cm,this.options=options,this.widget=null,this.debounce=0,this.tick=0,this.startPos=this.cm.getCursor("start"),this.startLen=this.cm.getLine(this.startPos.line).length-this.cm.getSelection().length,this.options.updateOnCursorActivity){var self=this;cm.on("cursorActivity",this.activityFunc=function(){self.cursorActivity()})}}CodeMirror.showHint=function(cm,getHints,options){if(!getHints)return cm.showHint(options);options&&options.async&&(getHints.async=!0);var newOpts={hint:getHints};if(options)for(var prop in options)newOpts[prop]=options[prop];return cm.showHint(newOpts)},CodeMirror.defineExtension("showHint",function(options){options=parseOptions(this,this.getCursor("start"),options);var selections=this.listSelections();if(!(selections.length>1)){if(this.somethingSelected()){if(!options.hint.supportsSelection)return;for(var i=0;i<selections.length;i++)if(selections[i].head.line!=selections[i].anchor.line)return}this.state.completionActive&&this.state.completionActive.close();var completion=this.state.completionActive=new Completion(this,options);completion.options.hint&&(CodeMirror.signal(this,"startCompletion",this),completion.update(!0))}}),CodeMirror.defineExtension("closeHint",function(){this.state.completionActive&&this.state.completionActive.close()});var requestAnimationFrame=window.requestAnimationFrame||function(fn){return setTimeout(fn,1e3/60)},cancelAnimationFrame=window.cancelAnimationFrame||clearTimeout;function parseOptions(cm,pos,options){var editor=cm.options.hintOptions,out={};for(var prop in defaultOptions)out[prop]=defaultOptions[prop];if(editor)for(var prop in editor)void 0!==editor[prop]&&(out[prop]=editor[prop]);if(options)for(var prop in options)void 0!==options[prop]&&(out[prop]=options[prop]);return out.hint.resolve&&(out.hint=out.hint.resolve(cm,pos)),out}function getText(completion){return"string"==typeof completion?completion:completion.text}function buildKeyMap(completion,handle){var baseMap={Up:function(){handle.moveFocus(-1)},Down:function(){handle.moveFocus(1)},PageUp:function(){handle.moveFocus(1-handle.menuSize(),!0)},PageDown:function(){handle.moveFocus(handle.menuSize()-1,!0)},Home:function(){handle.setFocus(0)},End:function(){handle.setFocus(handle.length-1)},Enter:handle.pick,Tab:handle.pick,Esc:handle.close},mac;/Mac/.test(navigator.platform)&&(baseMap["Ctrl-P"]=function(){handle.moveFocus(-1)},baseMap["Ctrl-N"]=function(){handle.moveFocus(1)});var custom=completion.options.customKeys,ourMap=custom?{}:baseMap;function addBinding(key,val){var bound;bound="string"!=typeof val?function(cm){return val(cm,handle)}:baseMap.hasOwnProperty(val)?baseMap[val]:val,ourMap[key]=bound}if(custom)for(var key in custom)custom.hasOwnProperty(key)&&addBinding(key,custom[key]);var extra=completion.options.extraKeys;if(extra)for(var key in extra)extra.hasOwnProperty(key)&&addBinding(key,extra[key]);return ourMap}function getHintElement(hintsElement,el){for(;el&&el!=hintsElement;){if("LI"===el.nodeName.toUpperCase()&&el.parentNode==hintsElement)return el;el=el.parentNode}}function Widget(completion,data){this.id="cm-complete-"+Math.floor(Math.random(1e6)),this.completion=completion,this.data=data,this.picked=!1;var widget=this,cm=completion.cm,ownerDocument=cm.getInputField().ownerDocument,parentWindow=ownerDocument.defaultView||ownerDocument.parentWindow,hints=this.hints=ownerDocument.createElement("ul");hints.setAttribute("role","listbox"),hints.setAttribute("aria-expanded","true"),hints.id=this.id;var theme=completion.cm.options.theme;hints.className="CodeMirror-hints "+theme,this.selectedHint=data.selectedHint||0;for(var completions=data.list,i=0;i<completions.length;++i){var elt=hints.appendChild(ownerDocument.createElement("li")),cur=completions[i],className=HINT_ELEMENT_CLASS+(i!=this.selectedHint?"":" "+ACTIVE_HINT_ELEMENT_CLASS);null!=cur.className&&(className=cur.className+" "+className),elt.className=className,i==this.selectedHint&&elt.setAttribute("aria-selected","true"),elt.id=this.id+"-"+i,elt.setAttribute("role","option"),cur.render?cur.render(elt,data,cur):elt.appendChild(ownerDocument.createTextNode(cur.displayText||getText(cur))),elt.hintId=i}var container=completion.options.container||ownerDocument.body,pos=cm.cursorCoords(completion.options.alignWithWord?data.from:null),left=pos.left,top=pos.bottom,below=!0,offsetLeft=0,offsetTop=0;if(container!==ownerDocument.body){var isContainerPositioned,offsetParent=-1!==["absolute","relative","fixed"].indexOf(parentWindow.getComputedStyle(container).position)?container:container.offsetParent,offsetParentPosition=offsetParent.getBoundingClientRect(),bodyPosition=ownerDocument.body.getBoundingClientRect();offsetLeft=offsetParentPosition.left-bodyPosition.left-offsetParent.scrollLeft,offsetTop=offsetParentPosition.top-bodyPosition.top-offsetParent.scrollTop}hints.style.left=left-offsetLeft+"px",hints.style.top=top-offsetTop+"px";var winW=parentWindow.innerWidth||Math.max(ownerDocument.body.offsetWidth,ownerDocument.documentElement.offsetWidth),winH=parentWindow.innerHeight||Math.max(ownerDocument.body.offsetHeight,ownerDocument.documentElement.offsetHeight);container.appendChild(hints),cm.getInputField().setAttribute("aria-autocomplete","list"),cm.getInputField().setAttribute("aria-owns",this.id),cm.getInputField().setAttribute("aria-activedescendant",this.id+"-"+this.selectedHint);var box=completion.options.moveOnOverlap?hints.getBoundingClientRect():new DOMRect,scrolls=!!completion.options.paddingForScrollbar&&hints.scrollHeight>hints.clientHeight+1,startScroll,overlapY;if(setTimeout(function(){startScroll=cm.getScrollInfo()}),box.bottom-winH>0){var height=box.bottom-box.top,curTop;if(pos.top-(pos.bottom-box.top)-height>0)hints.style.top=(top=pos.top-height-offsetTop)+"px",below=!1;else if(height>winH){hints.style.height=winH-5+"px",hints.style.top=(top=pos.bottom-box.top-offsetTop)+"px";var cursor=cm.getCursor();data.from.ch!=cursor.ch&&(pos=cm.cursorCoords(cursor),hints.style.left=(left=pos.left-offsetLeft)+"px",box=hints.getBoundingClientRect())}}var overlapX=box.right-winW,closingOnBlur;if(scrolls&&(overlapX+=cm.display.nativeBarWidth),overlapX>0&&(box.right-box.left>winW&&(hints.style.width=winW-5+"px",overlapX-=box.right-box.left-winW),hints.style.left=(left=Math.max(pos.left-overlapX-offsetLeft,0))+"px"),scrolls)for(var node=hints.firstChild;node;node=node.nextSibling)node.style.paddingRight=cm.display.nativeBarWidth+"px";(cm.addKeyMap(this.keyMap=buildKeyMap(completion,{moveFocus:function(n,avoidWrap){widget.changeActive(widget.selectedHint+n,avoidWrap)},setFocus:function(n){widget.changeActive(n)},menuSize:function(){return widget.screenAmount()},length:completions.length,close:function(){completion.close()},pick:function(){widget.pick()},data:data})),completion.options.closeOnUnfocus)&&(cm.on("blur",this.onBlur=function(){closingOnBlur=setTimeout(function(){completion.close()},100)}),cm.on("focus",this.onFocus=function(){clearTimeout(closingOnBlur)}));cm.on("scroll",this.onScroll=function(){var curScroll=cm.getScrollInfo(),editor=cm.getWrapperElement().getBoundingClientRect();startScroll||(startScroll=cm.getScrollInfo());var newTop=top+startScroll.top-curScroll.top,point=newTop-(parentWindow.pageYOffset||(ownerDocument.documentElement||ownerDocument.body).scrollTop);if(below||(point+=hints.offsetHeight),point<=editor.top||point>=editor.bottom)return completion.close();hints.style.top=newTop+"px",hints.style.left=left+startScroll.left-curScroll.left+"px"}),CodeMirror.on(hints,"dblclick",function(e){var t=getHintElement(hints,e.target||e.srcElement);t&&null!=t.hintId&&(widget.changeActive(t.hintId),widget.pick())}),CodeMirror.on(hints,"click",function(e){var t=getHintElement(hints,e.target||e.srcElement);t&&null!=t.hintId&&(widget.changeActive(t.hintId),completion.options.completeOnSingleClick&&widget.pick())}),CodeMirror.on(hints,"mousedown",function(){setTimeout(function(){cm.focus()},20)});var selectedHintRange=this.getSelectedHintRange();return 0===selectedHintRange.from&&0===selectedHintRange.to||this.scrollToActive(),CodeMirror.signal(data,"select",completions[this.selectedHint],hints.childNodes[this.selectedHint]),!0}function applicableHelpers(cm,helpers){if(!cm.somethingSelected())return helpers;for(var result=[],i=0;i<helpers.length;i++)helpers[i].supportsSelection&&result.push(helpers[i]);return result}function fetchHints(hint,cm,options,callback){if(hint.async)hint(cm,callback,options);else{var result=hint(cm,options);result&&result.then?result.then(callback):callback(result)}}function resolveAutoHints(cm,pos){var helpers=cm.getHelpers(pos,"hint"),words;if(helpers.length){var resolved=function(cm,callback,options){var app=applicableHelpers(cm,helpers);function run(i){if(i==app.length)return callback(null);fetchHints(app[i],cm,options,function(result){result&&result.list.length>0?callback(result):run(i+1)})}run(0)};return resolved.async=!0,resolved.supportsSelection=!0,resolved}return(words=cm.getHelper(cm.getCursor(),"hintWords"))?function(cm){return CodeMirror.hint.fromList(cm,{words:words})}:CodeMirror.hint.anyword?function(cm,options){return CodeMirror.hint.anyword(cm,options)}:function(){}}Completion.prototype={close:function(){this.active()&&(this.cm.state.completionActive=null,this.tick=null,this.options.updateOnCursorActivity&&this.cm.off("cursorActivity",this.activityFunc),this.widget&&this.data&&CodeMirror.signal(this.data,"close"),this.widget&&this.widget.close(),CodeMirror.signal(this.cm,"endCompletion",this.cm))},active:function(){return this.cm.state.completionActive==this},pick:function(data,i){var completion=data.list[i],self=this;this.cm.operation(function(){completion.hint?completion.hint(self.cm,data,completion):self.cm.replaceRange(getText(completion),completion.from||data.from,completion.to||data.to,"complete"),CodeMirror.signal(data,"pick",completion),self.cm.scrollIntoView()}),this.options.closeOnPick&&this.close()},cursorActivity:function(){this.debounce&&(cancelAnimationFrame(this.debounce),this.debounce=0);var identStart=this.startPos;this.data&&(identStart=this.data.from);var pos=this.cm.getCursor(),line=this.cm.getLine(pos.line);if(pos.line!=this.startPos.line||line.length-pos.ch!=this.startLen-this.startPos.ch||pos.ch<identStart.ch||this.cm.somethingSelected()||!pos.ch||this.options.closeCharacters.test(line.charAt(pos.ch-1)))this.close();else{var self=this;this.debounce=requestAnimationFrame(function(){self.update()}),this.widget&&this.widget.disable()}},update:function(first){if(null!=this.tick){var self=this,myTick=++this.tick;fetchHints(this.options.hint,this.cm,this.options,function(data){self.tick==myTick&&self.finishUpdate(data,first)})}},finishUpdate:function(data,first){this.data&&CodeMirror.signal(this.data,"update");var picked=this.widget&&this.widget.picked||first&&this.options.completeSingle;this.widget&&this.widget.close(),this.data=data,data&&data.list.length&&(picked&&1==data.list.length?this.pick(data,0):(this.widget=new Widget(this,data),CodeMirror.signal(data,"shown")))}},Widget.prototype={close:function(){if(this.completion.widget==this){this.completion.widget=null,this.hints.parentNode&&this.hints.parentNode.removeChild(this.hints),this.completion.cm.removeKeyMap(this.keyMap);var input=this.completion.cm.getInputField();input.removeAttribute("aria-activedescendant"),input.removeAttribute("aria-owns");var cm=this.completion.cm;this.completion.options.closeOnUnfocus&&(cm.off("blur",this.onBlur),cm.off("focus",this.onFocus)),cm.off("scroll",this.onScroll)}},disable:function(){this.completion.cm.removeKeyMap(this.keyMap);var widget=this;this.keyMap={Enter:function(){widget.picked=!0}},this.completion.cm.addKeyMap(this.keyMap)},pick:function(){this.completion.pick(this.data,this.selectedHint)},changeActive:function(i,avoidWrap){if(i>=this.data.list.length?i=avoidWrap?this.data.list.length-1:0:i<0&&(i=avoidWrap?0:this.data.list.length-1),this.selectedHint!=i){var node=this.hints.childNodes[this.selectedHint];node&&(node.className=node.className.replace(" "+ACTIVE_HINT_ELEMENT_CLASS,""),node.removeAttribute("aria-selected")),(node=this.hints.childNodes[this.selectedHint=i]).className+=" "+ACTIVE_HINT_ELEMENT_CLASS,node.setAttribute("aria-selected","true"),this.completion.cm.getInputField().setAttribute("aria-activedescendant",node.id),this.scrollToActive(),CodeMirror.signal(this.data,"select",this.data.list[this.selectedHint],node)}},scrollToActive:function(){var selectedHintRange=this.getSelectedHintRange(),node1=this.hints.childNodes[selectedHintRange.from],node2=this.hints.childNodes[selectedHintRange.to],firstNode=this.hints.firstChild;node1.offsetTop<this.hints.scrollTop?this.hints.scrollTop=node1.offsetTop-firstNode.offsetTop:node2.offsetTop+node2.offsetHeight>this.hints.scrollTop+this.hints.clientHeight&&(this.hints.scrollTop=node2.offsetTop+node2.offsetHeight-this.hints.clientHeight+firstNode.offsetTop)},screenAmount:function(){return Math.floor(this.hints.clientHeight/this.hints.firstChild.offsetHeight)||1},getSelectedHintRange:function(){var margin=this.completion.options.scrollMargin||0;return{from:Math.max(0,this.selectedHint-margin),to:Math.min(this.data.list.length-1,this.selectedHint+margin)}}},CodeMirror.registerHelper("hint","auto",{resolve:resolveAutoHints}),CodeMirror.registerHelper("hint","fromList",function(cm,options){var cur=cm.getCursor(),token=cm.getTokenAt(cur),term,from=CodeMirror.Pos(cur.line,token.start),to=cur;token.start<cur.ch&&/\w/.test(token.string.charAt(cur.ch-token.start-1))?term=token.string.substr(0,cur.ch-token.start):(term="",from=cur);for(var found=[],i=0;i<options.words.length;i++){var word=options.words[i];word.slice(0,term.length)==term&&found.push(word)}if(found.length)return{list:found,from:from,to:to}}),CodeMirror.commands.autocomplete=CodeMirror.showHint;var defaultOptions={hint:CodeMirror.hint.auto,completeSingle:!0,alignWithWord:!0,closeCharacters:/[\s()\[\]{};:>,]/,closeOnPick:!0,closeOnUnfocus:!0,updateOnCursorActivity:!0,completeOnSingleClick:!0,container:null,customKeys:null,extraKeys:null,paddingForScrollbar:!0,moveOnOverlap:!0};CodeMirror.defineOption("hintOptions",null)});
//# sourceMappingURL=show-hint.js.map
