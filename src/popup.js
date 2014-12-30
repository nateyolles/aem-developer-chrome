/*
TODO: comment code
TODO: organize code
TODO: change jquery to angular
TODO: make links full size to list item
TODO: hover over on those links
TODO: touch/classic ui
TODO: organize debugger tools, query and clientlibs
TODO: redo show status timeout
TODO: common links needs to read current touch/classic mode and stay in it
TODO: GA code and clicks(?)
*/

var app = angular.module('PopupApp', ['ngStorage']),
    MANIFEST_URL = 'https://raw.githubusercontent.com/nateyolles/aem-developer-chrome/master/manifest.json',
    EXTENSION_URL = 'https://chrome.google.com/webstore/detail/aem-developer/hgjhcngmldfpgpakbnffnbnmcmohfmfc',
    cachedEventPage,
    pageDetails;

var uiMap = [
  {
    'classic' : '/siteadmin#',
    'touch'   : '/sites.html'
  }, {
    'classic' : '/publishingadmin#',
    'touch'   : '/publications.html'
  }, {
    'classic' : '/damadmin#',
    'touch'   : '/assets.html'
  }, {
    'classic' : '',
     'touch'  : '/editor.html'
   }
];

app.controller('PopupController', function($scope, $localStorage, $http){

  $scope.options = $localStorage.$default({
    servers: [
      {name: 'Local Author', url: 'http://localhost:4502'},
      {name: 'Local Publish', url: 'http://localhost:4503'}
    ]
  });

  $scope.newServer = {
    name : '',
    url: ''
  }

  $scope.user = {
    name : '',
    authorizableId : '',
    isImpersonated : false,
    home : ''
  };

  $scope.product = {
    version : ''
  };

  $scope.sling = {
    runModes : ''
  };

  $scope.system = {
    java : {
      version : '',
      runtime : '',
      vm : ''
    },
    os : {
      version : '',
      name : '',
      arch : '',
      dir : ''
    }
  };

  $scope.editMode = false;

  $scope.sudoables = ['', '-------'];  

  $scope.$watch('user.authorizableId', function(newValue, oldValue) {
    $scope.sudoables[0] = $scope.user.authorizableId;
  });

  $scope.getInfo = function(){
    cachedEventPage.AemBackgroundScripts.executeScript('AemDeveloper.getAllInfo()');
  };

  // pageDetails doesn't exist yet
  $scope.isLinkCurrentPage = function(index){
    var curr = $scope.options.servers[index].url;

    /** Remove trailing slash */
    if (curr[curr.length - 1] === '/') {
      curr = curr.substr(0, curr.length - 1);
    }

    console.dir(pageDetails);
    return curr === pageDetails.location.origin;
  }

  $scope.changeEditMode = function() {
    if (!$scope.newServer.name.isEmpty() && !$scope.newServer.url.isEmpty()) {
      $scope.add();
    }

    $scope.editMode = !$scope.editMode;
  }

  $scope.remove = function(index) {
    $scope.options.servers.splice(index, 1);
  };

  $scope.add = function() {
    $scope.options.servers.push({name: $scope.newServer.name, url: $scope.newServer.url});
    $scope.newServer.name = '';
    $scope.newServer.url = '';
  };

  $scope.showCompare = function(index){
    var newOrigin = $scope.options.servers[index].url;

    newOrigin = removeTrailingSlash(newOrigin);

    if (pageDetails && pageDetails.location) {
      return newOrigin !== pageDetails.location.origin;
    }

    return false;
  }

  $scope.compareToEnvironment = function(index) {
    var newOrigin = $scope.options.servers[index].url;

    newOrigin = removeTrailingSlash(newOrigin);

    cachedEventPage.AemBackgroundScripts.executeScript('AemDeveloper.comparePage("' + newOrigin + '",' + index + ')');
  };

  $scope.redirectToEnvironment = function(index, isNewWindow){
    var newOrigin = $scope.options.servers[index].url,
        newUrl;

    newOrigin = removeTrailingSlash(newOrigin);

    newUrl = newOrigin + pageDetails.location.pathname + pageDetails.location.search + pageDetails.location.hash;

    if (isNewWindow) {
      openNewTab(newUrl);
    } else {
      setTabLocation(newUrl);
    }
    window.close();
  };

  chrome.runtime.getBackgroundPage(function(eventPage) {

    cachedEventPage = eventPage;

    eventPage.AemBackgroundScripts.getPageDetails(function(tab){
      if (tab && tab.type) {
        switch(tab.type){
          case 'window':
            if (tab.data) {
              pageDetails = tab.data;
              pageDetails.location = normalizeLocation(pageDetails.location);
            }
            break;
          case 'user':
            if (tab.data) {
              $scope.$apply(function(){
                $scope.user.name = tab.data.name_xss;
                $scope.user.authorizableId = tab.data.authorizableId_xss;
                $scope.user.isImpersonated = tab.data.isImpersonated;
                $scope.user.home = tab.data.home;
              });
            }
            break;
          case 'product':
            if (tab.data) {
              $scope.$apply(function(){
                $scope.product.version = tab.data.version;
              });
            }
            break;
          case 'sling':
            if (tab.data) {
              $scope.$apply(function(){
                var slingInfo = convertSlingArrayToObject(tab.data);
                $scope.sling.runModes = slingInfo['Run Modes'];
              });
            }
            break;
          case 'system':
            if (tab.data) {
              $scope.$apply(function(){
                var systemInfo = convertSlingArrayToObject(tab.data);

                $scope.system.java.version = systemInfo['java.runtime.version'];
                $scope.system.java.runtime = systemInfo['java.runtime.name'];
                $scope.system.java.vm = systemInfo['java.vm.name'];
                $scope.system.os.version = systemInfo['os.version'];
                $scope.system.os.name = systemInfo['os.name'];
                $scope.system.os.arch = systemInfo['os.arch'];
                $scope.system.os.dir = systemInfo['user.dir'];
              });
            }
            break;
          case 'clientlibs':
            showStatus($('#lnk_clearClientLibs'), tab.status);
            break;
          case 'compiled_jsps':
            showStatus($('#lnk_clearCompiledJSPs'), tab.status);
            break;
          case 'garbage_collector':
            showStatus($('a'), tab.status);
            break;
          case 'sudoables':
            $scope.$apply(function(){
              for (var x = 0; x < tab.data.authorizables.length; x++) {
                $scope.sudoables.push(tab.data.authorizables[x].id);
              }  
            });
            break;
          case 'compare':
            if (tab.status === 'success') {
              window.close();
            } else {
              showStatus($('#compare_' + tab.data.index), tab.status);
            }
            break;
        }
      }
    });
    
  });

});

window.addEventListener('load', function(evt) {

  $('button').click(function(e){
    var $this = $(this),
        $btnGroup = $this.parents('.btn-group');

    $btnGroup.find('button').removeClass('active');
    $(this).addClass('active');
  });

  $('.redirect').click(function(e){
    e.preventDefault();
    setTabLocation(pageDetails.location.origin + $(this).attr('data-link'));
    window.close();
  });

  $('#lnk_clearClientLibs').click(function(e){
    e.preventDefault();
    var target = e.target;

    cachedEventPage.AemBackgroundScripts.executeScript('AemDeveloper.clearClientLibs()');
  });

  $('#lnk_clearCompiledJSPs').click(function(e){
    e.preventDefault();
    var target = e.target;

    cachedEventPage.AemBackgroundScripts.executeScript('AemDeveloper.clearCompiledJSPs()');
  });

  $('#lnk_runGarbageCollector').click(function(e){
    e.preventDefault();
    var target = e.target;

    cachedEventPage.AemBackgroundScripts.executeScript('AemDeveloper.runGarbageCollector()');
  });

  $('#lnk_digitalPulseDebugger').click(function(e){
    e.preventDefault();
    cachedEventPage.AemBackgroundScripts.executeScript('AemDeveloper.openDigitalPulseDebugger()');
    //window.close();
  });

  $('.js-new-window').click(function(e){
    e.preventDefault();

    var $this = $(e.target),
        $a = $this.prev(),
        url = $a.attr('data-link');

    openNewTab(pageDetails.location.origin + url);
  });

  $('#lnk_contentFinder').click(function(e){
    
    e.preventDefault();

    toggleContentFinder(pageDetails.location);

    window.close();
  });

  $('#lnk_classicUI').click(function(e){
    e.preventDefault();

    toggleUIs('classic', pageDetails.location);  

    window.close();
  });

  $('#lnk_touchUI').click(function(e){
    e.preventDefault();

    toggleUIs('touch', pageDetails.location);  

    window.close();
  });

  $('.querystring').click(function(e){
    e.preventDefault();

    var $this = $(this),
        key = $this.attr('data-querystring-key'),
        value = $this.attr('data-querystring-value') || null;

    setTabLocation(getUrlWithUpdatedQueryString(pageDetails.location, key, value));

    window.close();
  });

  $('#sudoables').change(function(){
    var location = getUrlWithUpdatedQueryString(pageDetails.location, 'sling.auth.redirect', pageDetails.location.pathname, true);
    location = getUrlWithUpdatedQueryString(location, 'sudo', this.value);

    setTabLocation(location);
    window.close();
  });

  $('#lnk_revertToSelf').click(function(){
    var location = getUrlWithUpdatedQueryString(pageDetails.location, 'sling.auth.redirect', pageDetails.location.pathname, true);
    location = getUrlWithUpdatedQueryString(location, 'sudo', '-');

    setTabLocation(location);
    window.close();
  });
});

/**
 * Update the query string of a URL while maintaining other params and the hash.
 *
 * If value is null the parameter is removed from the query string.
 * If value is empty string (''), the parameter is added to the query string
 * with no value.
 *
 * @param {location} location - The location
 * @param {string} key - The query string parameter to update.
 * @param {string} value - the query string parameter's value to update.
 * @param {boolean} returnLocationObject - return location pseudo-object instead of a string.
 * @returns {string} New URL with updated query string parameters.
 */
function getUrlWithUpdatedQueryString(location, key, value, returnLocationObject) {
  var origin = location.origin,
      hash = location.hash,                 // starts with #
      search = location.search,             // starts with ?
      pathname = location.pathname,         // starts with /
      queryParams = {},
      updatedSearchString,
      isFirstParam = true;

  if (search) {
    // returns object
    queryParams = getQueryParameters(search);
  }

  if (value !== null) {
    // overwrite or add key/value
    queryParams[key] = value;
  } else {
    delete queryParams[key];
  }

  if (Object.keys(queryParams).length === 0) {
    updatedSearchString = '';
  } else {
    // loop through object and create string
    for (var prop in queryParams) {
      if (queryParams.hasOwnProperty(prop)) {
        if (isFirstParam) {
          updatedSearchString = '?';
          isFirstParam = false;
        } else {
          updatedSearchString += '&';
        }

        updatedSearchString += prop;

        if (queryParams[prop]) {
          updatedSearchString += '=' + queryParams[prop];
        }
      }
    }
  }

  if (returnLocationObject) {
    return {
      origin : origin,
      hash : hash,
      search : updatedSearchString,
      pathname : pathname,
      href : origin + pathname + updatedSearchString + hash
    };
  } else {
    return origin + pathname + updatedSearchString + hash;
  }
}

/**
 * Add status css class to target.
 *
 * @param {Object} Link that was clicked
 * @Param {Object} Response message
 */
function showStatus(target, response) {
  var color,
      $container = $(target).parents('li');

  $container.addClass(response);
  setTimeout(function(){
    $container.removeClass(response);
  },1500);
}

/**
 * Update the browser's location
 *
 * @param {string} url - The location the browser should navigate to.
 */
function setTabLocation(url) {
  chrome.tabs.update(null, {url: url});
}

/**
 * Open a new browser tab.
 *
 * @param {string} url - The location the browser should navigate to in the new tab.
 */
function openNewTab(url) {
  chrome.tabs.create({url: url});
}

/**
 * isEmpty added to global String object.
 *
 * @returns {boolean} If String object is not "" or " ".
 */
String.prototype.isEmpty = function() {
  return (this.length === 0 || !this.trim());
};

/**
 * Remove trailing slash
 *
 * @param {String} url String to remove trailing slash.
 * @returns {String} url without trailing slash.
 */
function removeTrailingSlash(url) {
  if (url && url[url.length - 1] === '/') {
    url = url.substr(0, url.length - 1);
  }

  return url;
}

function convertSlingArrayToObject(slingArray) {
  var slingObject = {},
      tmp,
      x;

  for (x = 0; x < slingArray.length; x++) {
    tmp = slingArray[x].split(' = ');
    slingObject[tmp[0]] = tmp[1];
  }

  return slingObject;
}


var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-56261124-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


/**
 * Create a pseudo location object fixing problems when the Location object
 * contains an AEM URL with '/cf#/', '/siteadmin#/', etc...
 *
 * @param {location} location - the location object to read from.
 * @returns {Object} A pseudo location object.
 */
function normalizeLocation(location) {
  var hashedUrls = ['cf', 'siteadmin', 'useradmin', 'publishingadmin', 'damadmin', 'miscadmin', 'mcmadmin'],
      containsHash = false,
      origin = location.origin,
      search,
      pathname,
      hash,
      tempLocation,
      hashIndex;

  for (hashIndex = 0; hashIndex < hashedUrls.length; hashIndex++) {
    if (location.href.indexOf('/' + hashedUrls[hashIndex] + '#') !== -1) {
      containsHash = true;
      break;
    }
  }

  if (containsHash) {
    tempLocation = document.createElement('a');
    tempLocation.href = location.href.split('/' + hashedUrls[hashIndex] + '#').join('');

    pathname = '/' + hashedUrls[hashIndex] + '#' + tempLocation.pathname;
    hash = tempLocation.hash;
    search = tempLocation.search;
  } else {
    pathname = location.pathname;
    hash = location.hash;
    search = location.search;
  }

  return {
    href : origin + pathname + search + hash,
    origin : origin,
    search : search,
    pathname : pathname,
    hash : hash,
    port: location.port,
    host: location.host,
    hostname: location.hostname,
    protocol: location.protocol
  }
}

/**
 * Toggle between classic and touch UIs.
 *
 * TODO: Change everything. Just getting something to demo.
 *
 * @param {string} changeTo - 'classic' or 'touch'
 * @param {location} location - the location object to read from.
 */
function toggleUIs(changeTo, location) {
  var newPathName = location.href;

  //remove Content Finder first
  if (newPathName.indexOf('/cf#') === 0) {
    newPathName = newPathName.split('/cf#').join('');
  }

  if (changeTo === 'classic') {
    if (newPathName.indexOf('/sites.html') !== -1) {
      newPathName = newPathName.replace('/sites.html', '/siteadmin#');
    } else if (newPathName.indexOf('/publications.html') !== -1) {
      newPathName = newPathName.replace('/publications.html', '/publishingadmin#');
    } else if (newPathName.indexOf('/assets.html') !== -1) {
      newPathName = newPathName.replace('/assets.html', '/damadmin#');
    } else if (newPathName.indexOf('/editor.html') !== -1) {
      newPathName = newPathName.replace('/editor.html', '');
    }

    setTabLocation(newPathName);
  } else if (changeTo === 'touch') {
    if (newPathName.indexOf('/siteadmin#') !== -1) {
      newPathName = newPathName.replace('/siteadmin#', '/sites.html');
    } else if (newPathName.indexOf('/publishingadmin#') !== -1) {
      newPathName = newPathName.replace('/publishingadmin#', '/publications.html');
    } else if (newPathName.indexOf('/damadmin#') !== -1) {
      newPathName = newPathName.replace('/damadmin#', '/assets.html');
    } else {
      newPathName = location.origin + '/editor.html' + location.hash.replace('#', '');
    }

    setTabLocation(newPathName);
  }
}

/**
 * Toggle Content Finder
 *
 * @param {location} location - the location object to read from.
 */
function toggleContentFinder(location) {
  if (location.href.indexOf('/editor.html/') !== -1) {
    setTabLocation(location.href.replace('/editor.html', '/cf#'));
  } else if (location.href.indexOf('/cf#/') !== -1) {
    setTabLocation(location.href.replace('/cf#', ''));
  } else {
    setTabLocation(location.origin + '/cf#' + location.pathname + location.search + location.hash);
  }
}