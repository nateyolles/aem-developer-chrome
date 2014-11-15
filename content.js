/**
 * On page load send information about the tab to the content script.
 */
chrome.runtime.sendMessage({
  type : 'window',
  data : {
    'title': document.title,
    'location': window.location
  }
});

/**
 * AemDeveloper namespace.
 * @namespace
 */
var AemDeveloper = (function(window, undefined) {
  /**
   * @private
   * @global
   */
  var CLIENTLIB_QUERY =    '/crx/de/query.jsp?type=xpath&stmt=/jcr:root/var/clientlibs/*&showResults=true',
      COMPILED_JSP_QUERY = '/crx/de/query.jsp?type=xpath&stmt=/jcr:root/var/classes//jsp&showResults=true',
      USER_INFO =          '/libs/granite/security/currentuser.json'
      PRODUCT_INFO =       '/libs/cq/core/productinfo.json',
      SLING_INFO =         '/system/console/status-slingsettings.json',
      SYSTEM_INFO =        '/system/console/status-System%20Properties.json',
      SUDOABLE_INFO =      '.sudoables.json';

  /**
   * Open the marketing cloud debugger window.
   */
  function openDigitalPulseDebugger() {
    window.open("","dp_debugger","width=700,height=1000,location=0,menubar=0,status=1,toolbar=0,resizable=1,scrollbars=1").document.write("<script language=\"JavaScript\" id=dbg src=\"https://www.adobetag.com/d1/digitalpulsedebugger/live/DPD.js\"></"+"script>");
    chrome.runtime.sendMessage({
      type: 'dp_debugger',
      status: 'success'
    });
  }

  /**
   * Delete the results of the query and post a message with status.
   *
   * @param {String} query the URL with query to the JCR.
   */
  function deleteQueryResults(type, query) {
    var succesLength = 0;

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === 4) {
        if (xmlhttp.status === 200) {
          var data = JSON.parse(xmlhttp.responseText),
              resultLength = data.results.length;

          if (resultLength > 0) {
            for (var i = 0; i < resultLength; i++) {

              (function(){
                var xmlhttpInner = new XMLHttpRequest();

                xmlhttpInner.onreadystatechange = function() {
                  if (xmlhttpInner.readyState === 4) {
                    if (xmlhttpInner.status === 200 || xmlhttpInner.status === 204) {
                      succesLength++;

                      if (resultLength === succesLength) {
                        chrome.runtime.sendMessage({
                          type: type,
                          status: 'success'
                        });
                      } //end if success
                    } else {
                      chrome.runtime.sendMessage({
                        type: type,
                        status: 'fail'
                      });
                    } // end if/else status
                  } //end ready state
                };

                xmlhttpInner.open('DELETE', data.results[i].path, true);
                xmlhttpInner.send();
              })();
            }
          } else {
            chrome.runtime.sendMessage({
              type: type,
              status: 'noaction'
            });
          }
        } else {
          chrome.runtime.sendMessage({
            type: type,
            status: 'fail'
          });
        } //end if/else status code
      } //end readystate
    };

    xmlhttp.open('GET', query + '&_=' + Date.now(), true);
    xmlhttp.send();
  }

  /**
   * Delete cached client libs.
   */
  function clearClientLibs() {
    deleteQueryResults('clientlibs', CLIENTLIB_QUERY);
  }

  /**
   * Delete compiled JSP files.
   */
  function clearCompiledJSPs() {
    deleteQueryResults('compiled_jsps', COMPILED_JSP_QUERY);
  }


  /**
   * Get info and send a Chrome message.
   *
   * @param {String} Type of message to send.
   * @param {String} URL to query the JCR.
   */
  function getInfo(type, url, callback) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
      var data;

      if (xmlhttp.readyState === 4) {
        if (xmlhttp.status === 200) {
          data = JSON.parse(xmlhttp.responseText);
          chrome.runtime.sendMessage({
            type: type,
            status: 'success',
            data: data
          });

          if (callback) {
            callback(data)
          }
        } else {
          chrome.runtime.sendMessage({
            type: type,
            status: 'fail'
          });
        }
      }
    };

    xmlhttp.open('GET', url + '?_=' + Date.now(), true);
    xmlhttp.send();
  }

  function getSudoables(home) {
    getInfo('sudoables', home + SUDOABLE_INFO);
  }

  /**
   * Get user info.
   */
  function getUserInfo() {
    getInfo('user', USER_INFO, function(data){
      getSudoables(data.home);
    });
  }



  /**
   * Get product info.
   */
  function getProductInfo() {
    getInfo('product', PRODUCT_INFO);
  }

  /**
   * Get Sling info.
   */
  function getSlingInfo() {
    getInfo('sling', SLING_INFO);
  }

  /**
   * Get System info.
   */
  function getSystemInfo() {
    getInfo('system', SYSTEM_INFO);
  }

  /**
   * @public
   */
  return {
    openDigitalPulseDebugger : openDigitalPulseDebugger,
    clearClientLibs : clearClientLibs,
    clearCompiledJSPs : clearCompiledJSPs,
    getUserInfo : getUserInfo,
    getProductInfo : getProductInfo,
    getSlingInfo : getSlingInfo,
    getSystemInfo : getSystemInfo
  };
})(window);

/*
 * Get the information and send it to popup.js.
 */
AemDeveloper.getUserInfo();
AemDeveloper.getProductInfo();
AemDeveloper.getSlingInfo();
AemDeveloper.getSystemInfo();