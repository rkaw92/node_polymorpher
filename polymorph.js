function polymorph(backingFunctions, options){
	if(!options){
		options = {};
	}
	return function routePolymorphicCall(){
		var args = Array.prototype.slice.call(arguments);
		// We now have the call arguments as an array - figure out which backing function to use.
		var appropriateFunctions = [];
		backingFunctions.forEach(function(callHandler){
			if(typeof(callHandler) !== 'function'){
				throw new Error('polymorph: All elements in the array argument must be functions!');
			}
			if(callHandler.length === args.length || (options.allowLowerArity && callHandler.length < args.length) || (options.allowHigherArity && callHandler.length > args.length)){
				// The function's arity matches our constraints - check the argument types:
				if(typeof(callHandler.polymorph) === 'object' && callHandler.polymorph !== null && Array.isArray(callHandler.polymorph.args)){
					// We have argument type info - use it.
					var matching = true;
					//TODO: move the below into a utility function for checking argument types.
					callHandler.polymorph.args.forEach(function(argSpec, specIndex){
						// If encountering a specification for a non-mandatory argument which is not present, do not generate a mismatch.
						//TODO: verify the condition's logic.
						if(specIndex > callHandler.length && specIndex > args.length){
							return;
						}
						switch(typeof(argSpec)){
							// Note: the below uses bitwise operators, but it works as expected for boolean 1 and 0 values.
							//  Also, any mismatch is void if the argument is beyond the candidate function's formal arity (extra arguments are always OK).
							case 'string':
								matching &= (typeof(args[specIndex]) === argSpec);
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
							default:
								throw new Error('polymorph: Invalid argument specification encountered while checking argument types for routing');
						} // End of argSpec type switch.
					});
					// We've checked all arguments. If there has been no mismatch so far, accept the function as appropriate.
					if(matching){
						appropriateFunctions.push(callHandler);
					}
				}
				else{
					// No type checking - just assume the programmer wants any arguments and will handle them on their own.
					appropriateFunctions.push(callHandler);
				}
			}
		});
	}
}