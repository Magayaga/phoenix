define(function(require,exports,module){function isInteger(value){return"number"==typeof value&&!isNaN(parseInt(value,10))&&(Math.floor(value)===value&&!!isFinite(value))}function isIntegerInRange(value,lowerLimit,upperLimit){return!!isInteger(value)&&((!("number"==typeof lowerLimit)||value>=lowerLimit)&&(!("number"==typeof upperLimit)||value<=upperLimit));var hasLowerLimt,hasUpperLimt}exports.isInteger=isInteger,exports.isIntegerInRange=isIntegerInRange});
//# sourceMappingURL=ValidationUtils.js.map
