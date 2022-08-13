define(function(require,exports,module){var PathUtils=require("thirdparty/path-utils/path-utils"),FileUtils=require("file/FileUtils");function uriToPath(uri){var url=PathUtils.parseUrl(uri);if("file:"!==url.protocol||void 0===url.pathname)return uri;let filePath=decodeURIComponent(url.pathname);return"win"===brackets.platform?(filePath&&filePath.includes(":/")&&"/"===filePath[0]&&(filePath=filePath.substr(1)),filePath):filePath}function pathToUri(filePath){var newPath=convertWinToPosixPath(filePath);return"/"!==newPath[0]&&(newPath=`/${newPath}`),encodeURI(`file://${newPath}`).replace(/[?#]/g,encodeURIComponent)}function convertToWorkspaceFolders(paths){var workspaceFolders;return paths.map(function(folderPath){var uri,name;return{uri:pathToUri(folderPath),name:FileUtils.getBasename(folderPath)}})}function convertPosixToWinPath(path){return path.replace(/\//g,"\\")}function convertWinToPosixPath(path){return path.replace(/\\/g,"/")}exports.uriToPath=uriToPath,exports.pathToUri=pathToUri,exports.convertPosixToWinPath=convertPosixToWinPath,exports.convertPosixToWinPath=convertPosixToWinPath,exports.convertToWorkspaceFolders=convertToWorkspaceFolders});
//# sourceMappingURL=PathConverters.js.map
