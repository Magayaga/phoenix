define(function(require,exports,module){var FileSystemEntry=require("filesystem/FileSystemEntry");function File(fullPath,fileSystem){this._isFile=!0,FileSystemEntry.call(this,fullPath,fileSystem)}File.prototype=Object.create(FileSystemEntry.prototype),File.prototype.constructor=File,File.prototype.parentClass=FileSystemEntry.prototype,File.prototype._contents=null,File.prototype._encoding=null,File.prototype._preserveBOM=!1,File.prototype._hash=null,File.prototype._clearCachedData=function(){FileSystemEntry.prototype._clearCachedData.apply(this),this._contents=null},File.prototype.read=function(options,callback){if("function"==typeof options&&(callback=options,(options={}).encoding=this._encoding),options.encoding||(options.encoding="utf8"),null!==this._contents&&this._stat&&options.encoding===this._encoding)callback(null,this._contents,this._encoding,this._stat);else{var watched=this._isWatched();watched&&(options.stat=this._stat),this._impl.readFile(this._path,options,function(err,data,encoding,preserveBOM,stat){if(err)return this._clearCachedData(),void callback(err);this._hash=stat._hash,this._encoding=encoding,this._preserveBOM=preserveBOM,watched&&(this._stat=stat,this._contents=data),callback(err,data,encoding,stat)}.bind(this))}},File.prototype.write=function(data,options,callback){"function"==typeof options?(callback=options,options={}):(void 0===options&&(options={}),callback=callback||function(){}),options.blind||(options.expectedHash=this._hash,options.expectedContents=this._contents),options.encoding||(options.encoding="utf8"),options.preserveBOM=this._preserveBOM,this._fileSystem._beginChange(),this._impl.writeFile(this._path,data,options,function(err,stat,created){if(err){this._clearCachedData();try{return void callback(err)}finally{this._fileSystem._endChange()}}if(this._hash=stat._hash,this._isWatched()&&(this._stat=stat,this._contents=data),created){var parent=this._fileSystem.getDirectoryForPath(this.parentPath);this._fileSystem._handleDirectoryChange(parent,function(added,removed){try{callback(null,stat)}finally{parent._isWatched()&&this._fileSystem._fireChangeEvent(parent,added,removed),this._fileSystem._endChange()}}.bind(this))}else try{callback(null,stat)}finally{this._fileSystem._fireChangeEvent(this),this._fileSystem._endChange()}}.bind(this))},module.exports=File});
//# sourceMappingURL=File.js.map
