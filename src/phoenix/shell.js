import init from"./init_vfs.js";import ERR_CODES from"./errno.js";import getBrowserDetails from"./browserDetails.js";function _getBaseURL(){let base=window.location.href.split("?")[0];return base.endsWith(".html")&&(base=base.slice(0,base.lastIndexOf("/"))),base.endsWith("/")||(base=`${base}/`),base}let Phoenix={browser:getBrowserDetails(),baseURL:_getBaseURL()},startTime=Date.now();window.Phoenix=Phoenix,init(Phoenix),Phoenix.app={getNodeState:function(cbfn){cbfn(new Error("Node cannot be run in phoenix browser mode"))},openURLInDefaultBrowser:function(url){window.open(url)},getApplicationSupportDirectory:Phoenix.VFS.getAppSupportDir,getUserDocumentsDirectory:Phoenix.VFS.getUserDocumentsDirectory,ERR_CODES:ERR_CODES,getElapsedMilliseconds:function(){return Date.now()-startTime},language:navigator.language},window.appshell||(window.appshell=Phoenix);
//# sourceMappingURL=shell.js.map
