define(function(require,exports,module){var FileSystemEntry=require("filesystem/FileSystemEntry");function Directory(fullPath,fileSystem){this._isDirectory=!0,FileSystemEntry.call(this,fullPath,fileSystem)}function _applyAllCallbacks(callbacks,args){if(callbacks.length>0){var callback=callbacks.pop();try{callback.apply(void 0,args)}finally{_applyAllCallbacks(callbacks,args)}}}Directory.prototype=Object.create(FileSystemEntry.prototype),Directory.prototype.constructor=Directory,Directory.prototype.parentClass=FileSystemEntry.prototype,Directory.prototype._contents=null,Directory.prototype._contentsStats=null,Directory.prototype._contentsStatsErrors=null,Directory.prototype._clearCachedData=function(preserveImmediateChildren){if(FileSystemEntry.prototype._clearCachedData.apply(this),!preserveImmediateChildren)if(this._contents)this._contents.forEach(function(child){child._clearCachedData(!0)});else{var dirPath=this.fullPath;this._fileSystem._index.visitAll(function(entry){entry.parentPath===dirPath&&entry._clearCachedData(!0)})}this._contents=void 0,this._contentsStats=void 0,this._contentsStatsErrors=void 0},Directory.prototype.getContents=function(callback){this._contentsCallbacks?this._contentsCallbacks.push(callback):this._contents?callback(null,this._contents,this._contentsStats,this._contentsStatsErrors):(this._contentsCallbacks=[callback],this._impl.readdir(this.fullPath,function(err,names,stats){var contents=[],contentsStats=[],contentsStatsErrors;if(err)this._clearCachedData();else{var watched=this._isWatched(!0);names.forEach(function(name,index){var entryPath=this.fullPath+name,entryStats=stats[index],entry;this._fileSystem._indexFilter(entryPath,name,entryStats)&&("string"==typeof entryStats?(void 0===contentsStatsErrors&&(contentsStatsErrors={}),contentsStatsErrors[entryPath]=entryStats):(entry=entryStats.isFile?this._fileSystem.getFileForPath(entryPath):this._fileSystem.getDirectoryForPath(entryPath),watched&&(entry._stat=entryStats),contents.push(entry),contentsStats.push(entryStats)))},this),watched&&(this._contents=contents,this._contentsStats=contentsStats,this._contentsStatsErrors=contentsStatsErrors)}var currentCallbacks=this._contentsCallbacks,callbackArgs;this._contentsCallbacks=null,_applyAllCallbacks(currentCallbacks,[err,contents,contentsStats,contentsStatsErrors])}.bind(this)))},Directory.prototype.create=function(callback){callback=callback||function(){},this._fileSystem._beginChange(),this._impl.mkdir(this._path,function(err,stat){if(err){this._clearCachedData();try{return void callback(err)}finally{this._fileSystem._endChange()}}var parent=this._fileSystem.getDirectoryForPath(this.parentPath);this._isWatched()&&(this._stat=stat),this._fileSystem._handleDirectoryChange(parent,function(added,removed){try{callback(null,stat)}finally{parent._isWatched()&&this._fileSystem._fireChangeEvent(parent,added,removed),this._fileSystem._endChange()}}.bind(this))}.bind(this))},module.exports=Directory});
//# sourceMappingURL=Directory.js.map
