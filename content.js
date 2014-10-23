chrome.runtime.sendMessage({
  'title': document.title,
  'location': window.location
});

function clearClientLibs(){
  $.ajax({
    type: 'GET',
    cache: false,
    url: '/crx/de/query.jsp?type=xpath&stmt=/jcr:root/var/clientlibs/*&showResults=true', //get all folders under clientlibs
    success: function(data, status, jqXHR){
      if (data.results.length > 0) {
        for (var i = 0; i < data.results.length; i++) {
          $.ajax({
            type: 'DELETE',
            url: data.results[i].path,
            success: function(data, status, jqXHR){
              alert('clientlibs cache cleared');
            },
            error: function(jqXHR, status, error) {
              alert('failed');
            }
          });
        }
      } else {
        alert('clientlib cache already cleared');
      }
    },
    error: function(jqXHR, status, error) {
      alert('failed');
    }
  });

}

function clearCompiledJSPs(){

  $.ajax({
    type: 'GET',
    cache: false,
    url: '/crx/de/query.jsp?type=xpath&stmt=/jcr:root/var/classes//jsp&showResults=true', //get all folders under any jsp folder under classes
    success: function(data, status, jqXHR){
      if (data.results.length > 0) {
        for (var i = 0; i < data.results.length; i++) {
          $.ajax({
            type: 'DELETE',
            url: data.results[i].path,
            success: function(data, status, jqXHR){
              alert('JSP cache cleared');
            },
            error: function(jqXHR, status, error) {
              alert('failed');
            }
          });
        }
      } else {
        alert('JSP cache already cleared');
      }
    },
    error: function(jqXHR, status, error) {
      alert('failed');
    }
  });

}

function openDigitalPulseDebugger() {
  window.open("","dp_debugger","width=700,height=1000,location=0,menubar=0,status=1,toolbar=0,resizable=1,scrollbars=1").document.write("<script language=\"JavaScript\" id=dbg src=\"https://www.adobetag.com/d1/digitalpulsedebugger/live/DPD.js\"></"+"script>");
}