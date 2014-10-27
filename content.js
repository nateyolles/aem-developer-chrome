chrome.runtime.sendMessage({
  'title': document.title,
  'location': window.location
});

var AemDeveloper = (function(window, $, undefined) {
  /** private members */
  var CLIENTLIB_QUERY =    '/crx/de/query.jsp?type=xpath&stmt=/jcr:root/var/clientlibs/*&showResults=true',
      COMPILED_JSP_QUERY = '/crx/de/query.jsp?type=xpath&stmt=/jcr:root/var/classes//jsp&showResults=true';

  /** private methods */

  function openDigitalPulseDebugger() {
    window.open("","dp_debugger","width=700,height=1000,location=0,menubar=0,status=1,toolbar=0,resizable=1,scrollbars=1").document.write("<script language=\"JavaScript\" id=dbg src=\"https://www.adobetag.com/d1/digitalpulsedebugger/live/DPD.js\"></"+"script>");
    chrome.runtime.sendMessage({status: 'dpd good'});
  }

  /* doesn't work! */
  function openClientContextWindow() {
    if (typeof CQ_Analytics !== 'undefined' && CQ_Analytics.ClientContextUI) {
      CQ_Analytics.ClientContextUI.show();
      chrome.runtime.sendMessage({status: 'clientcontext good'});
    } else {
      chrome.runtime.sendMessage({status: 'no CQ_Analytics'});
    }
  }

  function deleteQueryResults(query, message) {
    $.ajax({
      type: 'GET',
      cache: false,
      url: query,
      success: function(data, status, jqXHR){
        if (data.results.length > 0) {
          for (var i = 0; i < data.results.length; i++) {
            $.ajax({
              type: 'DELETE',
              url: data.results[i].path,
              done: function(data, status, jqXHR){
                //alert('Success: ' + message + ' cache cleared.');
                chrome.runtime.sendMessage({status: 'success'});
              },
              fail: function(jqXHR, status, error) {
                //alert('Error: ' + message + ' cached failed to clear.');
                chrome.runtime.sendMessage({status: 'fail'});
              }
            });
          }
        } else {
          //alert('No ' + message + ' cache to be cleared.');
          chrome.runtime.sendMessage({status: 'noaction'});
        }
      },
      error: function(jqXHR, status, error) {
        //alert('Error: ' + message + ' cached failed to clear.');
        chrome.runtime.sendMessage({status: 'fail'});
      }
    });
  }

  function clearClientLibs(callback) {
    deleteQueryResults(CLIENTLIB_QUERY, 'ClientLibs');
  }

  function clearCompiledJSPs(callback) {
    deleteQueryResults(COMPILED_JSP_QUERY, 'Compiled JSP');
  }

  /** public */
  return {
    openDigitalPulseDebugger : openDigitalPulseDebugger,
    clearClientLibs : clearClientLibs,
    clearCompiledJSPs : clearCompiledJSPs,
    openClientContextWindow : openClientContextWindow
  };
})(window, $);