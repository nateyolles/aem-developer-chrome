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
  

  // var data = {"authorizables":[{"id":"aaron.mcdonald@mailinator.com","name":"Aaron McDonald","name_xss":"Aaron McDonald"},{"id":"andrew.schaeffer@trashymail.com","name":"Andrew Schaeffer","name_xss":"Andrew Schaeffer"},{"id":"anonymous","name":"anonymous","name_xss":"anonymous"},{"id":"aparker@geometrixx.info","name":"Alison Parker","name_xss":"Alison Parker"},{"id":"ashley.thompson@spambob.com","name":"Ashley Thompson","name_xss":"Ashley Thompson"},{"id":"author","name":"author","name_xss":"author"},{"id":"boyd.larsen@dodgit.com","name":"Boyd Larsen","name_xss":"Boyd Larsen"},{"id":"carl.eastham@geometrixx-media.com","name":"Carl Eastham","name_xss":"Carl Eastham"},{"id":"carlene.j.avery@mailinator.com","name":"Carlene Avery","name_xss":"Carlene Avery"},{"id":"charles.s.johnson@trashymail.com","name":"Charles Johnson","name_xss":"Charles Johnson"},{"id":"charlotte.capp@geometrixx-media.com","name":"Charlotte Capp","name_xss":"Charlotte Capp"},{"id":"donna.billups@pookmail.com","name":"Donna Billups","name_xss":"Donna Billups"},{"id":"dtm-deploy-hook-user","name":"dtm-deploy-hook-user","name_xss":"dtm-deploy-hook-user"},{"id":"emily.andrews@mailinator.com","name":"Emily Andrews","name_xss":"Emily Andrews"},{"id":"felicia.carter@trashymail.com","name":"Felicia Carter","name_xss":"Felicia Carter"},{"id":"formsadmin","name":"formsadmin","name_xss":"formsadmin"},{"id":"fpadmin","name":"fpadmin","name_xss":"fpadmin"},{"id":"harold.w.gavin@spambob.com","name":"Harold Gavin","name_xss":"Harold Gavin"},{"id":"iris.r.mccoy@mailinator.com","name":"Iris Mccoy","name_xss":"Iris Mccoy"},{"id":"ivan.l.parrino@mailinator.com","name":"Ivan Parrino","name_xss":"Ivan Parrino"},{"id":"james.devore@spambob.com","name":"James Devore","name_xss":"James Devore"},{"id":"jason.werner@dodgit.com","name":"Jason Werner","name_xss":"Jason Werner"},{"id":"jdoe@geometrixx.info","name":"John Doe","name_xss":"John Doe"},{"id":"joel.czuba@geometrixx-media.com","name":"Joel Czuba","name_xss":"Joel Czuba"},{"id":"josh.bradley@pookmail.com","name":"Josh Bradley","name_xss":"Josh Bradley"},{"id":"keith.m.mabry@spambob.com","name":"Keith Mabry","name_xss":"Keith Mabry"},{"id":"kelly.creative@geometrixx.info","name":"Kelly Creative","name_xss":"Kelly Creative"},{"id":"kerri.g.saner@dodgit.com","name":"Kerri Saner","name_xss":"Kerri Saner"},{"id":"larry.a.spiller@pookmail.com","name":"Larry Spiller","name_xss":"Larry Spiller"},{"id":"laura.j.richardson@pookmail.com","name":"Laura Richardson","name_xss":"Laura Richardson"},{"id":"leonard.a.duncan@mailinator.com","name":"Leonard Duncan","name_xss":"Leonard Duncan"},{"id":"leslie.d.dufault@trashymail.com","name":"Leslie Dufault","name_xss":"Leslie Dufault"},{"id":"luz.a.smith@dodgit.com","name":"Luz Smith","name_xss":"Luz Smith"},{"id":"marcy.aja@geometrixx-media.com","name":"Marcy Aja","name_xss":"Marcy Aja"},{"id":"mathew.echavez@geometrixx-media.com","name":"Mathew Echavez","name_xss":"Mathew Echavez"},{"id":"matt.monroe@mailinator.com","name":"Matt Monroe","name_xss":"Matt Monroe"},{"id":"oauthservice","name":"oauthservice","name_xss":"oauthservice"},{"id":"ocs-lifecycle","name":"ocs-lifecycle","name_xss":"ocs-lifecycle"},{"id":"olive.d.pixley@spambob.com","name":"Olive Pixley","name_xss":"Olive Pixley"},{"id":"omar.b.kamp@dodgit.com","name":"Omar Kamp","name_xss":"Omar Kamp"},{"id":"perry.eastman@geometrixx-media.com","name":"Perry Eastman","name_xss":"Perry Eastman"},{"id":"ralph.e.johnson@mailinator.com","name":"Ralph Johnson","name_xss":"Ralph Johnson"},{"id":"rebekah.larsen@trashymail.com","name":"Rebekah Larsen","name_xss":"Rebekah Larsen"},{"id":"replication-receiver","name":"replication-receiver","name_xss":"replication-receiver"},{"id":"ryan.palmer@spambob.com","name":"Ryan Palmer","name_xss":"Ryan Palmer"},{"id":"scott.b.reynolds@dodgit.com","name":"Scott Reynolds","name_xss":"Scott Reynolds"},{"id":"sean.smith@geometrixxoutdoors.com","name":"Sean Smith","name_xss":"Sean Smith"},{"id":"shantel.j.jones@pookmail.com","name":"Shantel Jones","name_xss":"Shantel Jones"},{"id":"suggestionservice","name":"suggestionservice","name_xss":"suggestionservice"},{"id":"trina.dombrowski@geometrixx-media.com","name":"Trina Dombrowski","name_xss":"Trina Dombrowski"},{"id":"virginia.l.armstrong@spambob.com","name":"Virginia Armstrong","name_xss":"Virginia Armstrong"},{"id":"wallace.escott@geometrixx-media.com","name":"Wallace Escott","name_xss":"Wallace Escott"},{"id":"weston.mccall@dodgit.com","name":"Weston McCall","name_xss":"Weston McCall"},{"id":"willard.ebbing@geometrixx-media.com","name":"Willard Ebbing","name_xss":"Willard Ebbing"},{"id":"william.a.plunkett@mailinator.com","name":"William Plunkett","name_xss":"William Plunkett"},{"id":"willie.a.melton@dodgit.com","name":"Willie Melton","name_xss":"Willie Melton"},{"id":"yolanda.s.huggins@trashymail.com","name":"Yolanda Huggins","name_xss":"Yolanda Huggins"},{"id":"yolles","name":"yolles","name_xss":"yolles"},{"id":"zachary.w.mitchell@spambob.com","name":"Zachary Mitchell","name_xss":"Zachary Mitchell"}],"total":59};

  // for (var x = 0; x < data.authorizables.length; x++) {
  //   $scope.sudoables.push(data.authorizables[x].id);
  // }


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
            showStatus($('#lnk_runGarbageCollector'), tab.status);
            break;
          case 'sudoables':
            $scope.$apply(function(){
              for (var x = 0; x < tab.data.authorizables.length; x++) {
                $scope.sudoables.push(tab.data.authorizables[x].id);
              }  
            });
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
      x;

  for (x = 0; x < hashedUrls.length; x++) {
    if (location.href.indexOf('/' + hashedUrls[x] + '#/') !== -1) {
      containsHash = true;
      break;
    }
  }

  if (containsHash) {
    tempLocation = document.createElement('a');
    tempLocation.href = location.href.split('/cf#').join('');

    pathname = '/cf#' + tempLocation.pathname;
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

function toggleUIs(location) {
  var uiMap = [
    {'classic' : '/siteadmin#', 'touch' : '/sites.html'},
    {'classic' : '/publishingadmin#', 'touch' : '/publications.html'},
    {'classic' : '/damadmin#', 'touch' : '/assets.html'},
    {'classic' : '', 'touch' : '/editor.html'},
    {'classic' : '/libs/cq/core/content/welcome.html', 'touch' : '/projects.html'}
  ];

  for (var x = 0; x < uiMap.length; x++) {
    if (location.pathname.indexOf(uiMap[x].classic) === 1) {
      // classic found
    } else if (location.pathname.indexOf(uiMap[x].touch) === 1) {
      // touch found
    }
  }


}

/*
Projects    /projects.html      = /libs/cq/core/content/welcome.html
      http://localhost:4502/projects/details.html/content/projects/20141016/outdoors

Sites   /sites.html/content   = /siteadmin
      http://localhost:4502/sites.html/content/geometrixx-outdoors
      http://localhost:4502/siteadmin#/content/geometrixx-outdoors

publications
      http://localhost:4502/aem/publications.html/content/publications
      http://localhost:4502/publishingadmin#/content/publications

DAM
      http://localhost:4502/assets.html/content/dam/geometrixx
      http://localhost:4502/damadmin#/content/dam/geometrixx


view page in touch ui
  /editor.html/content/blah 

view page in classic
  /content/blah

  */