define(function(require,exports,module){var CSSUtils=require("language/CSSUtils"),DropdownButton=require("widgets/DropdownButton").DropdownButton,CommandManager=require("command/CommandManager"),Commands=require("command/Commands"),DocumentManager=require("document/DocumentManager"),EditorManager=require("editor/EditorManager"),Editor=require("editor/Editor").Editor,LanguageManager=require("language/LanguageManager"),ProjectManager=require("project/ProjectManager"),FileUtils=require("file/FileUtils"),HTMLUtils=require("language/HTMLUtils"),MultiRangeInlineEditor=require("editor/MultiRangeInlineEditor"),Strings=require("strings"),ViewUtils=require("utils/ViewUtils"),Metrics=require("utils/Metrics"),_=require("thirdparty/lodash"),_newRuleCmd,_newRuleHandlers=[];function _getCSSFilesInProject(){return ProjectManager.getAllFiles(ProjectManager.getLanguageFilter(["css","less","scss"]))}function _getSelectorName(editor,pos){var tagInfo=HTMLUtils.getTagInfo(editor,pos),selectorName="",reason;if(tagInfo.position.tokenType===HTMLUtils.TAG_NAME||tagInfo.position.tokenType===HTMLUtils.CLOSING_TAG)selectorName=tagInfo.tagName;else if(tagInfo.position.tokenType===HTMLUtils.ATTR_NAME||tagInfo.position.tokenType===HTMLUtils.ATTR_VALUE)if("class"===tagInfo.attr.name){var attributeValue=tagInfo.attr.value;if(/\S/.test(attributeValue)){var startIndex=attributeValue.substr(0,tagInfo.position.offset).lastIndexOf(" "),endIndex=attributeValue.indexOf(" ",tagInfo.position.offset);"."===(selectorName="."+attributeValue.substring(-1===startIndex?0:startIndex+1,-1===endIndex?attributeValue.length:endIndex))&&(selectorName="",reason=Strings.ERROR_CSSQUICKEDIT_BETWEENCLASSES)}else reason=Strings.ERROR_CSSQUICKEDIT_CLASSNOTFOUND}else if("id"===tagInfo.attr.name){var trimmedVal=tagInfo.attr.value.trim();trimmedVal?selectorName="#"+trimmedVal:reason=Strings.ERROR_CSSQUICKEDIT_IDNOTFOUND}else reason=Strings.ERROR_CSSQUICKEDIT_UNSUPPORTEDATTR;return{selectorName:selectorName,reason:reason}}function _addRule(selectorName,inlineEditor,path){DocumentManager.getDocumentForPath(path).done(function(styleDoc){var newRuleInfo=CSSUtils.addRuleToDocument(styleDoc,selectorName,Editor.getUseTabChar(path),Editor.getSpaceUnits(path));inlineEditor.addAndSelectRange(selectorName,styleDoc,newRuleInfo.range.from.line,newRuleInfo.range.to.line),inlineEditor.editor.setCursorPos(newRuleInfo.pos.line,newRuleInfo.pos.ch)})}function _handleNewRule(){var inlineEditor=MultiRangeInlineEditor.getFocusedMultiRangeInlineEditor();if(inlineEditor){var handlerInfo=_.find(_newRuleHandlers,function(entry){return entry.inlineEditor===inlineEditor});handlerInfo&&handlerInfo.handler()}}function _stylesheetListRenderer(item){var html="<span class='stylesheet-name'>"+_.escape(item.name);return item.subDirStr&&(html+="<span class='stylesheet-dir'> — "+_.escape(item.subDirStr)+"</span>"),html+="</span>"}function htmlToCSSProvider(hostEditor,pos){if("html"!==hostEditor.getLanguageForSelection().getId())return null;Metrics.countEvent(Metrics.EVENT_TYPE.EDITOR,"QuickEdit","CSSInlineEditor");var sel=hostEditor.getSelection();if(sel.start.line!==sel.end.line)return null;var selectorResult=_getSelectorName(hostEditor,sel.start);if(""===selectorResult.selectorName)return selectorResult.reason||null;var selectorName=selectorResult.selectorName,result=new $.Deferred,cssInlineEditor,cssFileInfos=[],newRuleButton;function _onDropdownSelect(event,fileInfo){_addRule(selectorName,cssInlineEditor,fileInfo.fullPath)}function _getNoRulesMsg(){var result=new $.Deferred;return _getCSSFilesInProject().done(function(fileInfos){result.resolve(fileInfos.length?Strings.CSS_QUICK_EDIT_NO_MATCHES:Strings.CSS_QUICK_EDIT_NO_STYLESHEETS)}),result}function _updateCommands(){_newRuleCmd.setEnabled(cssInlineEditor.hasFocus()&&!newRuleButton.$button.hasClass("disabled"))}function _handleNewRuleClick(e){newRuleButton.$button.hasClass("disabled")||(1===cssFileInfos.length?_addRule(selectorName,cssInlineEditor,cssFileInfos[0].fullPath):newRuleButton.toggleDropdown())}function _fileComparator(a,b){var aIsCSS="css"===LanguageManager.getLanguageForPath(a.fullPath).getId(),bIsCSS="css"===LanguageManager.getLanguageForPath(b.fullPath).getId();return aIsCSS&&!bIsCSS?1:!aIsCSS&&bIsCSS?-1:FileUtils.comparePaths(a.fullPath,b.fullPath)}function _prepFileList(files){files.sort(_fileComparator);var fileNames={};return files.forEach(function(file){fileNames[file.name]||(fileNames[file.name]=[]),fileNames[file.name].push(file)}),_.forEach(fileNames,function(files){if(files.length>1){var displayPaths=ViewUtils.getDirNamesForDuplicateFiles(files);files.forEach(function(file,i){file.subDirStr=displayPaths[i]})}}),files}function _onHostEditorScroll(){newRuleButton.closeDropdown()}return CSSUtils.findMatchingRules(selectorName,hostEditor.document).done(function(rules){var inlineEditorDeferred=new $.Deferred;(cssInlineEditor=new MultiRangeInlineEditor.MultiRangeInlineEditor(CSSUtils.consolidateRules(rules),_getNoRulesMsg,CSSUtils.getRangeSelectors,_fileComparator)).load(hostEditor),cssInlineEditor.$htmlContent.on("focusin",_updateCommands).on("focusout",_updateCommands),cssInlineEditor.on("add",function(){inlineEditorDeferred.resolve()}),cssInlineEditor.on("close",function(){newRuleButton.closeDropdown(),hostEditor.off("scroll",_onHostEditorScroll)});var $header=$(".inline-editor-header",cssInlineEditor.$htmlContent);(newRuleButton=new DropdownButton(Strings.BUTTON_NEW_RULE,[],_stylesheetListRenderer)).$button.addClass("disabled"),newRuleButton.$button.addClass("btn-mini stylesheet-button"),$header.append(newRuleButton.$button),_newRuleHandlers.push({inlineEditor:cssInlineEditor,handler:_handleNewRuleClick}),hostEditor.on("scroll",_onHostEditorScroll),result.resolve(cssInlineEditor);var stylesheetsPromise=_getCSSFilesInProject();$.when(stylesheetsPromise,inlineEditorDeferred.promise()).done(function(fileInfos){(cssFileInfos=_prepFileList(fileInfos)).length>0&&(newRuleButton.$button.removeClass("disabled"),rules.length||newRuleButton.$button.focus(),1===cssFileInfos.length?(newRuleButton.$button.removeClass("btn-dropdown"),newRuleButton.$button.on("click",_handleNewRuleClick)):(newRuleButton.items=cssFileInfos,newRuleButton.on("select",_onDropdownSelect))),_updateCommands()})}).fail(function(error){console.warn("Error in findMatchingRules()",error),result.reject()}),result.promise()}EditorManager.registerInlineEditProvider(htmlToCSSProvider),(_newRuleCmd=CommandManager.register(Strings.CMD_CSS_QUICK_EDIT_NEW_RULE,Commands.CSS_QUICK_EDIT_NEW_RULE,_handleNewRule)).setEnabled(!1)});
//# sourceMappingURL=CSSInlineEditor.js.map
