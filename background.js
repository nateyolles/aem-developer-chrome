var globalCallback;

chrome.runtime.onMessage.addListener(function(message) {
  globalCallback(message);
});

// This function is called onload in the popup code
function getPageDetails(callback) {
  globalCallback = callback;
  // Inject the content script into the current page 
  chrome.tabs.executeScript(null, { file: 'js/jquery.min.js' });
  chrome.tabs.executeScript(null, { file: 'content.js' });
}

function executeScript(script, callback) {
  globalCallback = callback;
  chrome.tabs.getSelected(null, function(tab){
    chrome.tabs.executeScript(tab.id, {code: script}, function(response) {});
  });
}