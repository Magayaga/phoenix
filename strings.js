define(function(require,exports,module){var _=require("thirdparty/lodash"),strings=require("i18n!nls/strings"),urls=require("i18n!nls/urls"),stringsApp=require("i18n!nls/strings-app"),StringUtils=require("utils/StringUtils");require("utils/Global");var additionalGlobals=$.extend({},urls),parsedVersion=/([0-9]+)\.([0-9]+)\.([0-9]+)/.exec(brackets.metadata.version);additionalGlobals.APP_NAME=brackets.metadata.name||strings.APP_NAME,additionalGlobals.APP_TITLE=brackets.config.app_title||strings.APP_NAME,additionalGlobals.TWITTER_NAME=brackets.config.twitter_name,additionalGlobals.VERSION=brackets.metadata.version,additionalGlobals.VERSION_MAJOR=parsedVersion[1],additionalGlobals.VERSION_MINOR=parsedVersion[2],additionalGlobals.VERSION_PATCH=parsedVersion[3],"production"===brackets.config.buildtype?additionalGlobals.BUILD_TYPE=strings.RELEASE_BUILD:"staging"===brackets.config.buildtype?additionalGlobals.BUILD_TYPE=strings.PRERELEASE_BUILD:additionalGlobals.BUILD_TYPE=strings.DEVELOPMENT_BUILD,_.forEach(strings,function(value,key){_.forEach(additionalGlobals,function(item,name){strings[key]=strings[key].replace(new RegExp("{"+name+"}","g"),additionalGlobals[name])})}),_.forEach(stringsApp,function(value,key){_.forEach(additionalGlobals,function(item,name){stringsApp[key]=stringsApp[key].replace(new RegExp("{"+name+"}","g"),additionalGlobals[name])}),strings[key]=stringsApp[key]}),module.exports=strings});
//# sourceMappingURL=strings.js.map
