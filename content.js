/**
 * On page load send information about the tab to the content script.
 */
chrome.runtime.sendMessage({
  'title': document.title,
  'location': window.location
});

/**
 * AemDeveloper namespace.
 * @namespace
 */
var AemDeveloper = (function(window, $, undefined) {
  /**
   * @private
   * @global
   */
  var CLIENTLIB_QUERY =    '/crx/de/query.jsp?type=xpath&stmt=/jcr:root/var/clientlibs/*&showResults=true',
      COMPILED_JSP_QUERY = '/crx/de/query.jsp?type=xpath&stmt=/jcr:root/var/classes//jsp&showResults=true';

  /**
   * Open the marketing cloud debugger window.
   */
  function openDigitalPulseDebugger() {
    window.open("","dp_debugger","width=700,height=1000,location=0,menubar=0,status=1,toolbar=0,resizable=1,scrollbars=1").document.write("<script language=\"JavaScript\" id=dbg src=\"https://www.adobetag.com/d1/digitalpulsedebugger/live/DPD.js\"></"+"script>");
    chrome.runtime.sendMessage({status: 'success'});
  }

  /**
   * Delete the results of the query and post a message with status.
   *
   * @param {String} query the URL with query to the JCR.
   */
  function deleteQueryResults(query) {
    var succesLength = 0;

    $.ajax({
      type: 'GET',
      cache: false,
      url: query,
      success: function(data, status, jqXHR){
        var resultLength = data.results.length;

        if (resultLength > 0) {
          for (var i = 0; i < resultLength; i++) {

            $.ajax({
              type: 'DELETE',
              url: data.results[i].path,
              success: function(data, status, jqXHR){
                succesLength++;

                if (resultLength === succesLength) {
                  chrome.runtime.sendMessage({status: 'success'});
                }
              },
              error: function(jqXHR, status, error) {
                chrome.runtime.sendMessage({status: 'fail'});
              }
            });
          }
        } else {
          chrome.runtime.sendMessage({status: 'noaction'});
        }
      },
      error: function(jqXHR, status, error) {
        chrome.runtime.sendMessage({status: 'fail'});
      }
    });
  }

  /**
   * Delete cached client libs.
   */
  function clearClientLibs() {
    deleteQueryResults(CLIENTLIB_QUERY);
  }

   /**
   * Delete compiled JSP files.
   */
  function clearCompiledJSPs() {
    deleteQueryResults(COMPILED_JSP_QUERY);
  }

  /**
   * @public
   */
  return {
    openDigitalPulseDebugger : openDigitalPulseDebugger,
    clearClientLibs : clearClientLibs,
    clearCompiledJSPs : clearCompiledJSPs
  };
})(window, $);