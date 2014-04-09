module.exports = function(grunt) {

    // Задачи
    grunt.initConfig({
        connect: {
            test: {
                options: {
                    port: 8001,
                    base: '.',
                    hostname: 'localhost'
                }
            }
        },
        coffee: {
            compile: {
                files: {
                    'js/index.js': 'coffee/index.coffee',
                }
            }
        },
        watch: {
            js: {
                files: ['coffee/index.coffee'],
                tasks: ['coffee'],
            },
        },
        browserSync: {
            dev: {
                bsFiles: {
                    src : 'js/index.js'
                },
                options: {
                    server: {
                        baseDir: "."
                    }, 
                    watchTask: true,
                }
            }
        },
    });

    // Загрузка плагинов, установленных с помощью npm install
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-browser-sync');

    // Задача по умолчанию
    grunt.registerTask('default', ['browserSync', 'watch']);
};