var checkArguments = require('../polymorph.js').checkArguments;
var assert = require('assert');

describe('checkArguments', function(){
	function sq(n){ return n * n; };
	function pow(a, b){
		if(typeof(b) !== 'number'){
			b = 2;
		}
		return Math.pow(a, b);
	}

	it('should accept the string-typed arguments as valid', function(){
		assert(checkArguments(sq, [2], ['number']));
		assert(checkArguments(pow, [2], ['number', '[number]']));
	});
	it('should reject the arguments as of incorrect type', function(){
		assert(!checkArguments(sq, [2], ['string']));
		assert(!checkArguments(sq, ['zonk'], ['number']));
	});
	it('should accept the arguments after validating them with the provided predicates', function(){
		assert(checkArguments(sq, [2], [
		function(val){
			return (typeof(val) === 'number');
		}]));
		assert(checkArguments(pow, [2], [
		function(val){
			return (typeof(val) === 'number');
		},
		function(val){
			return (['number', 'undefined'].indexOf(typeof(val)) >= 0);
		}]));
	});
	it('should reject the arguments, as filtered by the predicate function', function(){
		assert(!checkArguments(sq, [2], [
		function(val){
			return Array.isArray(val);
		}]));
		assert(!checkArguments(sq, [2], [
		function(val){
			return false;
		}]));
		assert(!checkArguments(pow, [2, 3], [
		function(val){
			return Number(val) !== NaN;
		}, function(){
			// This is not a necessary check for Math.pow - here just to differentiate tests (it does limit the function's domain, though).
			return Number(val) > 0;
		}]));
	});
});