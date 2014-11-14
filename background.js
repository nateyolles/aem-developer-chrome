/**
 * AemBackgroundScripts namespace.
 * @namespace
 */
var AemBackgroundScripts = (function(window, chrome, undefined) {

  /**
   * Inserts the content script and jQuery into the Chrome tab.
   *
   * @param {function} Callback function
   */
  function getPageDetails(callback) {
    chrome.runtime.onMessage.addListener(function(message) {
      callback(message);
    });

    chrome.tabs.executeScript(null, { file: 'jquery.min.js' });
    chrome.tabs.executeScript(null, { file: 'content.js' });
  };

  /**
   * Executes string of JavaScript in the Chrome tab.
   *
   * @param {String} JavaScript as a string
   * @param {function} Callback function
   */
  function executeScript(script) {
    chrome.tabs.getSelected(null, function(tab){
      chrome.tabs.executeScript(tab.id, {code: script}, function(response) {});
    });
  };

  return {
    getPageDetails: getPageDetails,
    executeScript: executeScript
  };
})(window, chrome);