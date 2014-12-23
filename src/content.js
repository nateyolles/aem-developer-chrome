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
      SUDOABLE_INFO =      '.sudoables.json',
      MEMORY_USAGE =       '/system/console/memoryusage',
      GARBAGE_COLLECTOR =  'command=gc';

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
   * Get all info.
   */
  function getAllInfo() {
    getUserInfo();
    getProductInfo();
    getSlingInfo();
    getSystemInfo();
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
   * Run garbage collector
   */
  function runGarbageCollector(){
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.open('POST', MEMORY_USAGE, true);
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.onreadystatechange = function(){
      if (xmlhttp.readyState === 4) {
        if (xmlhttp.status === 200) {
          chrome.runtime.sendMessage({
            type: 'garbage_collector',
            status: 'success'
          });
        } else {
          chrome.runtime.sendMessage({
            type: 'garbage_collector',
            status: 'fail'
          });
        }
      }
    };
    xmlhttp.send(GARBAGE_COLLECTOR);
  }

  function comparePage(compareToOrigin) {
    var path = location.pathname.replace('.html', '/jcr:content.-1.json');

    var currentPageRequest = new XMLHttpRequest();
    currentPageRequest.responseType = 'json';
    currentPageRequest.open('GET', location.origin + path);

    currentPageRequest.onreadystatechange = function(){
      if (currentPageRequest.readyState === 4 && currentPageRequest.status === 200) {
        var comparePageRequest = new XMLHttpRequest();
        comparePageRequest.responseType = 'json';
        comparePageRequest.open('GET', compareToOrigin + path);

        comparePageRequest.onreadystatechange = function(){
          if (comparePageRequest.readyState === 4 && comparePageRequest.status === 200) {
            console.log('got both');

            var instance = jsondiffpatch.create({
                objectHash: function(obj) {
                    return obj.name;
                }
            })

            var currentJson = currentPageRequest.response;
            var compareJson = comparePageRequest.response;

            var propertiesToIgnore = ['jcr:createdBy', 'cq:lastModified', 'cq:lastModifiedBy',
                                      'jcr:created', 'jcr:lastModified', 'jcr:lastModifiedBy',
                                      'jcr:baseVersion', 'jcr:isCheckedOut', 'jcr:predecessors',
                                      'jcr:uuid', 'jcr:versionHistory', 'cq:lastReplicated'];
            function loopJson(obj) {
              for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                  if (propertiesToIgnore.indexOf(key) !== -1) {
                    delete obj[key];
                  } else if (typeof obj[key] === 'object') {
                    loopJson(obj[key]);
                  } else {
                    obj[key] = escapeHTML(obj[key]);
                  }
                }
              }
            }

            loopJson(currentJson);
            loopJson(compareJson);

            var delta = instance.diff(compareJson, currentJson);
            var visualdiff = document.createElement('div');
            visualdiff.className = 'aem-developer-chrome-diff';
            

            function escapeHTML (str)
            {
                var div = document.createElement('div');
                var text = document.createTextNode(str);
                div.appendChild(text);
                return div.innerHTML;
            }

            var diffToggle = document.createElement('a');
            diffToggle.href = '#';
            diffToggle.innerHTML = 'Show All';
            diffToggle.className = "aem-developer-chrome-diff-toggle";
            var flag = false;
            diffToggle.onclick = function(evt){
              if (flag) {
                jsondiffpatch.formatters.html.hideUnchanged();
                diffToggle.innerHTML = 'Show All';
              }
              else {
                jsondiffpatch.formatters.html.showUnchanged();
                diffToggle.innerHTML = 'Show Difference';
              }

              flag = !flag;
              evt.preventDefault();
            };

            var titleSpan = document.createElement('span');
            titleSpan.innerHTML = 'Compare';
            titleSpan.className = 'aem-developer-chrome-diff-title';

            var close = document.createElement('a');
            close.href = '#';
            close.className = 'aem-developer-chrome-diff-close';
            close.title = 'Close compare modal'
            close.onclick= function(evt){
              visualdiff.parentElement.removeChild(visualdiff);
              evt.preventDefault();
            };


            var titleBar = document.createElement('div');
            titleBar.className = 'aem-developer-chrome-diff-titlebar';
            titleBar.appendChild(titleSpan);
            titleBar.appendChild(diffToggle);
            titleBar.appendChild(close);





            
            visualdiff.innerHTML = jsondiffpatch.formatters.html.format(delta, compareJson);
            jsondiffpatch.formatters.html.hideUnchanged();

            

            document.querySelectorAll('body')[0].appendChild(visualdiff);
            visualdiff.appendChild(titleBar);
            var scripts = visualdiff.querySelectorAll('script');
            for (var i = 0; i < scripts.length; i++) {
              eval(scripts[i].innerHTML);
            }

            // var a = document.getElementsByClassName('jsondiffpatch-child-node-type-object');

            // for (var x = 0; x < a.length; x++) {
            //   a[x].addEventListener('click', function(e){
            //     var b = this.getElementsByClassName('jsondiffpatch-unchanged');
            //     for (var y = 0; y < b.length; y++) {
            //       if (b[y].style.maxHeight === 'inherit') {
            //         b[y].style.maxHeight = '0';
            //       } else {
            //         b[y].style.maxHeight = 'inherit';
            //       }
            //     }
            //   });
            // }
          }
        }

        comparePageRequest.send();
      }
    }

    currentPageRequest.send();
  }

  /**
   * @public
   */
  return {
    openDigitalPulseDebugger : openDigitalPulseDebugger,
    clearClientLibs : clearClientLibs,
    clearCompiledJSPs : clearCompiledJSPs,
    getAllInfo : getAllInfo,
    runGarbageCollector : runGarbageCollector,
    comparePage : comparePage
  };
})(window);