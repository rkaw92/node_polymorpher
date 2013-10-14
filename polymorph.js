function checkArguments(callHandler, args, types){
	"use strict";
	if(callHandler.length > types.length){
		throw new Error('Can not check argument types - the function has more formal arguments than defined type constraints. Aborting.');
	}
	var matching = true;
	if(!Array.isArray(types)){
		throw new Error('Type specification needs to be an array of predicates!');
	}
	types.forEach(function(argSpec, specIndex){
		// If encountering a specification for a non-mandatory argument which is not present, skip further processing of this spec.
		if(specIndex >= callHandler.length && specIndex >= args.length){
			return;
		}
		switch(typeof(argSpec)){
			// Note: the below uses bitwise operators, but it works as expected for boolean 1 and 0 values.
			case 'string':
				var optionalMatch = argSpec.match(/^\[([a-zA-Z]+)\]$/);
				if(optionalMatch){
					matching &= ((typeof(args[specIndex]) === optionalMatch[1]) || typeof(args[specIndex]) === 'undefined' || args[specIndex] === null);
				}
				else{
					matching &= (typeof(args[specIndex]) === argSpec);
				}
				break;
			case 'function':
				// Wrapped in a try..catch block to accomodate for assertion frameworks such as should.js.
				try{
					matching &= (argSpec(args[specIndex]));
				}
				catch(e){
					matching = false;
				}
				break;
			//TODO: Add "object" type support with recursive type validation (integrate with Interfaces, anyone?).
			//TODO: In the "object" case, consider accepting RegExp objects for validating strings, too.
			default:
				throw new Error('polymorph: Invalid argument specification encountered while checking argument types for routing');
		} // End of argSpec type switch.
	});
	// We've checked all arguments. If there has been no mismatch so far, accept the function as appropriate.
	return matching;
}

function polymorph(backingFunctions, options){
	"use strict";
	if(!options){
		options = {};
	}
	var unambigiousOnly = (typeof(options.unambigiousOnly) !== 'undefined') ? Boolean(options.unambigiousOnly) : true;
	return (function routePolymorphicCall(){
		var args = Array.prototype.slice.call(arguments);
		// We now have the call arguments as an array - figure out which backing function to use.
		var appropriateFunctions = [];
		backingFunctions.forEach(function(callHandler){
			if(typeof(callHandler) !== 'function'){
				throw new Error('polymorph: All elements in the array argument must be functions!');
			}
			if(callHandler.length === args.length || (options.allowLowerArity && callHandler.length < args.length) || (options.allowHigherArity && callHandler.length > args.length)){
				// The function's arity matches our constraints - check the argument types:
				if(typeof(callHandler.polymorph) === 'object' && callHandler.polymorph !== null && Array.isArray(callHandler.polymorph.types)){
					// We have argument type info - use it.
					if(checkArguments(callHandler, args, callHandler.polymorph.types)){
						appropriateFunctions.push(callHandler);
					}
				}
				else{
					// No type checking - just assume the programmer wants any arguments and will handle them on their own.
					appropriateFunctions.push(callHandler);
				}
			}
		});
		if(appropriateFunctions.length >= 1){
			if(appropriateFunctions.length > 1 && unambigiousOnly){
				throw new Error('polymorph: Multiple candidate functions match, but unambigiousOnly is enabled. Aborting.');
			}
			// Exactly one function found. Great!
			return appropriateFunctions[0].apply(this, args);
		}
		else{
			// Something went wrong.
			// No functions matching the argument types.
			throw new Error('polymorph: No candidate function matches the passed arguments. Candidates: ' + backingFunctions.map(function(candidate){
				if(candidate.polymorph && candidate.polymorph.types){
					return 'function ' + candidate.name + '(' + candidate.polymorph.types.join(', ') + ')';
				}
				else{
					return 'function ' + candidate.name + '[' + candidate.length + ']';
				}
			}).join('\n'));
		}
	});
}

module.exports.checkArguments = checkArguments;
module.exports.polymorph = polymorph;