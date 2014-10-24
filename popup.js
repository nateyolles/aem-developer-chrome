/*
 *  getQueryParameters.js
 *  Copyright (c) 2014 Nicholas Ortenzio
 *  The MIT License (MIT)
 */
window.getQueryParameters = function(str) {
  return (str || document.location.search).replace(/(^\?)/,'').split("&").map(function(n){return n=n.split("="),this[n[0]]=n[1],this;}.bind({}))[0];
};

// This callback function is called when the content script has been 
// injected and returned its results
var cachedEventPage,
    pageDetails,
    extensionVersion = chrome.app.getDetails().version;

// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
    // Get the event page
    chrome.runtime.getBackgroundPage(function(eventPage) {
        // Call the getPageInfo function in the event page, passing in 
        // our onPageDetailsReceived function as the callback. This injects 
        // content.js into the current tab's HTML
        eventPage.getPageDetails(function(tab){
          tab.location = normalizeLocation(tab.location);
          pageDetails = tab;
        });
        cachedEventPage = eventPage;
    });

    $('a.redirect').click(function(e){
      e.preventDefault();
      setTabLocation(pageDetails.location.origin + $(this).attr('data-link'));
      window.close();
    });

    $('#lnk_clearClientLibs').click(function(e){
      e.preventDefault();
      //cachedEventPage.clearClientLibs();
      cachedEventPage.executeScript('AemDeveloper.clearClientLibs()');
      window.close();
    });

    $('#lnk_clearCompiledJSPs').click(function(e){
      e.preventDefault();
      //cachedEventPage.clearCompiledJSPs();
      cachedEventPage.executeScript('AemDeveloper.clearCompiledJSPs()');
      window.close();
    });

    $('#lnk_digitalPulseDebugger').click(function(e){
      e.preventDefault();
      cachedEventPage.openDigitalPulseDebugger();
      window.close();
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

    $('#version').text(extensionVersion);

    // check if version is up to date
    $.ajax({
      type: 'GET',
      dataType: 'json',
      cache: false,
      url: 'https://raw.githubusercontent.com/nyolles/aem-developer-chrome/master/manifest.json',
      success: function(data, status, jqXHR){
        if (data && data.version && data.version > extensionVersion) {
          $('#update-container').show();
        }
      }
    });

});

function setTabLocation(url) {
  chrome.tabs.update(null, {url: url});
}