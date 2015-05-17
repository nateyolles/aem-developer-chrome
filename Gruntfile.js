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
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('package', ['compress']);
};