!function(mod){"object"==typeof exports&&"object"==typeof module?mod(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],mod):mod(CodeMirror)}(function(CodeMirror){"use strict";function wordSet(words){for(var set={},i=0;i<words.length;i++)set[words[i]]=!0;return set}var keywords=wordSet(["_","var","let","actor","class","enum","extension","import","protocol","struct","func","typealias","associatedtype","open","public","internal","fileprivate","private","deinit","init","new","override","self","subscript","super","convenience","dynamic","final","indirect","lazy","required","static","unowned","unowned(safe)","unowned(unsafe)","weak","as","is","break","case","continue","default","else","fallthrough","for","guard","if","in","repeat","switch","where","while","defer","return","inout","mutating","nonmutating","isolated","nonisolated","catch","do","rethrows","throw","throws","async","await","try","didSet","get","set","willSet","assignment","associativity","infix","left","none","operator","postfix","precedence","precedencegroup","prefix","right","Any","AnyObject","Type","dynamicType","Self","Protocol","__COLUMN__","__FILE__","__FUNCTION__","__LINE__"]),definingKeywords=wordSet(["var","let","actor","class","enum","extension","import","protocol","struct","func","typealias","associatedtype","for"]),atoms=wordSet(["true","false","nil","self","super","_"]),types=wordSet(["Array","Bool","Character","Dictionary","Double","Float","Int","Int8","Int16","Int32","Int64","Never","Optional","Set","String","UInt8","UInt16","UInt32","UInt64","Void"]),operators="+-/*%=|&<>~^?!",punc=":;,.(){}[]",binary=/^\-?0b[01][01_]*/,octal=/^\-?0o[0-7][0-7_]*/,hexadecimal=/^\-?0x[\dA-Fa-f][\dA-Fa-f_]*(?:(?:\.[\dA-Fa-f][\dA-Fa-f_]*)?[Pp]\-?\d[\d_]*)?/,decimal=/^\-?\d[\d_]*(?:\.\d[\d_]*)?(?:[Ee]\-?\d[\d_]*)?/,identifier=/^\$\d+|(`?)[_A-Za-z][_A-Za-z$0-9]*\1/,property=/^\.(?:\$\d+|(`?)[_A-Za-z][_A-Za-z$0-9]*\1)/,instruction=/^\#[A-Za-z]+/,attribute=/^@(?:\$\d+|(`?)[_A-Za-z][_A-Za-z$0-9]*\1)/;function tokenBase(stream,state,prev){if(stream.sol()&&(state.indented=stream.indentation()),stream.eatSpace())return null;var ch=stream.peek(),stringMatch;if("/"==ch){if(stream.match("//"))return stream.skipToEnd(),"comment";if(stream.match("/*"))return state.tokenize.push(tokenComment),tokenComment(stream,state)}if(stream.match(instruction))return"builtin";if(stream.match(attribute))return"attribute";if(stream.match(binary))return"number";if(stream.match(octal))return"number";if(stream.match(hexadecimal))return"number";if(stream.match(decimal))return"number";if(stream.match(property))return"property";if(operators.indexOf(ch)>-1)return stream.next(),"operator";if(punc.indexOf(ch)>-1)return stream.next(),stream.match(".."),"punctuation";if(stringMatch=stream.match(/("""|"|')/)){var tokenize=tokenString.bind(null,stringMatch[0]);return state.tokenize.push(tokenize),tokenize(stream,state)}if(stream.match(identifier)){var ident=stream.current();return types.hasOwnProperty(ident)?"variable-2":atoms.hasOwnProperty(ident)?"atom":keywords.hasOwnProperty(ident)?(definingKeywords.hasOwnProperty(ident)&&(state.prev="define"),"keyword"):"define"==prev?"def":"variable"}return stream.next(),null}function tokenUntilClosingParen(){var depth=0;return function(stream,state,prev){var inner=tokenBase(stream,state,prev);if("punctuation"==inner)if("("==stream.current())++depth;else if(")"==stream.current()){if(0==depth)return stream.backUp(1),state.tokenize.pop(),state.tokenize[state.tokenize.length-1](stream,state);--depth}return inner}}function tokenString(openQuote,stream,state){for(var singleLine=1==openQuote.length,ch,escaped=!1;ch=stream.peek();)if(escaped){if(stream.next(),"("==ch)return state.tokenize.push(tokenUntilClosingParen()),"string";escaped=!1}else{if(stream.match(openQuote))return state.tokenize.pop(),"string";stream.next(),escaped="\\"==ch}return singleLine&&state.tokenize.pop(),"string"}function tokenComment(stream,state){for(var ch;stream.match(/^[^/*]+/,!0),ch=stream.next();)"/"===ch&&stream.eat("*")?state.tokenize.push(tokenComment):"*"===ch&&stream.eat("/")&&state.tokenize.pop();return"comment"}function Context(prev,align,indented){this.prev=prev,this.align=align,this.indented=indented}function pushContext(state,stream){var align=stream.match(/^\s*($|\/[\/\*])/,!1)?null:stream.column()+1;state.context=new Context(state.context,align,state.indented)}function popContext(state){state.context&&(state.indented=state.context.indented,state.context=state.context.prev)}CodeMirror.defineMode("swift",function(config){return{startState:function(){return{prev:null,context:null,indented:0,tokenize:[]}},token:function(stream,state){var prev=state.prev;state.prev=null;var tokenize,style=(state.tokenize[state.tokenize.length-1]||tokenBase)(stream,state,prev);if(style&&"comment"!=style?state.prev||(state.prev=style):state.prev=prev,"punctuation"==style){var bracket=/[\(\[\{]|([\]\)\}])/.exec(stream.current());bracket&&(bracket[1]?popContext:pushContext)(state,stream)}return style},indent:function(state,textAfter){var cx=state.context;if(!cx)return 0;var closing=/^[\]\}\)]/.test(textAfter);return null!=cx.align?cx.align-(closing?1:0):cx.indented+(closing?0:config.indentUnit)},electricInput:/^\s*[\)\}\]]$/,lineComment:"//",blockCommentStart:"/*",blockCommentEnd:"*/",fold:"brace",closeBrackets:"()[]{}''\"\"``"}}),CodeMirror.defineMIME("text/x-swift","swift")});
//# sourceMappingURL=swift.js.map
