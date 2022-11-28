define(function(require,exports,module){async function _ensureExistsAsync(path){return new Promise((resolve,reject)=>{Phoenix.VFS.ensureExistsDir(path,err=>{err?reject(err):resolve()})})}function _copyZippedItemToFS(path,item,destProjectDir,flattenFirstLevel){return new Promise(async(resolve,reject)=>{try{let destPath=`${destProjectDir}${path}`;if(flattenFirstLevel){let newPath=path.substr(path.indexOf("/")+1);destPath=`${destProjectDir}${newPath}`,console.log(destPath)}item.dir?(await _ensureExistsAsync(destPath),resolve(destPath)):(await _ensureExistsAsync(window.path.dirname(destPath)),item.async("uint8array").then(function(data){window.fs.writeFile(destPath,Filer.Buffer.from(data),writeErr=>{writeErr?reject(writeErr):resolve(destPath)})}).catch(error=>{reject(error)}))}catch(e){reject(e)}})}function unzipFileToLocation(zipData,projectDir,flattenFirstLevel=!1){return projectDir.endsWith("/")||(projectDir+="/"),new Promise((resolve,reject)=>{JSZip.loadAsync(zipData).then(function(zip){let keys=Object.keys(zip.files),allPromises=[];keys.forEach(path=>{allPromises.push(_copyZippedItemToFS(path,zip.files[path],projectDir,flattenFirstLevel))}),Promise.all(allPromises).then(()=>{console.log("Unzip complete: ",projectDir),resolve()}).catch(err=>{console.error("unzip failed",err),reject(err)})})})}function unzipURLToLocation(url,projectDir,flattenFirstLevel=!1){return new Promise((resolve,reject)=>{window.JSZipUtils.getBinaryContent(url,async function(err,data){err?(console.error(`could not load zip from URL: ${url}\n `,err),reject()):unzipFileToLocation(data,projectDir,flattenFirstLevel).then(resolve).catch(reject)})})}exports.unzipFileToLocation=unzipFileToLocation,exports.unzipURLToLocation=unzipURLToLocation});
//# sourceMappingURL=utils.js.map
