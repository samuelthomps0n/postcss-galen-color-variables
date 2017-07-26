CSS/Sass Colors to Galen Variables
================================================================================
This plugin compiles Sass/CSSS Color variables and exports them to a Galen Test Suite configuration file containing all the colors defined so that they can be referenced in your testing.

## Installation
This package is built to run on its own, as you may want to just pull the colors out without actually compiling a CSS stylesheet from your CSS. To install run:

`npm install`

## How to use

There are a few variables that can be set when using this script. These are designed to offer the greatest flexibility for your project

```
var galenColors = require('postcss-galen-color-variables')
galenColors.convert([source], [destination], [label])
```

### - Source
The source is the relative location of your CSS file containing the variables you wish to convert to Galen color variables

### - Destination
The destination is the relative location where you like the gspec file to be written

### - Label
The label allows you to create a template for the variables using the `{key}` and `{type}` parameters. Key is the variable name and type is the color type, eg Hex, RGBA and RGB. An exmaple of a label would be:

```
color-{key}{type}
```

#### Input
```
// CSS Variables
:root {
    --cssColor: #242424;
}

// SASS-style variables
$sassColor: #242424;
```

#### Output

```
@set 
    colorCssColorRGB  rgb(36, 36, 36)
    colorCssColorRGBA  rgba(36, 36, 36, 1)
    colorCssColorHEX  #242424

    colorSassColorRGB  rgb(36, 36, 36)
    colorSassColorRGBA  rgba(36, 36, 36, 1)
    colorSassColorHEX  #242424

```