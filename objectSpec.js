var util = require('util');

function argumentMatchesObjectSpec(arg, objectSpec){
	if(typeof(objectSpec) !== 'object' || objectSpec === null){
		// We've been fooled - there is no object :[
		throw new Error('Object spec for the argument needs to be an object (obviously) and non-null');
	}
	// Case 1: Regular expression.
	if(util.isRegExp(objectSpec)){
		return (typeof(arg) === 'string' && arg.match(objectSpec));
	}
	// Case 2: Interface
	else if( /* TODO */ ){
		
	}
	// Default: Plain old object - we need to recurse down all its properties to validate the arg against.
	else{
		
	}
}