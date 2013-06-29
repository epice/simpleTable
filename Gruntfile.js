module.exports = function (grunt) {
	var pkg =  grunt.file.readJSON('package.json');
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		styleguide: {
			// npm install grunt-styleguide --save-dev
			// https://github.com/indieisaconcept/grunt-styleguide
			build: {
				options: {
				
				},
				files: {
					'styleguide': 'scss/*.scss'
				}
			}
		},

		sass: {
			build: {
				options: {
					// style: 'compressed'
					style: 'compact'
				},
				files: [{
					'src/css/style.css' : ['src/scss/style.scss']
				}]
			}
		},

		requirejs: {
			options: {
				baseUrl: "./",
				mainConfigFile: "sample/js/main.js"
			},
			build: {
				options: {
					name: 'sample/js/main.js',
					out: "build/app-min.js"
				}
			}
		},

		watch: {
			css: {
				files: ['src/scss/*.scss'],
				tasks: ['sass']
			}
		}
	});

	var taskName;
	for(taskName in pkg.devDependencies) {
		if(taskName.substring(0, 6) == 'grunt-') {
			grunt.loadNpmTasks(taskName);
		}
	}

	grunt.registerTask('default', ['watch']);
};
