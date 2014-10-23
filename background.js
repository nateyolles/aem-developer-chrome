// This function is called onload in the popup code
function getPageDetails(callback) { 
    // Inject the content script into the current page 
    chrome.tabs.executeScript(null, { file: 'jquery.min.js' }); 
    chrome.tabs.executeScript(null, { file: 'content.js' }); 
    // Perform the callback when a message is received from the content script
    chrome.runtime.onMessage.addListener(function(message)  { 
        // Call the callback function
        callback(message); 
    }); 
};

function clearClientLibs(callback){
	chrome.tabs.getSelected(null, function(tab){
    	chrome.tabs.executeScript(tab.id, {code: "clearClientLibs()"}, function(response) {});
	});
}

function clearCompiledJSPs(callback){
	chrome.tabs.getSelected(null, function(tab){
    	chrome.tabs.executeScript(tab.id, {code: "clearCompiledJSPs()"}, function(response) {});
	});
}

function openDigitalPulseDebugger(callback){
    chrome.tabs.getSelected(null, function(tab){
        chrome.tabs.executeScript(tab.id, {code: "openDigitalPulseDebugger()"}, function(response) {});
    });
}
