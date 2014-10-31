var globalCallback;

chrome.runtime.onMessage.addListener(function(message) {
  globalCallback(message);
});

var AemBackgroundScripts = (function(window, chrome, undefined) {

  function getPageDetails(callback) {
    globalCallback = callback;
    // Inject the content script into the current page 
    chrome.tabs.executeScript(null, { file: 'jquery.min.js' });
    chrome.tabs.executeScript(null, { file: 'content.js' });
  };

  function executeScript(script, callback) {
    globalCallback = callback;
    chrome.tabs.getSelected(null, function(tab){
      chrome.tabs.executeScript(tab.id, {code: script}, function(response) {});
    });
  };

  return {
    getPageDetails: getPageDetails,
    executeScript: executeScript
  };
})(window, chrome);