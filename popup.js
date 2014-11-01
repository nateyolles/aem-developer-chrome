/*
TODO: comment code
TODO: organize code
TODO: change jquery to angular
TODO: make links full size to list item
TODO: hover over on those links
TODO: touch/classic ui
TODO: organize debugger tools, query and clientlibs
TODO: redo show status timeout
*/

var app = angular.module('PopupApp', ['ngStorage']),
    MANIFEST_URL = 'https://raw.githubusercontent.com/nateyolles/aem-developer-chrome/master/manifest.json',
    EXTENSION_URL = 'https://chrome.google.com/webstore/detail/aem-developer/hgjhcngmldfpgpakbnffnbnmcmohfmfc',
    cachedEventPage,
    pageDetails;

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

  $scope.editMode = false;

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

  $scope.redirectToEnvironment = function(index, isNewWindow){
    var newOrigin = $scope.options.servers[index].url,
        newUrl;

    /** Remove trailing slash */
    if (newOrigin[newOrigin.length - 1] === '/') {
      newOrigin = newOrigin.substr(0, newOrigin.length - 1);
    }

    newUrl = newOrigin + pageDetails.location.pathname + pageDetails.location.search + pageDetails.location.hash;

    if (isNewWindow) {
      openNewTab(newUrl);
    } else {
      setTabLocation(newUrl);
    }
    window.close();
  };
});

window.addEventListener('load', function(evt) {
  chrome.runtime.getBackgroundPage(function(eventPage) {
    // Call the getPageInfo function in the event page, passing in 
    // our onPageDetailsReceived function as the callback. This injects 
    // content.js into the current tab's HTML
    eventPage.AemBackgroundScripts.getPageDetails(function(tab){
      tab.location = normalizeLocation(tab.location);
      pageDetails = tab;
    });
    cachedEventPage = eventPage;
  });

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

    cachedEventPage.AemBackgroundScripts.executeScript('AemDeveloper.clearClientLibs()', function(status){
      showStatus(target, status);
    });
  });

  $('#lnk_clearCompiledJSPs').click(function(e){
    e.preventDefault();
    var target = e.target;

    cachedEventPage.AemBackgroundScripts.executeScript('AemDeveloper.clearCompiledJSPs()', function(status){
      showStatus(target, status);
    });
  });

  $('#lnk_digitalPulseDebugger').click(function(e){
    e.preventDefault();
    cachedEventPage.AemBackgroundScripts.executeScript('AemDeveloper.openDigitalPulseDebugger()', function(a){ $('#status').text(JSON.stringify(a));});
    //window.close();
  });

  $('#lnk_clientContextWindow').click(function(e){
    e.preventDefault();
    cachedEventPage.AemBackgroundScripts.executeScript('AemDeveloper.openClientContextWindow()', function(a){ $('#status').text(JSON.stringify(a));});
  });

  $('.icon-new-window').click(function(e){
    e.preventDefault();

    var $this = $(e.target),
        $a = $this.prev(),
        url = $a.attr('data-link');

    openNewTab(pageDetails.location.origin + url);
  });

  $('#lnk_siteAdminToggle').click(function(e){
    e.preventDefault();

    if (pageDetails.location.href.indexOf('/cf#/') !== -1) {
      setTabLocation(pageDetails.location.href.split('/cf#').join(''));
    } else {
      setTabLocation(pageDetails.location.origin + '/cf#' + pageDetails.location.pathname + pageDetails.location.search + pageDetails.location.hash);
    }

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
});

/**
 * Create a psudo location object fixing browser problems when the Location object
 * contains '/cf#/'.
 *
 * @param {location} location - the location object to read from.
 * @returns {Object} A psudo location object.
 */
function normalizeLocation(location) {
  var origin = location.origin,
      search,
      pathname,
      hash,
      tempLocation;

  if (location.href.indexOf('/cf#/') === -1) {
    pathname = location.pathname;
    hash = location.hash;
    search = location.search;
  } else {
    tempLocation = document.createElement('a');
    tempLocation.href = location.href.split('/cf#').join('');

    pathname = '/cf#' + tempLocation.pathname;
    hash = tempLocation.hash;
    search = tempLocation.search;
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
 * Update the query string of a URL while maintaining other params and the hash.
 *
 * If value is null the parameter is removed from the query string.
 * If value is empty string (''), the parameter is added to the query string
 * with no value.
 *
 * @param {location} location - The location
 * @param {string} key - The query string parameter to update.
 * @param {string} value - the query string parameter's value to update.
 * @returns {string} New URL with updated query string parameters.
 */
function getUrlWithUpdatedQueryString(location, key, value) {
  var origin = location.origin,
      hash = location.hash,                 // starts with #
      search = location.search,             // starts with ?
      pathname = location.pathname,         // starts with /
      queryParams = {},
      updatedSearchString,
      isFirstParam = true;

  if (search) {
    queryParams = getQueryParameters(search);     // returns object
  }

  if (value !== null) {
    queryParams[key] = value;               // overwrite or add key/value
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

  return origin + pathname + updatedSearchString + hash;
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

  $container.addClass(response.status);
  setTimeout(function(){
    $container.removeClass(response.status);
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

     // (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          // (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
          // m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
          // })(window,document,'script','https://ssl.google-analytics.com/ga.js','ga');

          // ga('create', 'UA-56261124-1', 'auto');
          // ga('send', 'pageview');

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-56261124-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();