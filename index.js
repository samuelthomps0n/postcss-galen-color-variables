var fs                = require("fs");
var postcss           = require("postcss");
var variablesFunction = require('postcss-simple-vars');
var colorFunction     = require("postcss-color-function");
var lineReader        = require("readline");
var colorParser       = require('parse-color');

var args = process.argv.slice(2);

var colorVars    = [];
var colorVarsCss = '';

var sourceCssStream = lineReader.createInterface({
    input: fs.createReadStream(args[0]);
})
var sourceCss = fs.readFileSync(args[0]);

sourceCssStream.on('line', function(line) {
    var currentLine = line.split(' ');
    if(currentLine[0].startsWith("$")) {
        colorVars[currentLine[0].slice(0, -1).substring(1)] = currentLine[0].slice(0, -1);
        colorVarsCss += currentLine[0].substring(1) + ' ' + currentLine[0].slice(0, -1) + ";\n";
    }
});

sourceCssStream.on('close', function() {
    var compiledCss = compilePostCSS(sourceCss + colorVarsCss);
    var colorsArray = extractColours(compiledCss);

    writeGspecFile(colorsArray);
})

function writeGspecFile(colorsArray) {

    var gspec  = fs.createWriteStream(args[1]);

    gspec.once('open', function(fd) {
        gspec.write('@set \n');
        Object.keys(colorsArray).forEach(function (key) {
           gspec.write('    ' + outputVariableNames(key, 'RGB') + '  rgb(' + colorParser(colorsArray[key]).rgb + ')' + '\n');
           gspec.write('    ' + outputVariableNames(key, 'RGBA') + '  rgba(' + colorParser(colorsArray[key]).rgba + ')' + '\n');
           gspec.write('    ' + outputVariableNames(key, 'HEX') + '  ' + colorParser(colorsArray[key]).hex + '\n');
        });
        gspec.end();
    });

}

function compilePostCSS(css) {

    var output = postcss()
    .use(variablesFunction())
    .use(colorFunction())
    .process(css)
    .css;

    return output;

}

function extractColours(css) {

    var result = [];
    var stringCss = css.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/+/g, '')
                    .replace(/^\s*[\r\n]/gm, '')
                    .replace(/;/g, "")
                    .replace(/: /g, "=")
                    .replace(/(?:\r\n|\r|\n)/g, '|');

    stringCss.split('|').forEach(function(x) {
        var array = x.split('=');
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
    if(args[2]) {
        return toCamelCase(args[2].replace('{key}', key)).replace('{type}', type);
    }
    return toCamelCase(key) + type;
}
