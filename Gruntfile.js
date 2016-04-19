/*global module:false*/
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    conf: {
      name: 'aem-developer-chrome',
      dist: 'dist',
      src: 'src'
    },
    compress: {
      main: {
        options: {
          archive: '<%=conf.dist%>/<%=conf.name%>.zip'
        },
        files: [
          {
            src: ['<%=conf.src%>/**', '!<%=conf.src%>/**.map']
          }
        ]
      }
    }
  });

  grunt.registerTask('updatejson', function (key, value) {
    function update(file, version) {
      if (!grunt.file.exists(file)) {
        grunt.log.error('File ' + file + ' not found.');
        return false;
      }

      var json = grunt.file.readJSON(file);

      json['version'] = version;

      grunt.file.write(file, JSON.stringify(json, null, 2));
    }

    var version = grunt.option('project-version'); 

    if (!version) {
      grunt.log.error('Project version not set. i.e. "--project-version=0.5.5"');
      return false;
    }

    update('src/manifest.json', version);
    update('package.json', version);

    // var manifestFile = 'src/manifest.json';
    // var packageFile = 'package.json';
    // var version = grunt.option('project-version'); 

    // if (!grunt.file.exists(manifestFile)) {
    //   grunt.log.error('File ' + manifestFile + ' not found.');
    //   return false;
    // }

    // if (!version) {
    //   grunt.log.error('Project version not set. i.e. "--project-version=0.5.5"');
    //   return false;
    // }

    // var manifest = grunt.file.readJSON(manifestFile);
    // var package = grunt.file.readJSON(packageFile);

    // manifest['version'] = version;
    // package['version'] = version;

    // grunt.file.write(manifestFile, JSON.stringify(manifest, null, 2));
    // grunt.file.write(packageFile, JSON.stringify(package, null, 2));
  });

  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('package', ['updatejson', 'compress']);
};