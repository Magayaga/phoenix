define(function(require,exports,module){const WorkerComm=require("worker/WorkerComm"),EventDispatcher=require("utils/EventDispatcher"),_FileIndexingWorker=new Worker(`${Phoenix.baseURL}worker/file-Indexing-Worker.js?debug=${"true"===window.logToConsolePref}`);_FileIndexingWorker||console.error("Could not load find in files worker! Search will be disabled."),EventDispatcher.makeEventDispatcher(exports),WorkerComm.createWorkerComm(_FileIndexingWorker,exports),exports.EVENT_CRAWL_STARTED="crawlStarted",exports.EVENT_CRAWL_PROGRESS="crawlProgress",exports.EVENT_CRAWL_COMPLETE="crawlComplete"});
//# sourceMappingURL=IndexingWorker.js.map
