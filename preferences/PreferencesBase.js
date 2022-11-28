define(function(require,exports,module){var FileUtils=require("file/FileUtils"),FileSystem=require("filesystem/FileSystem"),FileSystemError=require("filesystem/FileSystemError"),EventDispatcher=require("utils/EventDispatcher"),_=require("thirdparty/lodash"),Async=require("utils/Async"),globmatch=require("thirdparty/globmatch"),PREFERENCE_CHANGE="change",SCOPEORDER_CHANGE="scopeOrderChange";function MemoryStorage(data){this.data=data||{}}function ParsingError(message){this.name="ParsingError",this.message=message||""}function FileStorage(path,createIfMissing,recreateIfInvalid){this.path=path,this.createIfMissing=createIfMissing,this.recreateIfInvalid=recreateIfInvalid,this._lineEndings=FileUtils.getPlatformLineEndings()}function Scope(storage){this.storage=storage,storage.on("changed",this.load.bind(this)),this.data={},this._dirty=!1,this._layers=[],this._layerMap={},this._exclusions=[]}function _findMatchingGlob(pathData,filename){var globs=Object.keys(pathData),globCounter;if(filename)for(globCounter=0;globCounter<globs.length;globCounter++){var glob=globs[globCounter];if(globmatch(filename,glob))return glob}}function ProjectLayer(){this.projectPath=null}function LanguageLayer(){}function PathLayer(prefFilePath){this.setPrefFilePath(prefFilePath)}function Preference(properties){_.extend(this,properties)}function _addEventDispatcherImpl(proto){var temp={};EventDispatcher.makeEventDispatcher(temp),proto._on_internal=temp.on,proto._off_internal=temp.off,proto.trigger=temp.trigger}function PrefixedPreferencesSystem(base,prefix){this.base=base,this.prefix=prefix,this._listenerInstalled=!1}function PreferencesSystem(contextBuilder){this.contextBuilder=contextBuilder,this._knownPrefs={},this._scopes={default:new Scope(new MemoryStorage)},this._scopes.default.load(),this._defaults={scopeOrder:["default"],_shadowScopeOrder:[{id:"default",scope:this._scopes.default,promise:(new $.Deferred).resolve().promise()}]},this._pendingScopes={},this._saveInProgress=!1,this._nextSaveDeferred=null,this._pathScopeDefinitions={},this._pathScopeFilenames=[],this._pathScopes={},this._changeEventQueue=null;var notifyPrefChange=function(id){var pref=this._knownPrefs[id];pref&&pref.trigger(PREFERENCE_CHANGE)}.bind(this);this.on(PREFERENCE_CHANGE,function(e,data){data.ids.forEach(notifyPrefChange)}.bind(this))}MemoryStorage.prototype={load:function(){var result=new $.Deferred;return result.resolve(this.data),result.promise()},save:function(newData){var result=new $.Deferred;return this.data=newData,result.resolve(),result.promise()},fileChanged:function(filePath){}},EventDispatcher.makeEventDispatcher(MemoryStorage.prototype),ParsingError.prototype=new Error,FileStorage.prototype={load:function(){var result=new $.Deferred,path=this.path,createIfMissing=this.createIfMissing,recreateIfInvalid=this.recreateIfInvalid,self=this,prefFile;path?FileSystem.getFileForPath(path).read({},function(err,text){if(err)createIfMissing?(!recreateIfInvalid||err!==FileSystemError.NOT_READABLE&&err!==FileSystemError.UNSUPPORTED_ENCODING||appshell.fs.unlink(path,function(err){err?console.log("Cannot move unreadable preferences file "+path+" to trash!!"):console.log("Brackets has recreated the unreadable preferences file "+path+". You may refer to the deleted file in trash in case you need it!!")}.bind(this)),result.resolve({})):result.reject(new Error("Unable to load preferences at "+path+" "+err));else if(self._lineEndings=FileUtils.sniffLineEndings(text),/^\s*$/.test(text))result.resolve({});else try{result.resolve(JSON.parse(text))}catch(e){recreateIfInvalid?(appshell.fs.unlink(path,function(err){err?console.log("Cannot move unparseable preferences file "+path+" to trash!!"):console.log("Brackets has recreated the Invalid JSON preferences file "+path+". You may refer to the deleted file in trash in case you need it!!")}.bind(this)),result.resolve({})):result.reject(new ParsingError("Invalid JSON settings at "+path+"("+e.toString()+")"))}}):result.resolve({});return result.promise()},save:function(newData){var result=new $.Deferred,path=this.path,prefFile=FileSystem.getFileForPath(path);if(path)try{var text=JSON.stringify(newData,null,4);text=FileUtils.translateLineEndings(text,this._lineEndings),prefFile.write(text,{},function(err){err?result.reject("Unable to save prefs at "+path+" "+err):result.resolve()})}catch(e){result.reject("Unable to convert prefs to JSON"+e.toString())}else result.resolve();return result.promise()},setPath:function(newPath){this.path=newPath,this.trigger("changed")},fileChanged:function(filePath){filePath===this.path&&this.trigger("changed")}},EventDispatcher.makeEventDispatcher(FileStorage.prototype),_.extend(Scope.prototype,{load:function(){var result=new $.Deferred;return this.storage.load().then(function(data){var oldKeys=this.getKeys();this.data=data,result.resolve(),this.trigger(PREFERENCE_CHANGE,{ids:_.union(this.getKeys(),oldKeys)})}.bind(this)).fail(function(error){result.reject(error)}),result.promise()},save:function(){var self=this;return this._dirty?(this._dirty=!1,this.storage.save(this.data)):(new $.Deferred).resolve().promise()},set:function(id,value,context,location){if(location||(location=this.getPreferenceLocation(id,context)),location&&location.layer){var layer=this._layerMap[location.layer];if(layer){void 0===this.data[layer.key]&&(this.data[layer.key]={});var wasSet=layer.set(this.data[layer.key],id,value,context,location.layerID);return this._dirty=this._dirty||wasSet,wasSet}return!1}return this._performSet(id,value)},_performSet:function(id,value){return!_.isEqual(this.data[id],value)&&(this._dirty=!0,void 0===value?delete this.data[id]:this.data[id]=_.cloneDeep(value),!0)},get:function(id,context){var layerCounter,layers=this._layers,layer,data=this.data,result;for(context=context||{},layerCounter=0;layerCounter<layers.length;layerCounter++)if(void 0!==(result=(layer=layers[layerCounter]).get(data[layer.key],id,context)))return result;if(-1===this._exclusions.indexOf(id))return data[id]},getPreferenceLocation:function(id,context){var layerCounter,layers=this._layers,layer,data=this.data,result;for(context=context||{},layerCounter=0;layerCounter<layers.length;layerCounter++)if(void 0!==(result=(layer=layers[layerCounter]).getPreferenceLocation(data[layer.key],id,context)))return{layer:layer.key,layerID:result};if(-1===this._exclusions.indexOf(id)&&void 0!==data[id])return{}},getKeys:function(context){context=context||{};var layerCounter,layers=this._layers,layer,data=this.data,keySets=[_.difference(_.keys(data),this._exclusions)];for(layerCounter=0;layerCounter<layers.length;layerCounter++)layer=layers[layerCounter],keySets.push(layer.getKeys(data[layer.key],context));return _.union.apply(null,keySets)},addLayer:function(layer){this._layers.push(layer),this._layerMap[layer.key]=layer,this._exclusions.push(layer.key),this.trigger(PREFERENCE_CHANGE,{ids:layer.getKeys(this.data[layer.key],{})})},fileChanged:function(filePath){this.storage.fileChanged(filePath)},contextChanged:function(oldContext,newContext){var changes=[],data=this.data;return _.each(this._layers,function(layer){if(data[layer.key]&&oldContext[layer.key]!==newContext[layer.key]){var changesInLayer=layer.contextChanged(data[layer.key],oldContext,newContext);changesInLayer&&changes.push(changesInLayer)}}),_.union.apply(null,changes)}}),EventDispatcher.makeEventDispatcher(Scope.prototype),ProjectLayer.prototype={key:"project",get:function(data,id){if(data&&this.projectPath)return data[this.projectPath]&&void 0!==data[this.projectPath][id]?data[this.projectPath][id]:void 0},getPreferenceLocation:function(data,id){if(data&&this.projectPath)return data[this.projectPath]&&void 0!==data[this.projectPath][id]?this.projectPath:void 0},set:function(data,id,value,context,layerID){if(layerID||(layerID=this.getPreferenceLocation(data,id)),!layerID)return!1;var section=data[layerID];return section||(data[layerID]=section={}),!_.isEqual(section[id],value)&&(void 0===value?delete section[id]:section[id]=_.cloneDeep(value),!0)},getKeys:function(data){if(data)return _.union.apply(null,_.map(_.values(data),_.keys))},setProjectPath:function(projectPath){this.projectPath=projectPath}},LanguageLayer.prototype={key:"language",get:function(data,id,context){if(data&&context.language)return data[context.language]&&void 0!==data[context.language][id]?data[context.language][id]:void 0},getPreferenceLocation:function(data,id,context){if(data&&context.language)return data[context.language]&&void 0!==data[context.language][id]?context.language:void 0},getKeys:function(data,context){if(data)return _.isEmpty(context)?_.union.apply(null,_.map(_.values(data),_.keys)):data[context.language]?_.keys(data[context.language]):[]},set:function(data,id,value,context,layerID){if(layerID||(layerID=this.getPreferenceLocation(data,id,context)),!layerID)return!1;var section=data[layerID];return section||(data[layerID]=section={}),!_.isEqual(section[id],value)&&(void 0===value?(delete section[id],_.isEmpty(section)&&delete data[layerID]):section[id]=_.cloneDeep(value),!0)},contextChanged:function(data,oldContext,newContext){return void 0===newContext.language?_.keys(data[oldContext.language]):void 0===oldContext.language?_.keys(data[newContext.language]):_.union(_.keys(data[newContext.language]),_.keys(data[oldContext.language]))}},PathLayer.prototype={key:"path",get:function(data,id,context){var glob=this.getPreferenceLocation(data,id,context);if(glob)return data[glob][id]},getPreferenceLocation:function(data,id,context){if(data){var relativeFilename=FileUtils.getRelativeFilename(this.prefFilePath,context[this.key]);if(relativeFilename)return _findMatchingGlob(data,relativeFilename)}},set:function(data,id,value,context,layerID){if(layerID||(layerID=this.getPreferenceLocation(data,id,context)),!layerID)return!1;var section=data[layerID];return section||(data[layerID]=section={}),!_.isEqual(section[id],value)&&(void 0===value?delete section[id]:section[id]=_.cloneDeep(value),!0)},getKeys:function(data,context){if(data){var relativeFilename=FileUtils.getRelativeFilename(this.prefFilePath,context[this.key]);if(relativeFilename){var glob=_findMatchingGlob(data,relativeFilename);return glob?_.keys(data[glob]):[]}return _.union.apply(null,_.map(_.values(data),_.keys))}},setPrefFilePath:function(prefFilePath){this.prefFilePath=prefFilePath?FileUtils.getDirectoryPath(prefFilePath):"/"},contextChanged:function(data,oldContext,newContext){var newGlob=_findMatchingGlob(data,FileUtils.getRelativeFilename(this.prefFilePath,newContext[this.key])),oldGlob=_findMatchingGlob(data,FileUtils.getRelativeFilename(this.prefFilePath,oldContext[this.key]));if(newGlob!==oldGlob)return void 0===newGlob?_.keys(data[oldGlob]):void 0===oldGlob?_.keys(data[newGlob]):_.union(_.keys(data[oldGlob]),_.keys(data[newGlob]))}},EventDispatcher.makeEventDispatcher(Preference.prototype),PrefixedPreferencesSystem.prototype={definePreference:function(id,type,initial,options){return this.base.definePreference(this.prefix+id,type,initial,options)},getPreference:function(id){return this.base.getPreference(this.prefix+id)},get:function(id,context){return context=context||{},this.base.get(this.prefix+id,this.base._getContext(context))},getPreferenceLocation:function(id,context){return this.base.getPreferenceLocation(this.prefix+id,context)},set:function(id,value,options,doNotSave){return this.base.set(this.prefix+id,value,options,doNotSave)},_installListener:function(){if(!this._listenerInstalled){var self=this,prefix=this.prefix,onlyWithPrefix=function(id){return!!_.startsWith(id,prefix)},withoutPrefix=function(id){return id.substr(prefix.length)};this.base.on(PREFERENCE_CHANGE,function(e,data){var prefixedIds=data.ids.filter(onlyWithPrefix);prefixedIds.length>0&&self.trigger(PREFERENCE_CHANGE,{ids:prefixedIds.map(withoutPrefix)})}),this._listenerInstalled=!0}},on:function(event,preferenceID,handler){var pref;("function"==typeof preferenceID&&(handler=preferenceID,preferenceID=null),preferenceID)?this.getPreference(preferenceID).on(event,handler):(this._installListener(),this._on_internal(event,handler))},off:function(event,preferenceID,handler){var pref;("function"==typeof preferenceID&&(handler=preferenceID,preferenceID=null),preferenceID)?this.getPreference(preferenceID).off(event,handler):this._off_internal(event,handler)},save:function(){return this.base.save()}},_addEventDispatcherImpl(PrefixedPreferencesSystem.prototype),_.extend(PreferencesSystem.prototype,{definePreference:function(id,type,initial,options){if(options=options||{},this._knownPrefs.hasOwnProperty(id))throw new Error("Preference "+id+" was redefined");var pref=this._knownPrefs[id]=new Preference({type:type,initial:initial,name:options.name,description:options.description,validator:options.validator,excludeFromHints:options.excludeFromHints,keys:options.keys,values:options.values,valueType:options.valueType});return this.set(id,initial,{location:{scope:"default"}}),pref},getPreference:function(id){return this._knownPrefs[id]},getAllPreferences:function(){return _.cloneDeep(this._knownPrefs)},_pushToScopeOrder:function(id,before){var defaultScopeOrder=this._defaults.scopeOrder,index=_.findIndex(defaultScopeOrder,function(id){return id===before});if(!(index>-1))throw new Error("Internal error: scope "+before+" should be in the scope order");defaultScopeOrder.splice(index,0,id)},_tryAddToScopeOrder:function(shadowEntry){for(var shadowScopeOrder=this._defaults._shadowScopeOrder,index,i=_.findIndex(shadowScopeOrder,function(entry){return entry===shadowEntry})+1;i<shadowScopeOrder.length&&"pending"!==shadowScopeOrder[i].promise.state()&&"resolved"!==shadowScopeOrder[i].promise.state();)i++;switch(shadowScopeOrder[i].promise.state()){case"pending":shadowScopeOrder[i].promise.always(function(){this._tryAddToScopeOrder(shadowEntry)}.bind(this));break;case"resolved":this._pushToScopeOrder(shadowEntry.id,shadowScopeOrder[i].id),this.trigger(SCOPEORDER_CHANGE,{id:shadowEntry.id,action:"added"}),this._triggerChange({ids:shadowEntry.scope.getKeys()});break;default:throw new Error('Internal error: no scope found to add before. "default" is missing?..')}},_addToScopeOrder:function(id,scope,promise,addBefore){var shadowScopeOrder=this._defaults._shadowScopeOrder,shadowEntry,index,isPending=!1,self=this;if(scope.on(PREFERENCE_CHANGE+".prefsys",function(e,data){self._triggerChange(data)}.bind(this)),(index=_.findIndex(shadowScopeOrder,function(entry){return entry.id===id}))>-1)shadowEntry=shadowScopeOrder[index];else if(shadowEntry={id:id,promise:promise,scope:scope},addBefore)if((index=_.findIndex(shadowScopeOrder,function(entry){return entry.id===addBefore}))>-1)shadowScopeOrder.splice(index,0,shadowEntry);else{var queue=this._pendingScopes[addBefore];queue||(queue=[],this._pendingScopes[addBefore]=queue),queue.unshift(shadowEntry),isPending=!0}else shadowScopeOrder.unshift(shadowEntry);if(!isPending&&(promise.then(function(){this._scopes[id]=scope,this._tryAddToScopeOrder(shadowEntry)}.bind(this)).fail(function(err){_.pull(shadowScopeOrder,shadowEntry)}.bind(this)),this._pendingScopes[id])){var pending=this._pendingScopes[id];delete this._pendingScopes[id],pending.forEach(function(entry){this._addToScopeOrder(entry.id,entry.scope,entry.promise,id)}.bind(this))}},addToScopeOrder:function(id,addBefore){var shadowScopeOrder=this._defaults._shadowScopeOrder,index=_.findIndex(shadowScopeOrder,function(entry){return entry.id===id}),entry;index>-1&&(entry=shadowScopeOrder[index],this._addToScopeOrder(entry.id,entry.scope,entry.promise,addBefore))},removeFromScopeOrder:function(id){var scope=this._scopes[id];scope&&(_.pull(this._defaults.scopeOrder,id),scope.off(".prefsys"),this.trigger(SCOPEORDER_CHANGE,{id:id,action:"removed"}),this._triggerChange({ids:scope.getKeys()}))},_getContext:function(context){return context?(this.contextBuilder&&(context=this.contextBuilder(context)),context.scopeOrder||(context.scopeOrder=this._defaults.scopeOrder),context):{scopeOrder:this._defaults.scopeOrder}},addScope:function(id,scope,options){var promise;if(options=options||{},this._scopes[id])throw new Error("Attempt to redefine preferences scope: "+id);return scope.get||(scope=new Scope(scope)),promise=scope.load(),this._addToScopeOrder(id,scope,promise,options.before),promise.fail(function(err){err instanceof ParsingError&&console.error(err)}),promise},removeScope:function(id){var scope,shadowIndex;this._scopes[id]&&(this.removeFromScopeOrder(id),shadowIndex=_.findIndex(this._defaults._shadowScopeOrder,function(entry){return entry.id===id}),this._defaults._shadowScopeOrder.splice(shadowIndex,1),delete this._scopes[id])},_getScopeOrder:function(context){return context.scopeOrder||this._defaults.scopeOrder},get:function(id,context){var scopeCounter;context=this._getContext(context);var scopeOrder=this._getScopeOrder(context);for(scopeCounter=0;scopeCounter<scopeOrder.length;scopeCounter++){var scope=this._scopes[scopeOrder[scopeCounter]];if(scope){var result=scope.get(id,context);if(void 0!==result){var pref=this.getPreference(id),validator=pref&&pref.validator;if(!validator||validator(result))return pref&&"object"===pref.type&&(result=_.extend({},pref.initial,result)),_.cloneDeep(result)}}}},getPreferenceLocation:function(id,context){var scopeCounter,scopeName;context=this._getContext(context);var scopeOrder=this._getScopeOrder(context);for(scopeCounter=0;scopeCounter<scopeOrder.length;scopeCounter++){scopeName=scopeOrder[scopeCounter];var scope=this._scopes[scopeName];if(scope){var result=scope.getPreferenceLocation(id,context);if(void 0!==result)return result.scope=scopeName,result}}},set:function(id,value,options,doNotSave){options=options||{};var context=this._getContext(options.context),forceDefault=!(!options.location||"default"!==options.location.scope),location=options.location||this.getPreferenceLocation(id,context);if(!location||"default"===location.scope&&!forceDefault){var scopeOrder=this._getScopeOrder(context);if(!(scopeOrder.length>1))return{valid:!0,stored:!1};location={scope:scopeOrder[scopeOrder.length-2]}}var scope=this._scopes[location.scope];if(!scope)return{valid:!0,stored:!1};var pref=this.getPreference(id),validator=pref&&pref.validator;if(validator&&!validator(value))return{valid:!1,stored:!1};var wasSet=scope.set(id,value,context,location);return wasSet&&(doNotSave||this.save(),this._triggerChange({ids:[id]})),{valid:!0,stored:wasSet}},save:function(){let that=this;if(that._saveInProgress)return that._nextSaveDeferred||(that._nextSaveDeferred=new $.Deferred),that._nextSaveDeferred.promise();var deferred=that._nextSaveDeferred||new $.Deferred;return this._saveInProgress=!0,this._nextSaveDeferred=null,Async.doInParallel(_.values(that._scopes),function(scope){return scope?scope.save():(new $.Deferred).resolve().promise()}).then(function(){that._saveInProgress=!1,that._nextSaveDeferred&&that.save(),deferred.resolve()}).fail(function(err){that._saveInProgress=!1,deferred.reject(err)}),deferred.promise()},signalContextChanged:function(oldContext,newContext){var changes=[];_.each(this._scopes,function(scope){var changedInScope=scope.contextChanged(oldContext,newContext);changedInScope&&changes.push(changedInScope)}),(changes=_.union.apply(null,changes)).length>0&&this._triggerChange({ids:changes})},on:function(event,preferenceID,handler){var pref;("function"==typeof preferenceID&&(handler=preferenceID,preferenceID=null),preferenceID)?this.getPreference(preferenceID).on(event,handler):this._on_internal(event,handler)},off:function(event,preferenceID,handler){var pref;("function"==typeof preferenceID&&(handler=preferenceID,preferenceID=null),preferenceID)?this.getPreference(preferenceID).off(event,handler):this._off_internal(event,handler)},_triggerChange:function(data){this._changeEventQueue?this._changeEventQueue=_.union(this._changeEventQueue,data.ids):this.trigger(PREFERENCE_CHANGE,data)},pauseChangeEvents:function(){this._changeEventQueue||(this._changeEventQueue=[])},resumeChangeEvents:function(){this._changeEventQueue&&(this.trigger(PREFERENCE_CHANGE,{ids:this._changeEventQueue}),this._changeEventQueue=null)},fileChanged:function(filePath){_.forEach(this._scopes,function(scope){scope.fileChanged(filePath)})},getPrefixedSystem:function(prefix){return new PrefixedPreferencesSystem(this,prefix+".")}}),_addEventDispatcherImpl(PreferencesSystem.prototype),exports.PreferencesSystem=PreferencesSystem,exports.Scope=Scope,exports.MemoryStorage=MemoryStorage,exports.PathLayer=PathLayer,exports.ProjectLayer=ProjectLayer,exports.LanguageLayer=LanguageLayer,exports.FileStorage=FileStorage});
//# sourceMappingURL=PreferencesBase.js.map
