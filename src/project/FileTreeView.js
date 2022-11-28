define(function(require,exports,module){var Preact=require("thirdparty/preact"),Classnames=require("thirdparty/classnames"),Immutable=require("thirdparty/immutable"),_=require("thirdparty/lodash"),FileUtils=require("file/FileUtils"),LanguageManager=require("language/LanguageManager"),FileTreeViewModel=require("project/FileTreeViewModel"),ViewUtils=require("utils/ViewUtils"),KeyEvent=require("utils/KeyEvent"),PreferencesManager=require("preferences/PreferencesManager"),DOM=Preact.DOM,_extensions=Immutable.Map(),_draggedItemPath,CLICK_RENAME_MINIMUM=500,RIGHT_MOUSE_BUTTON=2,LEFT_MOUSE_BUTTON=0,INDENTATION_WIDTH=10;function _getName(fullname,extension){return""!==extension?fullname.substring(0,fullname.length-extension.length-1):fullname}var pathComputer={myPath:function(){var result=this.props.parentPath+this.props.name;return FileTreeViewModel.isFile(this.props.entry)||"/"===_.last(result)||(result+="/"),result}};function _measureText(text){var measuringElement=$("<span />",{css:{position:"absolute",top:"-200px",left:"-1000px",visibility:"hidden","white-space":"pre"}}).appendTo("body");measuringElement.text("pW"+text);var width=measuringElement.width();return measuringElement.remove(),width}function _createThickness(depth){return DOM.div({style:{display:"inline-block",width:INDENTATION_WIDTH*depth}})}function _createAlignedIns(depth){return DOM.ins({className:"jstree-icon",style:{marginLeft:INDENTATION_WIDTH*depth}})}var renameBehavior={handleClick:function(e){e.stopPropagation(),0!==e.button&&e.preventDefault()},handleKeyDown:function(e){e.keyCode===KeyEvent.DOM_VK_ESCAPE?this.props.actions.cancelRename():e.keyCode===KeyEvent.DOM_VK_RETURN&&this.props.actions.performRename()},handleInput:function(e){if(this.props.actions.setRenameValue(this.props.parentPath+this.refs.name.value.trim()),e.keyCode!==KeyEvent.DOM_VK_LEFT&&e.keyCode!==KeyEvent.DOM_VK_RIGHT){var node=this.refs.name,newWidth=_measureText(node.value);$(node).width(newWidth)}},handleBlur:function(){this.props.actions.performRename()}},dragAndDrop={handleDrag:function(e){if(this.props.entry.get("rename"))return e.preventDefault(),e.stopPropagation(),!1;_draggedItemPath=this.myPath(),e.dataTransfer.setData("text",JSON.stringify({path:_draggedItemPath})),this.props.actions.dragItem(this.myPath()),this.setDragImage(e),e.stopPropagation()},handleDrop:function(e){var data=JSON.parse(e.dataTransfer.getData("text"));this.props.actions.moveItem(data.path,this.myPath()),this.setDraggedOver(!1),this.clearDragTimeout(),e.stopPropagation()},handleDragEnd:function(e){this.clearDragTimeout()},handleDragOver:function(e){var data=e.dataTransfer.getData("text"),path;if((path=data?JSON.parse(data).path:_draggedItemPath)===this.myPath()||FileUtils.getParentPath(path)===this.myPath())return e.preventDefault(),void e.stopPropagation();var self=this;this.setDraggedOver(!0),this.dragOverTimeout||(this.dragOverTimeout=window.setTimeout(function(){self.props.actions.setDirectoryOpen(self.myPath(),!0),self.dragOverTimeout=null},800)),e.preventDefault(),e.stopPropagation()},handleDragLeave:function(e){this.setDraggedOver(!1),this.clearDragTimeout()},clearDragTimeout:function(){this.dragOverTimeout&&(clearTimeout(this.dragOverTimeout),this.dragOverTimeout=null)},setDraggedOver:function(draggedOver){this.state.draggedOver!==draggedOver&&this.setState({draggedOver:draggedOver})},setDragImage:function(e){var div=window.document.createElement("div");div.textContent=this.props.name,div.classList.add("jstree-dragImage"),window.document.body.appendChild(div),e.dataTransfer.setDragImage(div,-10,-10),setTimeout(function(){window.document.body.removeChild(div)},0)}},fileRenameInput=Preact.createFactory(Preact.createClass({mixins:[renameBehavior],componentDidMount:function(){var fullname=this.props.name,extension=LanguageManager.getCompoundFileExtension(fullname),node=this.refs.name;node.setSelectionRange(0,_getName(fullname,extension).length),node.focus(),ViewUtils.scrollElementIntoView($("#project-files-container"),$(node),!0)},render:function(){var width=_measureText(this.props.name);return DOM.input({className:"jstree-rename-input",type:"text",defaultValue:this.props.name,autoFocus:!0,onKeyDown:this.handleKeyDown,onInput:this.handleInput,onClick:this.handleClick,onBlur:this.handleBlur,style:{width:width},ref:"name"})}})),contextSettable={handleMouseDown:function(e){if(e.stopPropagation(),2===e.button||"mac"===this.props.platform&&0===e.button&&e.ctrlKey)return this.props.actions.setContext(this.myPath()),void e.preventDefault();this.props.entry.get("rename")||this.selectNode(e)}};function isDefined(value){return void 0!==value}var extendable={getIcons:function(){let result=[],extensions=this.props.extensions;if(extensions&&extensions.get("icons")){let data=this.getDataForExtension(),iconProviders=extensions.get("icons").toArray();for(let iconProviderCB of iconProviders)try{let iconResult=iconProviderCB(data);if(iconResult&&!Preact.isValidElement(iconResult)&&(iconResult=Preact.DOM.span({dangerouslySetInnerHTML:{__html:$(iconResult)[0].outerHTML}})),iconResult){result.push(iconResult);break}}catch(e){console.error("Exception thrown in FileTreeView icon provider: "+e,e.stack)}}return result&&0!==result.length||(result=[DOM.ins({className:"jstree-icon"}," ")]),result},getClasses:function(classes){let extensions=this.props.extensions;if(extensions&&extensions.get("addClass")){let data=this.getDataForExtension(),classProviders=extensions.get("addClass").toArray(),succeededPriority=null;for(let classProviderCB of classProviders){if(null!==succeededPriority&&succeededPriority!==classProviderCB.priority)break;try{let classResult=classProviderCB(data);classResult&&(classes=classes+" "+classResult,succeededPriority=classProviderCB.priority)}catch(e){console.error("Exception thrown in FileTreeView addClass provider: "+e,e.stack)}}}return classes}},fileNode=Preact.createFactory(Preact.createClass({mixins:[contextSettable,pathComputer,extendable,dragAndDrop],getInitialState:function(){return{clickTimer:null}},shouldComponentUpdate:function(nextProps,nextState){return nextProps.forceRender||this.props.entry!==nextProps.entry||this.props.extensions!==nextProps.extensions},componentDidUpdate:function(prevProps,prevState){var wasSelected=prevProps.entry.get("selected"),isSelected=this.props.entry.get("selected");isSelected&&!wasSelected?ViewUtils.scrollElementIntoView($("#project-files-container"),$(Preact.findDOMNode(this)),!0):!isSelected&&wasSelected&&null!==this.state.clickTimer&&this.clearTimer()},clearTimer:function(){null!==this.state.clickTimer&&(window.clearTimeout(this.state.clickTimer),this.setState({clickTimer:null}))},startRename:function(){this.props.entry.get("rename")||this.props.actions.startRename(this.myPath()),this.clearTimer()},handleClick:function(e){if(this.props.entry.get("rename"))e.stopPropagation();else if(0===e.button){if(this.props.entry.get("selected")&&!e.ctrlKey){if(null===this.state.clickTimer&&!this.props.entry.get("rename")){var timer=window.setTimeout(this.startRename,500);this.setState({clickTimer:timer})}}else{var language=LanguageManager.getLanguageForPath(this.myPath()),doNotOpen=!1;language&&language.isBinary()&&"image"!==language.getId()&&FileUtils.shouldOpenInExternalApplication(FileUtils.getFileExtension(this.myPath()).toLowerCase())&&(doNotOpen=!0),this.props.actions.setSelected(this.myPath(),doNotOpen)}e.stopPropagation(),e.preventDefault()}},selectNode:function(e){if(0===e.button){var language=LanguageManager.getLanguageForPath(this.myPath()),doNotOpen=!1;language&&language.isBinary()&&"image"!==language.getId()&&FileUtils.shouldOpenInExternalApplication(FileUtils.getFileExtension(this.myPath()).toLowerCase())&&(doNotOpen=!0),this.props.actions.setSelected(this.myPath(),doNotOpen),render()}},handleDoubleClick:function(){if(!this.props.entry.get("rename")){if(null!==this.state.clickTimer&&this.clearTimer(),FileUtils.shouldOpenInExternalApplication(FileUtils.getFileExtension(this.myPath()).toLowerCase()))return void this.props.actions.openWithExternalApplication(this.myPath());this.props.actions.selectInWorkingSet(this.myPath())}},getDataForExtension:function(){return{name:this.props.name,isFile:!0,fullPath:this.myPath()}},render:function(){var fullname=this.props.name,extension=LanguageManager.getCompoundFileExtension(fullname),name=_getName(fullname,extension);name&&(name=DOM.span({},name)),extension&&(extension=DOM.span({className:"extension"},"."+extension));var nameDisplay,cx,fileClasses=Classnames({"jstree-clicked selected-node":this.props.entry.get("selected"),"context-node":this.props.entry.get("context")}),liArgs=[{className:this.getClasses("jstree-leaf"),onClick:this.handleClick,onMouseDown:this.handleMouseDown,onDoubleClick:this.handleDoubleClick,draggable:!0,onDragStart:this.handleDrag},DOM.ins({className:"jstree-icon"})],thickness=_createThickness(this.props.depth);if(this.props.entry.get("rename"))liArgs.push(thickness),nameDisplay=fileRenameInput({actions:this.props.actions,entry:this.props.entry,name:this.props.name,parentPath:this.props.parentPath});else{var aArgs=_.flatten([{href:"#",className:fileClasses},thickness,this.getIcons(),name,extension]);nameDisplay=DOM.a.apply(DOM.a,aArgs)}return liArgs.push(nameDisplay),DOM.li.apply(DOM.li,liArgs)}})),directoryNode,directoryContents;function _buildDirsFirstComparator(contents){function _dirsFirstCompare(a,b){var aIsFile=FileTreeViewModel.isFile(contents.get(a)),bIsFile=FileTreeViewModel.isFile(contents.get(b));return!aIsFile&&bIsFile?-1:aIsFile&&!bIsFile?1:FileUtils.compareFilenames(a,b)}return _dirsFirstCompare}function _sortDirectoryContents(contents,dirsFirst){return dirsFirst?contents.keySeq().sort(_buildDirsFirstComparator(contents)):contents.keySeq().sort(FileUtils.compareFilenames)}var directoryRenameInput=Preact.createFactory(Preact.createClass({mixins:[renameBehavior],componentDidMount:function(){var fullname=this.props.name,node=this.refs.name;node.setSelectionRange(0,fullname.length),node.focus(),ViewUtils.scrollElementIntoView($("#project-files-container"),$(node),!0)},render:function(){var width=_measureText(this.props.name);return DOM.input({className:"jstree-rename-input",type:"text",defaultValue:this.props.name,autoFocus:!0,onKeyDown:this.handleKeyDown,onInput:this.handleInput,onBlur:this.handleBlur,style:{width:width},onClick:this.handleClick,ref:"name"})}}));directoryNode=Preact.createFactory(Preact.createClass({mixins:[contextSettable,pathComputer,extendable,dragAndDrop],getInitialState:function(){return{draggedOver:!1}},shouldComponentUpdate:function(nextProps,nextState){return nextProps.forceRender||this.props.entry!==nextProps.entry||this.props.sortDirectoriesFirst!==nextProps.sortDirectoriesFirst||this.props.extensions!==nextProps.extensions||void 0!==nextState&&this.state.draggedOver!==nextState.draggedOver},handleClick:function(event){if(this.props.entry.get("rename"))event.stopPropagation();else if(0===event.button){var isOpen,setOpen=!this.props.entry.get("open");event.metaKey||event.ctrlKey?event.altKey?setOpen?(this.props.actions.toggleSubdirectories(this.myPath(),setOpen),this.props.actions.setDirectoryOpen(this.myPath(),setOpen)):this.props.actions.closeSubtree(this.myPath()):this.props.actions.toggleSubdirectories(this.props.parentPath,setOpen):this.props.actions.setDirectoryOpen(this.myPath(),setOpen),event.stopPropagation(),event.preventDefault()}},selectNode:function(e){},getDataForExtension:function(){return{name:this.props.name,isFile:!1,fullPath:this.myPath()}},render:function(){var entry=this.props.entry,nodeClass,childNodes,children=entry.get("children"),isOpen;entry.get("open")&&children?(nodeClass="open",childNodes=directoryContents({depth:this.props.depth+1,parentPath:this.myPath(),contents:children,extensions:this.props.extensions,actions:this.props.actions,forceRender:this.props.forceRender,platform:this.props.platform,sortDirectoriesFirst:this.props.sortDirectoriesFirst})):nodeClass="closed";var nameDisplay,cx,directoryClasses=Classnames({"jstree-clicked sidebar-selection":entry.get("selected"),"context-node":entry.get("context")}),nodeClasses="jstree-"+nodeClass;this.state.draggedOver&&(nodeClasses+=" jstree-draggedOver");var liArgs=[{className:this.getClasses(nodeClasses),onClick:this.handleClick,onMouseDown:this.handleMouseDown,draggable:!0,onDragStart:this.handleDrag,onDrop:this.handleDrop,onDragEnd:this.handleDragEnd,onDragOver:this.handleDragOver,onDragLeave:this.handleDragLeave},_createAlignedIns(this.props.depth)],thickness=_createThickness(this.props.depth);if(entry.get("rename"))liArgs.push(thickness),nameDisplay=directoryRenameInput({actions:this.props.actions,entry:entry,name:this.props.name,parentPath:this.props.parentPath});else{if(this.props.name)var name=DOM.span({},this.props.name);var aArgs=_.flatten([{href:"#",className:directoryClasses},thickness,this.getIcons(),name]);nameDisplay=DOM.a.apply(DOM.a,aArgs)}return liArgs.push(nameDisplay),liArgs.push(childNodes),DOM.li.apply(DOM.li,liArgs)}})),directoryContents=Preact.createFactory(Preact.createClass({shouldComponentUpdate:function(nextProps,nextState){return nextProps.forceRender||this.props.contents!==nextProps.contents||this.props.sortDirectoriesFirst!==nextProps.sortDirectoriesFirst||this.props.extensions!==nextProps.extensions},render:function(){var extensions=this.props.extensions,iconClass=extensions&&extensions.get("icons")?"jstree-icons":"jstree-no-icons",ulProps=this.props.isRoot?{className:"jstree-brackets jstree-no-dots "+iconClass}:null,contents=this.props.contents,namesInOrder=_sortDirectoryContents(contents,this.props.sortDirectoriesFirst);return DOM.ul(ulProps,namesInOrder.map(function(name){var entry=contents.get(name);return FileTreeViewModel.isFile(entry)?fileNode({depth:this.props.depth,parentPath:this.props.parentPath,name:name,entry:entry,actions:this.props.actions,extensions:this.props.extensions,forceRender:this.props.forceRender,platform:this.props.platform,key:name}):directoryNode({depth:this.props.depth,parentPath:this.props.parentPath,name:name,entry:entry,actions:this.props.actions,extensions:this.props.extensions,sortDirectoriesFirst:this.props.sortDirectoriesFirst,forceRender:this.props.forceRender,platform:this.props.platform,key:name})}.bind(this)).toArray())}}));var fileSelectionBox=Preact.createFactory(Preact.createClass({componentDidUpdate:function(){if(this.props.visible){var node=Preact.findDOMNode(this),selectedNode=$(node.parentNode).find(this.props.selectedClassName),selectionViewInfo=this.props.selectionViewInfo;0!==selectedNode.length&&(node.style.top=selectedNode.offset().top-selectionViewInfo.get("offsetTop")+selectionViewInfo.get("scrollTop")-selectedNode.position().top+"px")}},render:function(){var selectionViewInfo=this.props.selectionViewInfo,left=selectionViewInfo.get("scrollLeft"),width=selectionViewInfo.get("width"),scrollWidth=selectionViewInfo.get("scrollWidth");return DOM.div({style:{overflow:"auto",left:left,display:this.props.visible?"block":"none"},className:this.props.className})}})),selectionExtension=Preact.createFactory(Preact.createClass({componentDidUpdate:function(){if(this.props.visible){var node=Preact.findDOMNode(this),selectedNode=$(node.parentNode).find(this.props.selectedClassName).closest("li"),selectionViewInfo=this.props.selectionViewInfo;if(0!==selectedNode.length){var top=selectedNode.offset().top,baselineHeight=node.dataset.initialHeight,height=baselineHeight,scrollerTop=selectionViewInfo.get("offsetTop");if(baselineHeight||(baselineHeight=$(node).outerHeight(),node.dataset.initialHeight=baselineHeight,height=baselineHeight),top<scrollerTop-baselineHeight)node.style.display="none";else{if(node.style.display="block",top<scrollerTop){var difference=scrollerTop-top;top+=difference,height=parseInt(height,10),height-=difference}node.style.top=top+"px",node.style.height=height+"px",node.style.left=selectionViewInfo.get("width")-$(node).outerWidth()+"px"}}}},render:function(){return DOM.div({style:{display:this.props.visible?"block":"none"},className:this.props.className})}})),fileTreeView=Preact.createFactory(Preact.createClass({shouldComponentUpdate:function(nextProps,nextState){return nextProps.forceRender||this.props.treeData!==nextProps.treeData||this.props.sortDirectoriesFirst!==nextProps.sortDirectoriesFirst||this.props.extensions!==nextProps.extensions||this.props.selectionViewInfo!==nextProps.selectionViewInfo},handleDrop:function(e){var data=JSON.parse(e.dataTransfer.getData("text"));this.props.actions.moveItem(data.path,this.props.parentPath),e.stopPropagation()},handleDragOver:function(e){e.preventDefault()},render:function(){var selectionBackground=fileSelectionBox({ref:"selectionBackground",selectionViewInfo:this.props.selectionViewInfo,className:"filetree-selection",visible:this.props.selectionViewInfo.get("hasSelection"),selectedClassName:".selected-node",forceUpdate:!0}),contextBackground=fileSelectionBox({ref:"contextBackground",selectionViewInfo:this.props.selectionViewInfo,className:"filetree-context",visible:this.props.selectionViewInfo.get("hasContext"),selectedClassName:".context-node",forceUpdate:!0}),extensionForSelection=selectionExtension({selectionViewInfo:this.props.selectionViewInfo,selectedClassName:".selected-node",visible:this.props.selectionViewInfo.get("hasSelection"),forceUpdate:!0,className:"filetree-selection-extension"}),extensionForContext=selectionExtension({selectionViewInfo:this.props.selectionViewInfo,selectedClassName:".context-node",visible:this.props.selectionViewInfo.get("hasContext"),forceUpdate:!0,className:"filetree-context-extension"}),contents=directoryContents({isRoot:!0,depth:1,parentPath:this.props.parentPath,sortDirectoriesFirst:this.props.sortDirectoriesFirst,contents:this.props.treeData,extensions:this.props.extensions,actions:this.props.actions,forceRender:this.props.forceRender,platform:this.props.platform}),args={onDrop:this.handleDrop,onDragOver:this.handleDragOver};return DOM.div(args,contents,selectionBackground,contextBackground,extensionForSelection,extensionForContext)}}));function render(element,viewModel,projectRoot,actions,forceRender,platform){projectRoot&&Preact.render(fileTreeView({treeData:viewModel.treeData,selectionViewInfo:viewModel.selectionViewInfo,sortDirectoriesFirst:viewModel.sortDirectoriesFirst,parentPath:projectRoot.fullPath,actions:actions,extensions:_extensions,platform:platform,forceRender:forceRender}),element)}function _addExtension(category,callback){if(callback&&"function"==typeof callback){var callbackList=_extensions.get(category);callbackList||(callbackList=Immutable.List()),callbackList=(callbackList=callbackList.push(callback)).sortBy(f=>-f.priority),_extensions=_extensions.set(category,callbackList)}else console.error("Attempt to add FileTreeView",category,"extension without a callback function")}function addIconProvider(callback,priority=0){callback.priority=priority,_addExtension("icons",callback)}function addClassesProvider(callback,priority=0){callback.priority=priority,_addExtension("addClass",callback)}exports._sortFormattedDirectory=_sortDirectoryContents,exports._fileNode=fileNode,exports._directoryNode=directoryNode,exports._directoryContents=directoryContents,exports._fileTreeView=fileTreeView,exports.addIconProvider=addIconProvider,exports.addClassesProvider=addClassesProvider,exports.render=render});
//# sourceMappingURL=FileTreeView.js.map
