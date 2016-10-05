module.exports = function(grunt){

  // Load grunt tasks automatically
  //require('load-grunt-tasks')(grunt);


  //Cargamos los paquetes de grunt
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-ng-constant');


  //Configuración
  grunt.initConfig({

    ngconstant: {
      options: {
        space: '  ',
        wrap: '"use strict";\n\n {%= __ngModule %}',
        name: 'config'
      },
      development: {
        options: {
          dest: '.tmp/scripts/config.js',
        },
        constants: {
          ENV: grunt.file.readJSON('config.json').development
        }
      },
      production: {
        options: {
          dest: '.tmp/scripts/config.js',
        },
        constants: {
          ENV: grunt.file.readJSON('config.json').production
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/{,*/}*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    watch: {
      html: {
        files: 'public/**'
      }
    },

    express: {                //Tarea automatica express
      all: {
        options: {
          livereload: true,   //Función utilizada para refrescar la página automáticamente cuando hacemos cambios en el código fuente.
          port: 8000,         //El puerto
          bases: ['public','.tmp'],  //El directorio raíz donde encontramos a index.html
          open: 'http://localhost:8000' //Host
        }
      }
    }
  });

  //Crear tareas
  grunt.registerTask('servidor', 'Compilar e iniciar el servidor', function(target) {
    if (target === 'dist') {
      return;
    }

    grunt.task.run([
      'clean:server',
      'ngconstant:development',
      'express', // 'servidor' es el nombre de la tarea seguido de la tarea a ejecutar, en este caso 'express'
      'watch'
    ]);
  });

};
