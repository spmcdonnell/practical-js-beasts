(function(global) {

	var libraryStorage = {};
	var requiredDependencies = {};

	// Helper 
	function dependencyChecker(libraryName) {
		// Loop through requiredDependencies and see if the library just added is needed by others
		var key;

		// Loop through libraries that have dependencies and count how many dependencies are loaded already
		for (key in requiredDependencies) {
			if (requiredDependencies.hasOwnProperty(key)) {
				for (var i = 0; i < requiredDependencies[key].listOfDependecies.length; i++) {
					if (libraryName === requiredDependencies[key].listOfDependecies[i]) {
						requiredDependencies[key].loadedDependencies++;
					}
				};
			}
			// When all dependencies for a specific library are present
			if (requiredDependencies[key].listOfDependecies.length === requiredDependencies[key].loadedDependencies) {
				var dependenciesToInject = [];

				requiredDependencies[key].listOfDependecies.forEach(function(element) {
					dependenciesToInject.push(libraryStorage[element]);
				});

				libraryStorage[key] = libraryStorage[key].apply(this, dependenciesToInject);

				delete requiredDependencies[key];
			}
		}
	}

	// API 
	function librarySystem(libraryName, dependencies, callback) {
		// When saving a library
		if (arguments.length > 1) {
			// Library with dependencies
			if (dependencies.length > 0) {
				// Count how many dependencies already exist
				var numOfDependencies = 0;
				dependencies.forEach(function(dependency) {
					if (libraryStorage[dependency]) {
						numOfDependencies++;
					}
				});
				// If they ALL exist
				if (numOfDependencies === dependencies.length) {
					// Grab dependencies from storage and save to array
					var retrievedDependencies = dependencies.map(function(dependency){
						return libraryStorage[dependency];
					});
					// Pass dependencies array to new library being added
					libraryStorage[libraryName] = callback.apply(this, retrievedDependencies);
				// If none or some, but not all, exist	
				} else if (numOfDependencies >= 0) {
					requiredDependencies[libraryName] = {};
					requiredDependencies[libraryName].loadedDependencies = numOfDependencies;
					requiredDependencies[libraryName].listOfDependecies = dependencies;

					libraryStorage[libraryName] = callback;
				}	
			// Library without dependencies
			} else {
				libraryStorage[libraryName] = callback();
			}
			// Check if other libraries are dependent on the one being added
			dependencyChecker(libraryName);
		// When just retrieving a library	
		} else {
			return libraryStorage[libraryName];
		}
	}

	// Attach to global object
	global.librarySystem = librarySystem;

})(this);