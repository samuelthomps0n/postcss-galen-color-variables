const fs                = require("fs");
const Q                 = require('q');
const postcss           = require("postcss");
const variablesFunction = require('postcss-simple-vars');
const colorFunction     = require("postcss-color-function");
const lineReader        = require("readline");
const colorParser       = require('parse-color');

module.exports = {

	convert: function(source, destination, label) {
		let deferred     = Q.defer();
		let colorVars    = [];
		let colorVarsCss = '';

		checkArgsExist(source, destination, label);

		let sourceCssStream = lineReader.createInterface({
			input: fs.createReadStream(source)
		})
		let sourceCss = fs.readFileSync(source);


		sourceCssStream.on('line', function(line) {
			let currentLine = line.split(' ');
			if(currentLine[0].startsWith("--")) {
				colorVars[currentLine[0].slice(0, -1).substring(1)] = currentLine[0].slice(0, -1);
				colorVarsCss += currentLine[0].substring(1) + ' ' + currentLine[0].slice(0, -1) + ";\n";
			}
            
		});

		sourceCssStream.on('close', function() {
			let compiledCss = compilePostCSS(sourceCss + colorVarsCss);
			let colorsArray = extractColours(compiledCss);

			writeGspecFile(colorsArray).then(function() {
				deferred.resolve(destination);
			});
			
		});

		return deferred.promise;

		function writeGspecFile(colorsArray) {
			let deferred = Q.defer();
			let gspec  = fs.createWriteStream(destination);

			gspec.once('open', function(fd) {
				gspec.write('@set \n');
				Object.keys(colorsArray).forEach(function (key) {
				   gspec.write('    ' + outputVariableNames(key, 'RGB') + '  rgb(' + colorParser(colorsArray[key]).rgb.join(', ') + ')' + '\n');
				   gspec.write('    ' + outputVariableNames(key, 'RGBA') + '  rgba(' + colorParser(colorsArray[key]).rgba.join(', ') + ')' + '\n');
				   gspec.write('    ' + outputVariableNames(key, 'HEX') + '  ' + colorParser(colorsArray[key]).hex + '\n\n');
				});
				gspec.end();
			});
			gspec.on('close', function() {
				deferred.resolve();
			});
			return deferred.promise;
		}

		function compilePostCSS(css) {
			let output = postcss()
			.use(variablesFunction())
			.use(colorFunction())
			.process(css)
			.css;

			return output;
		}

		function extractColours(css) {
			let result = [];
			let stringCss = css.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/+/g, '')
							.replace(/^\s*[\r\n]/gm, '')
							.replace(/;/g, "")
							.replace(/: /g, "=")
							.replace(/(?:\r\n|\r|\n)/g, '|');

			stringCss.split('|').forEach(function(x) {
				let array = x.split('=');
				if(array[1]) {
					result[array[0]] = array[1];
				};
			});
			return result;
		}


		function toCamelCase(string) {
			return string.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); }).replace(/-/g, "");
		}

		function outputVariableNames(key, type) {
			if(label) {
				return toCamelCase(label.replace('{key}', key.trim())).replace('{type}', type);
			}
			return toCamelCase(key.trim()) + type;
		}

		function checkArgsExist(source, destination, label) {
			if(!source || !destination || !label) {
				let error = '';
				if(!source) {
					error += 'ERR: Missing source file';
				}
				if(!destination) {
					error += 'ERR: Missing output destination';
				}
				if(!label) {
					error += 'ERR: Missing label template';
				}
				deferred.reject(error);
			}
		}
	}

}