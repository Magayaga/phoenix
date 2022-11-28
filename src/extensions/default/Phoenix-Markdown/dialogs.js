define(function(require,exports,module){var Dialogs=brackets.getModule("widgets/Dialogs"),FileSystem=brackets.getModule("filesystem/FileSystem"),Mustache=brackets.getModule("thirdparty/mustache/mustache"),Strings=require("strings"),_pathDialogTemplate=require("text!templates/path-dialog.html");function getRelativeFilename(basePath,filename){basePath.endsWith("/")&&(basePath=basePath.slice(0,basePath.length-1));for(var basename=filename.slice(filename.lastIndexOf("/")+1),dirname=filename.slice(0,filename.lastIndexOf("/")+1),relapath="";!dirname.startsWith(basePath);)relapath+="../",basePath=basePath.slice(0,basePath.lastIndexOf("/"));return relapath+dirname.slice(basePath.length+1)+basename}function getRelativeFile(basePath,cb){FileSystem.showOpenDialog(!1,!1,"Select file",null,null,function(err,files){files&&files[0]?cb(getRelativeFilename(basePath,files[0])):cb("")})}function displayPathDialog(editor,templateVars,fn){var selection=editor.getSelection();templateVars.textInit=editor.document.getRange(selection.start,selection.end),templateVars.pathInit=templateVars.textInit.includes("://")?templateVars.textInit:"";var dialog=Dialogs.showModalDialogUsingTemplate(Mustache.render(_pathDialogTemplate,templateVars)),textField=dialog.getElement().find(".input-text"),pathField=dialog.getElement().find(".input-path"),fileButton;dialog.getElement().find("#choose-file").on("click",function(){getRelativeFile(editor.getFile().parentPath,function(filename){pathField.val(filename)})}),dialog.done(function(buttonId){buttonId===Dialogs.DIALOG_BTN_OK&&fn(textField.val(),pathField.val())})}exports.image=function(editor){var templateVars={Strings:Strings,dialogTitle:Strings.IMAGE_DIALOG,textTitle:Strings.IMAGE_TEXT_TITLE,textPlaceholder:Strings.IMAGE_TEXT_PLACEHOLDER,pathTitle:Strings.IMAGE_PATH_TITLE,pathPlaceholder:Strings.IMAGE_PATH_PLACEHOLDER},selection=editor.getSelection();displayPathDialog(editor,templateVars,function(textField,pathField){var imageString="!["+textField+"]("+pathField+")";editor.document.replaceRange(imageString,selection.start,selection.end,"+mdbar")})},exports.link=function(editor){var templateVars={Strings:Strings,dialogTitle:Strings.LINK_DIALOG,textTitle:Strings.LINK_TEXT_TITLE,textPlaceholder:Strings.LINK_TEXT_PLACEHOLDER,pathTitle:Strings.LINK_PATH_TITLE,pathPlaceholder:Strings.LINK_PATH_PLACEHOLDER},selection=editor.getSelection();displayPathDialog(editor,templateVars,function(textField,pathField){var linkString="["+textField+"]("+pathField+")";editor.document.replaceRange(linkString,selection.start,selection.end,"+mdbar")})}});
//# sourceMappingURL=dialogs.js.map
