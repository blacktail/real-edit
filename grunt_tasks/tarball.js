'use strict';

module.exports = function (grunt) {
	grunt.task.registerMultiTask('tarball', 'generating tarball...', function () {
		grunt.log.writeln('generating tarball, please wait...');

		var done = this.async();
		var exec = require('child_process').exec
		var fileName = 'dist_' + new Date().getTime() + '.tar.gz';
		exec('tar -pcvzf ' + fileName + ' dist/', {
			cwd: '.',
			maxBuffer: 2000 * 1024
		}, function (error, stdout, stderr) {
			if (error !== null) {
				throw new Error(error);
			} else {
				grunt.log.writeln(fileName + ' created.');
			}

			done();
		});
	});
};
