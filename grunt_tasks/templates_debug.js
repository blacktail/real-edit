'use strict';

module.exports = function (grunt) {
	grunt.registerMultiTask('templates_debug', 'auto generate handlebars templates for debug', function () {
		var options = this.options({
			base: 'scripts'
		});

		// generate partials.js
		this.files.forEach(function (f) {
			var partialDeps = [];
			partialDeps = partialDeps.concat(f.src.map(function (src, index) {
				return 'text!' + src.replace(options.base, '').replace(/^\//, '');
			}));

			var funcArgs = ['Handlebars'];
			var fileStr = '';

			var funcBody = options.partial ? [] : {};

			partialDeps.forEach(function (partial, index) {
				var pkgNameMatches = /text!(.*?)\/(?:partials|templates)/.exec(partial);
				var pkgName = pkgNameMatches ? (pkgNameMatches[1] || '') : '';
				var tplName = partial.replace(/.*(partials|templates)\//, '').replace(/\..*$/,'');
				tplName = 'main' == tplName ? pkgName : [pkgName, tplName].join('/');
				var argName = 'arg' + index;
				funcArgs.push(argName);

				if (options.partial) {
					funcBody.push('\tHandlebars.registerPartial("' + tplName + '", ' +  argName + ');');
				} else {
					funcBody[tplName] = 'Handlebars.compile(' + argName + ')';
				}
			});

			partialDeps.unshift('handlebars');

			if (options.partial) {
				fileStr = 'define(' + JSON.stringify(partialDeps) + ', function (' + funcArgs.join(',') + ') {\n' +
					funcBody.join('\n') + '\n});';
			} else {
				fileStr = 'define(' + JSON.stringify(partialDeps) + ', function (' + funcArgs.join(',') + ') {\n\treturn ' +
					JSON.stringify(funcBody, null, '\t\t').replace(/(:\s)"(.*)"/g, function (match, m1, m2, pos, orig) {
						return m1 + m2;
					}).slice(0, -1) + '\t};\n});';
			}

			grunt.file.write(f.dest, fileStr);

			// Print a success message.
			grunt.log.writeln('File "' + f.dest + '" created.');
		});
	});
};
