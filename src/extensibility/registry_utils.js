define(function(require,exports,module){function htmlEscape(str){return String(str).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}exports.lastVersionDate=function(){var result;return this.versions&&this.versions.length&&(result=this.versions[this.versions.length-1].published)&&(result=(result=new Date(result)).toLocaleDateString(brackets.getLocale(),{year:"numeric",month:"2-digit",day:"2-digit"})),result||""},exports.formatUserId=function(){var friendlyName,nameComponents;this.owner&&(friendlyName=this.owner.split(":")[1]);return friendlyName},exports.ownerLink=function(){var url;if(this.owner){var nameComponents=this.owner.split(":");"github"===nameComponents[0]&&(url="https://github.com/"+nameComponents[1])}return url},exports.authorInfo=function(){var result="",ownerLink=exports.ownerLink.call(this),userId=exports.formatUserId.call(this);return this.metadata&&this.metadata.author?result=htmlEscape(this.metadata.author.name||this.metadata.author):userId&&(result=htmlEscape(userId)),ownerLink&&(result="<a href='"+htmlEscape(ownerLink)+"' title='"+htmlEscape(ownerLink)+"'>"+result+"</a>"),result},exports.sortRegistry=function(registry,subkey,sortBy){function getPublishTime(entry){return entry.versions?new Date(entry.versions[entry.versions.length-1].published).getTime():Number.NEGATIVE_INFINITY}var sortedEntries=[];return Object.keys(registry).forEach(function(key){sortedEntries.push(registry[key])}),sortedEntries.sort(function(entry1,entry2){return"publishedDate"!==sortBy?entry1.registryInfo&&entry2.registryInfo?entry2.registryInfo.totalDownloads-entry1.registryInfo.totalDownloads:Number.NEGATIVE_INFINITY:getPublishTime(subkey&&entry2[subkey]||entry2)-getPublishTime(subkey&&entry1[subkey]||entry1)}),sortedEntries}});
//# sourceMappingURL=registry_utils.js.map
