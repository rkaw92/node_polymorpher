# Polymorpher

## What it is

Polymorpher is a library for creating meta-functions which choose the underlying candidate at run-time based on argument types (and more complex constraints). It is useful for, among others, generating argument-shifted variants of functions quickly.
A (somewhat impractical) example of what it can do when it comes to type polymorphism:

	var polymorph = require('polymorpher').polymorph;
	
	// First candidate function: accepts a string.
	function printDateFromString(str){
		console.log(str);
	}
	printDateFromString.polymorph = { types: ['string'] };
	
	// Second candidate function: this one operates on objects, but essentially performs the same operation.
	function printDateFromDateObject(dateObject){
		console.log(dateObject.toISOString());
	}
	printDateFromDateObject.polymorph = { types: ['object'] };
	
	// Now, we hide them under a common facade - no matter if the user passes a string or an object, it will Just Work(TM).
	var printDate = polymorph([printDateFromString, printDateFromDateObject]);
	
	// ... and use the meta-function, at last.
	var date1 = '2013-10-14T12:09:26.491Z';
	var date2 = new Date();
	printDate(date1);
	printDate(date2);
	
For some more examples, see the tests/ directory.

## How it works

Polymorpher's main function, polymorph(), takes an array of functions and some additional options, and produces a function which enables pass-through to a type-matching candidate. This meta-function will look at the arguments and at what the underlying functions expect, and direct the call (along with any arguments) to the appropriate function.

Type checking is done at run-time, because there is no real type-safety in JS and we are unable to verify if an object is of a particular "class", except for using duck typing and looking for particular members. Which is exactly what Polymorpher does.

## How to polymorph functions

### polymorph(candidateFunctions [, options])
* candidateFunctions: an Array of functions that should be hidden under the common facade of the polymorphic meta-function. Each such function should have a "polymorph" property with a "types" member in it (more on this below). If it does not, only function arity will matter (depending on the options).
* options: an Object of key => value pairs. Optional. Allowed options:
	* unambigiousOnly: only call a function if it is the only candidate. In case multiple candidate functions match the arguments provided, throw an Error. Defaults to true.
	* allowLowerArity: normally, only functions with an exactly matching arity (Function's "length" property) are considered to serve any given call. This options lifts that requirement for calls which provide _more_ arguments than the candidate function expects. Defaults to false.
	* allowHigherArity: similarly to the above, allows for arity-mismatching candidates to be called. However, functions with a _higher_ arity than the argument count can be called with this setting on. This is potentially undesired, since some arguments will be left with a value of "undefined", despite the caller not having passed it explicitly. Use with care. Defaults to false.

## How to specify desired types

Argument types/constraints are specified in a special label, affixed to a Function object: "polymorph". This label in itself is an Object, with only one property supported now, "types".
The types array stores argument type specifications of positional arguments for the given candidate. Each element is a specifier, as described below.

There are a few ways to tell Polymorpher what an argument should look like to match a function's requirements:

* String types: the simplest specification is just a string type (for an example, see the "What it is" section up above). An argument matches iff typeof(arg) returns the type name specified. If the type name is surrounded in square [brackets], it means the argument is optional and can be null or undefined (so, for example, if you want an optional object, use "[object]" as the type spec). Allowed type names:
	* string
	* object
	* boolean
	* number
	* undefined
	
	Also, notice how the optional argument feature fits in with the allowHigherArity. If not enough arguments are passed and a mandatory argument is left out, the type will not match and you will get an argument type mismatch error instead of a function call.
* Functional type specification: a function can be used to determine whether the argument matches the candidate function's requirements. It should be a predicate, like so:
	
		fn.polymorph = {types: [function _priceIsAcceptable(argValue){
			return (typeof(argValue) === 'number' && argValue > 0.0 && argValue < 100000.0);
		}]};
* Prospected: interface support (requires integration with an interface library) and complex constraint support by using predicate factories.

## License (MIT)

Copyright (C) 2013 Robert Kawecki


Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
