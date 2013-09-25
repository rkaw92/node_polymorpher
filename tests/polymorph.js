var polymorph = require('../polymorph.js').polymorph;

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

var parseJSON = polymorph([_parseJSONFromGetter, _parseJSONFromString, _parseJSONFromContainer]);

describe('polymorph', function(){
	it('should run the synchronous, string-based candidate of the polymorphed function', function(done){
		// Note: this test is still asynchronous because I chose to make both implementations' semantics equal (they both use a callback, even if no real async happens).
		parseJSON('{"a": 1, "b": 2}', function(data){
			done((data.a === 1 && data.b === 2) ? undefined : new Error('Candidate choice probably failed!'));
		});
	});
	it('should use the synchronous, container-based candidate of the polymorphed function', function(done){
		parseJSON({
			getJSON: function(){
				return '{"boxed": true}';
			}
		},
		function(data){
			done((data.boxed === true) ? undefined : new Error('Polymorphic failure!'));
		});
	});
	it('should run the asynchronous, fetcher-using candidate of the polymorphed function', function(done){
		parseJSON(fetchContent, function(data){
			done((data.version === 1.01) ? undefined : new Error('Candidate choice probably failed!'));
		});
	});
});