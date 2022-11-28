define(function(require,exports,module){var AppInit=brackets.getModule("utils/AppInit"),CodeHintManager=brackets.getModule("editor/CodeHintManager"),AtRulesText=require("text!AtRulesDef.json"),AtRules=JSON.parse(AtRulesText);function AtRuleHints(){}AtRuleHints.prototype.hasHints=function(editor,implicitChar){var pos=editor.getCursorPos(),token=editor._codeMirror.getTokenAt(pos),cmState;return this.editor=editor,cmState=token.state.base&&token.state.base.localState?token.state.base.localState:token.state.localState||token.state,"def"===token.type&&"at"===cmState.context.type||"variable-2"===token.type&&("top"===cmState.context.type||"block"===cmState.context.type)?(this.filter=token.string,!0):(this.filter=null,!1)},AtRuleHints.prototype.getHints=function(implicitChar){var pos=this.editor.getCursorPos(),token=this.editor._codeMirror.getTokenAt(pos),result;return this.filter=token.string,this.token=token,this.filter?{hints:Object.keys(AtRules).filter(function(key){if(0===key.indexOf(token.string))return key}).sort(),match:this.filter,selectInitial:!0,defaultDescriptionWidth:!0,handleWideResults:!1}:null},AtRuleHints.prototype.insertHint=function(completion){var cursor=this.editor.getCursorPos();return this.editor.document.replaceRange(completion,{line:cursor.line,ch:this.token.start},{line:cursor.line,ch:this.token.end}),!1},AppInit.appReady(function(){var restrictedBlockHints=new AtRuleHints;CodeHintManager.registerHintProvider(restrictedBlockHints,["css","less","scss"],0),exports.restrictedBlockHints=restrictedBlockHints})});
//# sourceMappingURL=main.js.map
