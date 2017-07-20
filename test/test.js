const should = require('should'),
    fs = require('fs'),
    path = require('path'),
    plugin = require('../');


let jsTest = function (fixture, options, done) {
    "use strict";

    let expected = path.join(__dirname, 'fixtures', fixture + '.expected.gspec')
    let source = path.join(__dirname, 'fixtures', fixture + '.css')
    let destination = path.join(__dirname, 'fixtures', fixture + '.gspec')

    let expectedOutput = fs.readFileSync(expected, 'utf8');

    plugin.convert(source, destination, 'color-{key}{type}').then(function(file) {

        let result = fs.readFileSync(destination, 'utf8')

        result.should.eql(expectedOutput);
        done();
    }).catch(function(err) {
        console.log(err);
    })
}

describe('postcss-galen-color-variables', function () {

    it('converts postcss variables to galen test suite syntax color variables', function (done) {
        jsTest('test', {}, done);
    });

});
