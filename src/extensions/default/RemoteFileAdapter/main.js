define(function(require,exports,module){var AppInit=brackets.getModule("utils/AppInit"),QuickOpen=brackets.getModule("search/QuickOpen"),PathUtils=brackets.getModule("thirdparty/path-utils/path-utils"),CommandManager=brackets.getModule("command/CommandManager"),Commands=brackets.getModule("command/Commands"),ExtensionUtils=brackets.getModule("utils/ExtensionUtils"),WorkingSetView=brackets.getModule("project/WorkingSetView"),MainViewManager=brackets.getModule("view/MainViewManager"),Menus=brackets.getModule("command/Menus"),HTTP_PROTOCOL="http:",HTTPS_PROTOCOL="https:";function protocolClassProvider(data){return data.fullPath.startsWith("http://")?"http":data.fullPath.startsWith("https://")?"https":""}function _setMenuItemsVisible(){var file=MainViewManager.getCurrentlyViewedFile(MainViewManager.ACTIVE_PANE),cMenuItems=[Commands.FILE_SAVE,Commands.FILE_RENAME,Commands.NAVIGATE_SHOW_IN_FILE_TREE],enable=!file||"RemoteFile"!==file.constructor.name;cMenuItems.forEach(function(item){CommandManager.get(item).setEnabled(enable)})}function _getGitHubRawURL(urlObject){let pathVector=urlObject.pathname.split("/"),BLOB_STRING_LOCATION=3;if(pathVector.length>4&&"blob"===pathVector[3]){let newPath;return pathVector.splice(3,1),`https://raw.githubusercontent.com${pathVector.join("/")}`}return urlObject.href}function _getGitLabRawURL(urlObject){let pathVector=urlObject.pathname.split("/"),BLOB_STRING_LOCATION=4;if(pathVector.length>5&&"blob"===pathVector[4]){let newPath;return pathVector[4]="raw",`https://gitlab.com${pathVector.join("/")}`}return urlObject.href}function _getRawURL(url){let urlObject=new URL(url);switch(urlObject.hostname){case"github.com":return _getGitHubRawURL(urlObject);case"gitlab.com":return _getGitLabRawURL(urlObject);default:return url}}ExtensionUtils.loadStyleSheet(module,"styles.css"),AppInit.htmlReady(function(){Menus.getContextMenu(Menus.ContextMenuIds.WORKING_SET_CONTEXT_MENU).on("beforeContextMenuOpen",_setMenuItemsVisible),MainViewManager.on("currentFileChange",_setMenuItemsVisible),QuickOpen.addQuickOpenPlugin({name:"Remote file URI input",languageIds:[],search:function(){return $.Deferred().resolve([arguments[0]])},match:function(query){var protocol=PathUtils.parseUrl(query).protocol;return-1!==[HTTP_PROTOCOL,HTTPS_PROTOCOL].indexOf(protocol)},itemFocus:function(query){},itemSelect:function(){CommandManager.execute(Commands.FILE_OPEN,{fullPath:_getRawURL(arguments[0])})}}),WorkingSetView.addClassProvider(protocolClassProvider)})});
//# sourceMappingURL=main.js.map
