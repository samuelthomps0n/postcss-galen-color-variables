PostCSS Colors to Galen Variables
================================================================================
This plugin compiles PostCSS Color variables and exports them to a Galen Test Suite configuration file containing all the colors defined so that they can be referenced in your testing.

## Installation
This package is built to run on its own, as you may want to just pull the colors out without actually compiling a CSS stylesheet from your PostCSS. To install run:

`npm install`

## How to use

There are a few variables that can be set from the comment line when running this script. These are designed to offer the greatest flexibility for your project

`node postcss-galen-variables [source] [destination] [label]`

### Source
The source is the relative location of your PostCSS file containing the variables you wish to convert to Galen color variables

### Destination
The destination is the relative location where you like the gspec file to be written

### Label
The label allows you to create a template for the variables using the `{key}` and `{type}` parameters. Key is the variable name and type is the color type, eg Hex, RGBA and RGB. An exmaple of a label would be:

```
color-{key}{type}
```

 which would output Galen variables similar to:

```
colorTheVariableNameRGB
colorTheVariableNameRGBA
colorTheVariableNameHEX
```