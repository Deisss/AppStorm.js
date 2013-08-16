// Handling translate/language content
(function() {
	var tr = {
		// In english
		"en" : {
			"loading" :               "Loading...",
			"disclaimer" :            "You can add any number of todo, they are stored into your browser storage (should be localStorage on modern browsers)",
			"add-todo" :              "Add a new todo:",
			"add-todo-submit" :       "Add",
			"existing-todo" :         "Here is the list of previously stored todo:",
			"no-todo" :               "No todo"
		},
		// In french
		"fr" : {
			"loading" :               "Chargement...",
			"disclaimer" :            "Vous pouvez ajouter n'importe quel todo, ils sont stockés dans le store de votre navigateur (devrait être localStorage sur les navigateurs modernes)",
			"add-todo" :              "Ajouter un nouveau todo :",
			"add-todo-submit" :       "Ajouter",
			"existing-todo" :         "Voici la liste des todos précédement stockés :",
			"no-todo" :               "Aucun todo"
		},
		// In deutsch
		"de" : {
			"loading" :            "Verladung...",
			"disclaimer" :            "Sie können eine beliebige todo hinzufügen, werden sie in den Schatten Ihres Browsers gespeichert (localStorage sollte auf modernen Browsern)",
			"add-todo" :              "Fügen Sie einen neuen todo:",
			"add-todo-submit" :       "Hinzufügen",
			"existing-todo" :         "Hier ist die Liste der zuvor gespeicherten todos:",
			"no-todo" :               "Keiner todo"
		}
	};

	// Setup allowed language
	a.language.setAllowed(["en", "fr", "de"]);

	// Adding language
	for(var lang in tr) {
		a.language.addTranslation(lang, tr[lang]);
	}
})();