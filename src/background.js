/**
 * AemBackgroundScripts namespace.
 * @namespace
 */
var AemBackgroundScripts = (function(window, chrome, undefined) {

  /**
   * Inserts the content script and css into the Chrome tab and
   * sets the listener event.
   *
   * @param {function} Callback function
   */
  function initialize(callback) {
    chrome.runtime.onMessage.addListener(function(message) {
      if (message) {
        callback(message);
      }
    });

    chrome.tabs.executeScript(null, { file: 'content.js' });

    chrome.tabs.executeScript(null, { file: 'jsondiffpatch-full.min.js' });
    chrome.tabs.executeScript(null, { file: 'jsondiffpatch-formatters.min.js' });
    chrome.tabs.executeScript(null, { file: 'diff_match_patch_uncompressed.js' });
    chrome.tabs.insertCSS(null, { file: 'html.css'});
  }

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
  }

  /**
   * @public
   */
  return {
    initialize: initialize,
    executeScript: executeScript
  };
})(window, chrome);