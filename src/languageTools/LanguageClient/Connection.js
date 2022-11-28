!function(){var protocol=require("vscode-languageserver-protocol"),Actions={OnClose:{Stop:0,Restart:1},OnError:{Ignore:0,Stop:1}};function ActionController(){this.restartsTimes=[]}function _getOnCloseHandler(connection,actionController,restartLanguageClient){return function(){try{connection&&connection.dispose()}catch(error){}var action=Actions.OnClose.Stop;try{action=actionController.getOnCloseAction()}catch(error){}action===Actions.OnClose.Restart&&restartLanguageClient()}}function _getOnErrorHandler(actionController,stopLanguageClient){return function(errorData){var action;actionController.getOnErrorAction(errorData)===Actions.OnError.Stop&&stopLanguageClient()}}function Logger(){}function createConnection(reader,writer,restartLanguageClient,stopLanguageClient){var logger=new Logger,actionController=new ActionController,connection=protocol.createProtocolConnection(reader,writer,logger),errorHandler=_getOnErrorHandler(actionController,stopLanguageClient),closeHandler=_getOnCloseHandler(connection,actionController,restartLanguageClient);return connection.onError(errorHandler),connection.onClose(closeHandler),connection}ActionController.prototype.getOnErrorAction=function(errorData){var errorCount;return errorData[2]<=3?Actions.OnError.Ignore:Actions.OnError.Restart},ActionController.prototype.getOnCloseAction=function(){var currentTime=Date.now();this.restartsTimes.push(currentTime);var numRestarts=this.restartsTimes.length,timeBetweenFiveRestarts;return numRestarts<5?Actions.OnClose.Restart:this.restartsTimes[numRestarts-1]-this.restartsTimes[0]<=18e4?Actions.OnClose.Stop:(this.restartsTimes.shift(),Actions.OnClose.Restart)},Logger.prototype.error=function(message){console.error(message)},Logger.prototype.warn=function(message){console.warn(message)},Logger.prototype.info=function(message){console.info(message)},Logger.prototype.log=function(message){console.log(message)},exports.createConnection=createConnection}();
//# sourceMappingURL=Connection.js.map
