
const id = "KeywordFinder";

chrome.app.runtime.onLaunched.addListener(function() {

	var openWindow = chrome.app.window.get(id);

	if (openWindow) openWindow.focus();

 	else chrome.app.window.create('index.html', {

 		'id': "KeywordFinder",

	  	'state': 'maximized',

	  	'frame': {
	  		'color': '#FFFFA3',
	  		'inactiveColor': '#FFFFB3'
		}

	});

});

