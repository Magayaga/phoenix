define(function(require,exports,module){var FileUtils=require("file/FileUtils"),EventDispatcher=require("utils/EventDispatcher"),NodeDomain=require("utils/NodeDomain"),NodeSocketTransportRemote=require("text!LiveDevelopment/MultiBrowserImpl/transports/remote/NodeSocketTransportRemote.js"),domainPath,NodeSocketTransportDomain=new NodeDomain("nodeSocketTransport",FileUtils.getNativeBracketsDirectoryPath()+"/"+FileUtils.getNativeModuleDirectoryPath(module)+"/node/NodeSocketTransportDomain"),SOCKET_PORT=8123;function getRemoteScript(){return"<script>\n"+NodeSocketTransportRemote+"this._Brackets_LiveDev_Socket_Transport_URL = 'ws://localhost:"+SOCKET_PORT+"';\n<\/script>\n"}["connect","message","close"].forEach(function(type){NodeSocketTransportDomain.on(type,function(){console.log("NodeSocketTransport - event - "+type+" - "+JSON.stringify(Array.prototype.slice.call(arguments,1))),exports.trigger(type,Array.prototype.slice.call(arguments,1))})}),EventDispatcher.makeEventDispatcher(exports),exports.getRemoteScript=getRemoteScript,["start","send","close"].forEach(function(method){exports[method]=function(){var args=Array.prototype.slice.call(arguments);args.unshift(method),console.log("NodeSocketTransport - "+args),NodeSocketTransportDomain.exec.apply(NodeSocketTransportDomain,args)}})});
//# sourceMappingURL=NodeSocketTransport.js.map
