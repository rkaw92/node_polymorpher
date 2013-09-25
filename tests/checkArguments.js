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

	it('should accept the arguments as valid', function(){
		assert(checkArguments(sq, [2], ['number']));
		assert(checkArguments(pow, [2], ['number', '[number]']));
	});
	it('should reject the arguments as of incorrect type', function(){
		assert(!checkArguments(sq, [2], ['string']));
		assert(!checkArguments(sq, ['zonk'], ['number']));
	});
});