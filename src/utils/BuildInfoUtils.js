define(function(require,exports,module){var FileSystem=require("filesystem/FileSystem"),FileUtils=require("file/FileUtils");function _loadSHA(path,callback){var result=new $.Deferred;if(brackets.inBrowser)result.reject();else{var file=FileSystem.getFileForPath(path);FileUtils.readAsText(file).done(function(text){if(0===text.indexOf("ref: ")){var basePath=path.substr(0,path.lastIndexOf("/")),refRelPath=text.substr(5).trim(),branch=text.substr(16).trim();_loadSHA(basePath+"/"+refRelPath,callback).done(function(data){result.resolve({branch:branch,sha:data.sha.trim()})}).fail(function(){result.resolve({branch:branch})})}else result.resolve({sha:text})}).fail(function(){result.reject()})}return result.promise()}function getBracketsSHA(){var result=new $.Deferred,bracketsSrc=FileUtils.getNativeBracketsDirectoryPath(),bracketsGitRoot;return _loadSHA(bracketsSrc.substr(0,bracketsSrc.lastIndexOf("/"))+"/.git/HEAD").done(function(data){result.resolve(data.branch||"HEAD",data.sha||"unknown",!0)}).fail(function(){result.resolve(brackets.metadata.repository.branch,brackets.metadata.repository.SHA,!1)}),result.promise()}require("utils/Global"),exports.getBracketsSHA=getBracketsSHA});
//# sourceMappingURL=BuildInfoUtils.js.map
