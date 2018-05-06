(function() {

	var libraryStorage = {};

	function librarySystem(libraryName, dependencies, callback) {
		// When saving a library
		if (arguments.length > 1) {
			// Library with dependencies
			if (dependencies.length > 0) {
				// Grab dependencies from storage and save to array
				var retrievedDependencies = dependencies.map(function(dependency){
					return libraryStorage[dependency];
				});
				// Pass dependencies array to new library being added
				libraryStorage[libraryName] = callback.apply(this, retrievedDependencies);
			// Library without dependencies
			} else {
				libraryStorage[libraryName] = callback();
			}
		// When just retrieving a library	
		} else {
			return libraryStorage[libraryName];
		}
	}

	window.librarySystem = librarySystem;

})();

librarySystem('name', [], function() {
  return 'Gordon';
});

librarySystem('company', [], function() {
  return 'Watch and Code';
});

librarySystem('workBlurb', ['name', 'company'], function(name, company) {
  return name + ' works at ' + company;
});

// Expected output: 'Gordon works at Watch and Code'
librarySystem('workBlurb');