function runWithDebugger(callback, args) {
	debugger;	
	if (arguments.length === 1) {
		return callback();
	} else if (Array.isArray(args)) {
		return callback.apply(this, args);
	}
	throw new Error('Invalid argument: \'' + args + '\'. Must be an array.'); 
}

function logName(firstName, lastName) {
	console.log('Hello ' + firstName + ' ' + lastName + '!');
}

function simpleGreeting() {
	console.log('Hello, uh.... you!');
}

runWithDebugger(logName, ['Sean', 'McDonnell']);
// Expected output: 'Hello Sean McDonnell!'

runWithDebugger(simpleGreeting);
// Expected output: 'Hello, uh.... you!'

runWithDebugger(logName, 'Sean McDonnell');
// Expected output: 'Uncaught Error: Invalid argument: 'Sean McDonnell'. Must be an array.'




