var polymorph = require('../polymorph.js').polymorph;
var assert = require('assert');

//TODO: include some corner cases (ambigious, overlapping functions, and no-candidate situations).

// This example considers several functions.
// The one below is a dummy JSON parser capable of using a function to fetch the JSON source or using a provided string as input.

// For simplicity's sake, it is assumed that the URL does not need to be passed.
function fetchContent(callback){
	setImmediate(callback.bind(undefined, '{"version": 1.01}'));
}

function _parseJSONFromGetter(getterFunction, callback){
	getterFunction(function(obtainedDocument){
		callback(JSON.parse(obtainedDocument));
	});
}
_parseJSONFromGetter.polymorph = {types: ['function', 'function']};

function _parseJSONFromContainer(container, callback){
	callback(JSON.parse(container.getJSON()));
}
_parseJSONFromContainer.polymorph = {types: ['object', 'function']};


function _parseJSONFromString(inputString, callback){
	callback(JSON.parse(inputString));
}
_parseJSONFromString.polymorph = {types: ['string', 'function']};

function _parseSavedSnippet(snippetNumber, callback){
	callback({code: 'someCode'});
}
_parseSavedSnippet.polymorph = {types: ['number', 'function']};

function _parseNumber(number, callback){
	callback(number);
}
_parseNumber.polymorph = {types: ['number', 'function']};

var parseJSON = polymorph([_parseJSONFromGetter, _parseJSONFromString, _parseJSONFromContainer, _parseSavedSnippet, _parseNumber]);
var parseJSONPermissive = polymorph([_parseJSONFromGetter, _parseJSONFromString, _parseJSONFromContainer, _parseSavedSnippet, _parseNumber], {unambigiousOnly: false});


// === End of definitions - tests follow ===


describe('polymorph', function(){
	it('should run the synchronous, string-based candidate of the polymorphed function', function(done){
		// Note: this test is still asynchronous because I chose to make both implementations' semantics equal (they both use a callback, even if no real async happens).
		parseJSON('{"a": 1, "b": 2}', function(data){
			assert.strictEqual(data.a, 1);
			assert.strictEqual(data.b, 2);
			done();
		});
	});
	it('should use the synchronous, container-based candidate of the polymorphed function', function(done){
		parseJSON({
			getJSON: function(){
				return '{"boxed": true}';
			}
		},
		function(data){
			assert.strictEqual(data.boxed, true);
			done();
		});
	});
	it('should run the asynchronous, fetcher-using candidate of the polymorphed function', function(done){
		parseJSON(fetchContent, function(data){
			assert.strictEqual(data.version, 1.01);
			done();
		});
	});
	it('should not be able to choose either numeric candidate and fail', function(){
		assert.throws(function(){
			parseJSON(1, function(){});
		});
	});
	it('should not be able to choose any candidate', function(){
		assert.throws(function(){
			parseJSON(undefined, function(){});
		});
	});
	it('should choose the first matching candidate', function(done){
		parseJSONPermissive(1, function(data){
			assert.strictEqual(data.code, 'someCode');
			done();
		});
	});
});