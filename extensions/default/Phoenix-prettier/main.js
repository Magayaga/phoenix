define(["require","exports","module","thirdParty/standalone","thirdParty/parser-graphql","thirdParty/parser-html"],function(require,exports,module,prettier,graphQLPlugin,htmlPlugin){const ExtensionUtils=brackets.getModule("utils/ExtensionUtils"),FeatureGate=brackets.getModule("utils/FeatureGate"),AppInit=brackets.getModule("utils/AppInit"),FEATURE_PRETTIER="Phoenix-Prettier";FeatureGate.registerFeatureGate(FEATURE_PRETTIER,!1),ExtensionUtils.loadStyleSheet(module,"prettier.css");const plugins=[graphQLPlugin,htmlPlugin],_graphQL=function(code){return prettier.format(code,{parser:"graphql",plugins:plugins})},_html=function(code){return prettier.format(code,{parser:"html",plugins:plugins})};function _createExtensionStatusBarIcon(){}AppInit.appReady(function(){console.log(_graphQL("type Query { hello: String }")),console.log(_html('<!DOCTYPE html>\n<HTML CLASS="no-js mY-ClAsS"><HEAD><META CHARSET="utf-8"><TITLE>My tITlE</TITLE><META NAME="description" content="My CoNtEnT"></HEAD></HTML>')),FeatureGate.isFeatureEnabled(FEATURE_PRETTIER)})});
//# sourceMappingURL=main.js.map
