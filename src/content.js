/**
 * AemDeveloper namespace.
 * @namespace
 */
var AemDeveloper = (function(window, undefined) {
  /**
   * @private
   * @global
   */
  var CLIENTLIB_QUERY         = '/crx/de/query.jsp?type=xpath&stmt=/jcr:root/var/clientlibs/*&showResults=true',
      COMPILED_JSP_QUERY      = '/crx/de/query.jsp?type=xpath&stmt=/jcr:root/var/classes//jsp&showResults=true',
      LINKCHECKER_QUERY       = '/crx/de/query.jsp?type=xpath&stmt=/jcr:root/var/linkchecker/*&showResults=true',
      ACTIVATE_TREE           = '/etc/replication/treeactivation.html',
      ACTIVATE_PAGE           = '/bin/replicate.json',
      AUTH_LOG_OUT            = '/crx/de/logout.jsp',
      AUTH_LOG_IN             = '/crx/de/j_security_check',
      USER_INFO               = '/libs/granite/security/currentuser.json'
      PRODUCT_INFO            = '/libs/cq/core/productinfo.json',
      SLING_INFO              = '/system/console/status-slingsettings.json',
      SYSTEM_INFO             = '/system/console/status-System%20Properties.json',
      SUDOABLE_INFO           = '.sudoables.json',
      MEMORY_USAGE            = '/system/console/memoryusage',
      GARBAGE_COLLECTOR       = 'command=gc',
      COMPARE_CONTAINER_NAME  = 'aem-developer-chrome-diff',
      TITLE_BAR_CLASS_NAME    = 'titlebar',
      COMPARE_BAR_CLASS_NAME  = 'comparebar',
      CONTAINER_CLASS_NAME    = 'container',
      SELF_VIEW_CLASS_NAME    = 'self_view',
      COMPARE_TEXT            = 'Compare',
      VIEW_TEXT               = 'View',
      TITLE_CLASS_NAME        = 'title',
      TOGGLE_CLASS_NAME       = 'toggle',
      TOGGLE_HIDE_ALL_TEXT    = 'Show Difference',
      TOGGLE_SHOW_ALL_TEXT    = 'Show All',
      CLOSE_CLASS_NAME        = 'close',
      CLOSE_TITLE_TEXT        = 'Close compare modal';

  /**
   * Open the marketing cloud debugger window.
   */
  function openDigitalPulseDebugger() {
    var dp_debugger = window.open("","dp_debugger","width=700,height=1000,location=0,menubar=0,status=1,toolbar=0,resizable=1,scrollbars=1");
    dp_debugger.document.write("<script language=\"JavaScript\" id=dbg src=\"https://www.adobetag.com/d1/digitalpulsedebugger/live/DPD.js\"></"+"script>");
    dp_debugger.focus();

    chrome.runtime.sendMessage({
      type: 'dp_debugger',
      status: 'success'
    });
  }

  /**
   * Delete the results of the query and post a message with status.
   *
   * @private
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
   * Delete cached linkchecker results.
   */
  function clearLinkChecker() {
    deleteQueryResults('linkChecker', LINKCHECKER_QUERY);
  }

  /**
   * Get window title and location.
   */
  function getWindowInfo() {
    chrome.runtime.sendMessage({
      type : 'window',
      data : {
        'title': document.title,
        'location': window.location
      }
    });
  }

  /**
   * Get info and send a Chrome message.
   *
   * @private
   * @param {String} Type of message to send.
   * @param {String} URL to query the JCR.
   * @param {Function} Callback function.
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

  /**
   * Post to AEM
   *
   * @private
   * @param {String} Type of message to send.
   * @param {String} URL to post to the JCR.
   * @param {String} parameters for the post request.
   * @param {Function} Callback function.
   */
  function post(type, url, params, callback) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === 4) {
        if (xmlhttp.status === 200) {
          chrome.runtime.sendMessage({
            type: type,
            status: 'success'
          });
          
          if (callback) {
            callback(xmlhttp);
          }

        } else {
          chrome.runtime.sendMessage({
            type: type,
            status: 'fail'
          });
        }
      }
    };

    xmlhttp.open('POST', url, true);
    xmlhttp.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    xmlhttp.send(params);
  }

  /**
   * Activate Tree starting at current page.
   *
   * @param {String} pathname
   */
  function activateTree(pathname) {
    post('activateTree', ACTIVATE_TREE, 'cmd=activate&ignoredeactivated=false&onlymodified=false&path=' + pathname + '&_charset_=utf-8');
  }

  /**
   * Activate current page.
   *
   * @param {String} pathname
   */
  function activatePage(pathname) {
    post('activatePage', ACTIVATE_PAGE, 'cmd=activate&path=' + pathname + '&_charset_=utf-8');
  }

  /**
   * Deactivate current page.
   *
   * @param {String} pathname
   */
  function deactivatePage(pathname) {
    post('deactivatePage', ACTIVATE_PAGE, 'cmd=deactivate&path=' + pathname + '&_charset_=utf-8');
  }

  /**
   * Log out of AEM and refresh the browser.
   */
  function logOut() {
    getInfo('logout', AUTH_LOG_OUT, function(){
      location.reload();
    });
  }

  /**
   * Log into AEM.
   *
   * @param {String} user The user name
   * @param {String} pass The password
   */
  function logIn(user, pass) {
    var params = 'j_username=' + user + '&j_password=' + pass + '&j_workspace=crx.default&j_validate=true&_charset_=utf-8';

    post('login', AUTH_LOG_IN, params, function(){
      location.reload();
    });
  }

  /**
   * Get list of users that can be impersonated.
   *
   * @param {String} Path to user e.g. '/home/users/a/admin'
   */
  function getSudoables(home) {
    getInfo('sudoables', home + SUDOABLE_INFO);
  }

  /**
   * Get all info.
   */
  function getAllInfo() {
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

  /**
   * Escape HTML String. Not to be used for XSS protection.
   *
   * @private
   * @param {String} String to escape.
   * @returns {String} Escaped string.
   */
  function escapeHTML(str) {
    var div = document.createElement('div'),
        text = document.createTextNode(str);

    div.appendChild(text);
    return div.innerHTML;
  }

  /**
   * Remove provided keys from JSON objects.
   *
   * @private 
   * @param {JSON} JSON object.
   * @param {String[]} Array of Strings to remove from JSON object.
   */
  function scrubJson(obj, propertiesToRemove) {
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (propertiesToRemove.indexOf(key) !== -1) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          scrubJson(obj[key], propertiesToRemove);
        } else {
          obj[key] = escapeHTML(obj[key]);
        }
      }
    }
  }

  /**
   * Get the difference between two JSON objects in jsondiffpatch HTML format.
   *
   * @private
   * @param {JSON} JSON object to be compared against
   * @param {JSON} JSON object to be compared with
   * @returns {String} The delta of the two JSON objects formatted in HTML.
   * @see {@link https://github.com/benjamine/jsondiffpatch/blob/master/docs/formatters.md} for further information.
   * @requires {@link https://github.com/benjamine/jsondiffpatch}
   */
  function getDifferenceHtml(currentJson, compareJson) {
    var instance = jsondiffpatch.create({
      objectHash: function(obj) {
        return obj.name;
      }
    });

    var propertiesToRemove = ['jcr:createdBy', 'cq:lastModified', 'cq:lastModifiedBy',
                              'jcr:created', 'jcr:lastModified', 'jcr:lastModifiedBy',
                              'jcr:baseVersion', 'jcr:isCheckedOut', 'jcr:predecessors',
                              'jcr:uuid', 'jcr:versionHistory', 'cq:lastReplicated'];

    scrubJson(currentJson, propertiesToRemove);
    scrubJson(compareJson, propertiesToRemove);

    var delta = instance.diff(compareJson, currentJson);

    return jsondiffpatch.formatters.html.format(delta, compareJson);
  }

  /**
   * Create and add differential HTML to the page.
   *
   * @private
   * @param {HTMLElement} The DOM node to attach the Shadow DOM and HTML difference to.
   * @param {String} HTML difference to insert into page.
   * @param {String} The current origin to compare against (e.g. 'http://localhost:4502').
   * @param {String} The origin to compare with (e.g. 'http://localhost:4503').
   * @param {String} The path of the page to compare (e.g '/content/project/en_us/about.html). 
   * @see {@link https://github.com/benjamine/jsondiffpatch/blob/master/docs/formatters.md} for further information.
   * @requires {@link https://github.com/benjamine/jsondiffpatch}
   */
  function createDifferenceHtml(insertionPoint, html, origin, compareToOrigin, path) {
    var visualdiff = document.createElement('div'),
        diffToggle = document.createElement('a'),
        titleSpan = document.createElement('span'),
        close = document.createElement('a'),
        titleBar = document.createElement('div'),
        compareBar = document.createElement('div'),
        left = document.createElement('span'),
        right = document.createElement('span'),
        container = document.createElement('div'),
        root = container.createShadowRoot();
        isShowingAll = false,
        isSelfView = !compareToOrigin;

    titleSpan.innerHTML = isSelfView ? VIEW_TEXT : COMPARE_TEXT;
    titleSpan.className = TITLE_CLASS_NAME;

    close.href = '#';
    close.className = CLOSE_CLASS_NAME;
    close.title = CLOSE_TITLE_TEXT;
    close.onclick = function(evt){
      container.parentElement.removeChild(container);
      evt.preventDefault();
    };

    diffToggle.href = '#';
    diffToggle.innerHTML = TOGGLE_SHOW_ALL_TEXT;
    diffToggle.className = TOGGLE_CLASS_NAME;
    diffToggle.onclick = function(evt){
      if (isShowingAll) {
        jsondiffpatch.formatters.html.hideUnchanged(visualdiff);
        diffToggle.innerHTML = TOGGLE_SHOW_ALL_TEXT;
      } else {
        jsondiffpatch.formatters.html.showUnchanged(true, visualdiff);
        diffToggle.innerHTML = TOGGLE_HIDE_ALL_TEXT;
      }

      isShowingAll = !isShowingAll;
      evt.preventDefault();
    };

    titleBar.className = TITLE_BAR_CLASS_NAME;
    titleBar.appendChild(titleSpan);

    if (!isSelfView) {
      titleBar.appendChild(diffToggle);
    }

    titleBar.appendChild(close);

    left.innerHTML = '<span class="origin">' + origin + '</span>' + path;
    right.innerHTML = '<span class="origin">' + compareToOrigin + '</span>' + path;

    compareBar.className = COMPARE_BAR_CLASS_NAME;
    compareBar.appendChild(left);

    if (!isSelfView) {
      compareBar.appendChild(right);
    }

    visualdiff.innerHTML = html;
    visualdiff.className = isSelfView ? CONTAINER_CLASS_NAME + ' ' + SELF_VIEW_CLASS_NAME : CONTAINER_CLASS_NAME;
    visualdiff.appendChild(titleBar);
    visualdiff.appendChild(compareBar);

    jsondiffpatch.formatters.html.hideUnchanged(visualdiff);

    container.id = COMPARE_CONTAINER_NAME;

    root.appendChild(visualdiff);

    insertionPoint.appendChild(container);
  }

  /**
   * Gets location object without the content finder.
   *
   * @private
   * @returns {Object} Pseudo location object
   */
  function getNormalizedLocation() {
    if (location.pathname === '/cf') {
      var anchor = document.createElement('a');

      anchor.href = location.href.replace('/cf#/', '/');

      return {
        pathname : anchor.pathname,
        origin : anchor.origin,
        search : anchor.search,
        host : anchor.host,
        hostname : anchor.hostname,
        protocol : anchor.protocol,
        port : anchor.port
      };
    } else {
      return location;
    }
  }

  /**
   * Get a location pathname for use in an AJAX call to the JCR.
   *
   * Add the jcr:content node to the current path, change selector
   * from html to an inifinity JSON selector, remove editor.html.
   *
   * @private
   * @param {String} location pathname
   * @returns {String} location pathname ready for use to 
   */
  function getPathnameForJcrAjaxCall(pathname){
    var EDITOR = '/editor.html',
        HTML_EXTENSION = '.html',
        JSON_EXTENSION = '.-1.json';

    if (pathname.indexOf(EDITOR) === 0) {
      pathname = pathname.replace(EDITOR, '');
    }

    pathname = pathname.replace(HTML_EXTENSION, JSON_EXTENSION);

    return pathname;
  }

  /**
   * Compare page to the same page on a given domain.
   *
   * @param {String} Domain to compare current page to (e.g. 'http://localhost:4503'). 
   * @param {Number} Index of compare link clicked.
   */
  function comparePage(compareToOrigin, index) {
    var isSelfView = !compareToOrigin,
        location = getNormalizedLocation(),
        path = getPathnameForJcrAjaxCall(location.pathname);

    var sendFail = function() {
      chrome.runtime.sendMessage({
        type: 'compare',
        status: 'fail',
        data: {
          index: index
        }
      });
    };

    // TEMP: if self view only do one request to current page
    if (isSelfView) {
      compareToOrigin = location.origin;
    }

    var comparePageRequest = new XMLHttpRequest();

    comparePageRequest.onreadystatechange = function() {
      if (comparePageRequest.readyState === 4) {
        if (comparePageRequest.status === 200) {
          var currentPageRequest = new XMLHttpRequest();
          currentPageRequest.responseType = 'json';
          currentPageRequest.open('GET', location.origin + path);

          currentPageRequest.onreadystatechange = function() {
            if (currentPageRequest.readyState === 4) {
              if (currentPageRequest.status === 200) {
                var html,
                    body,
                    oldContainer;

                if (isSelfView) {
                  html = getDifferenceHtml(currentPageRequest.response, {});
                } else {
                  html = getDifferenceHtml(currentPageRequest.response, comparePageRequest.response);
                }

                if (html) {
                  // difference found
                  body = document.querySelector('body'),
                  oldContainer = document.getElementById(COMPARE_CONTAINER_NAME);

                  if (oldContainer) {
                    body.removeChild(oldContainer);
                  }

                  // TEMP: if self view only do one request to current page
                  if (isSelfView) { compareToOrigin = ''}
                  createDifferenceHtml(body, html, location.origin, compareToOrigin, path);

                  chrome.runtime.sendMessage({
                    type: 'compare',
                    status: 'success'
                  });
                } else {
                  // AJAX successful but no differences found
                  chrome.runtime.sendMessage({
                    type: 'compare',
                    status: 'noaction',
                    data: {
                      index: index
                    }
                  });
                }
              } else {
                sendFail();
              }
            }
          };

          currentPageRequest.send();
        } else {
          sendFail();
        }
      }
    };

    comparePageRequest.responseType = 'json';
    comparePageRequest.open('GET', compareToOrigin + path);
    comparePageRequest.setRequestHeader('Access-Control-Allow-Origin', '*');
    comparePageRequest.timeout = 2000;
    comparePageRequest.ontimeout = function() {
      sendFail();
    };

    comparePageRequest.send();
  }

  /**
   * @public
   */
  return {
    openDigitalPulseDebugger : openDigitalPulseDebugger,
    clearClientLibs : clearClientLibs,
    clearCompiledJSPs : clearCompiledJSPs,
    clearLinkChecker : clearLinkChecker,
    getUserInfo: getUserInfo,
    getAllInfo : getAllInfo,
    runGarbageCollector : runGarbageCollector,
    comparePage : comparePage,
    getWindowInfo : getWindowInfo,
    logOut : logOut,
    logIn : logIn,
    activateTree : activateTree,
    activatePage : activatePage,
    deactivatePage : deactivatePage
  };
})(window);

/* Send window title, window location and user information on page load */
AemDeveloper.getWindowInfo();
AemDeveloper.getUserInfo();