Leaflet.Illustrate
==================

[![Build Status](https://travis-ci.org/manleyjster/Leaflet.Illustrate.svg?branch=master)](https://travis-ci.org/manleyjster/Leaflet.Illustrate)
[![Coverage Status](https://img.shields.io/coveralls/manleyjster/Leaflet.Illustrate.svg)](https://coveralls.io/r/manleyjster/Leaflet.Illustrate)
[![NPM Version](http://img.shields.io/npm/v/leaflet-illustrate.svg)](https://www.npmjs.org/package/leaflet-illustrate)

Rich annotation plugin (drawing, text, and more) for Leaflet extending Leaflet.draw.  Designed to help people tell the story behind the maps that they create.

Created for [MapKnitter](mapknitter.org), a free and open-source tool for stitching (or orthorectifying, in geographer-speak) grassroots aerial imagery into a composite "satellite" map.  This Leaflet plugin is designed to address the needs of the MapKnitter community, in particular, but is useful in any applications where rich map annotation is desired.

Learn more about MapKnitter at [http://publiclab.org/wiki/mapknitter](http://publiclab.org/wiki/mapknitter).

MapKnitter is open-source software created and run by the [Public Lab for Open Technology and Science](publiclab.org), and this project is sponsored by Google as part of [Google Summer of Code 2014](https://www.google-melange.com/gsoc/homepage/google/gsoc2014).

Check it out
------------

The latest demo is live at [Leaflet.Illustrate/examples/0.0.2/simple/](http://manleyjster.github.io/Leaflet.Illustrate/examples/0.0.2/simple/).  Give it a try!

Usage
-----

Leaflet.Illustrate defines two new types of annotations: [textboxes](https://github.com/manleyjster/Leaflet.Illustrate/wiki/L.Illustrate.Textbox), and pointers.

Users can create and edit textbox and pointer annotations using a Leaflet.draw-style toolbar.  Leaflet.Illustrate is built on top of Leaflet.draw, so it also easy to use Leaflet.Illustrate annotations alongside Leaflet.draw geometric annotations.

This plugin is documented more fully in the [wiki](https://github.com/manleyjster/Leaflet.Illustrate/wiki).

Contributing
-----
I will gladly accept contributions. Please follow the [Leaflet contribution guide](https://github.com/Leaflet/Leaflet/blob/master/CONTRIBUTING.md).

To set up, install [Node.js](http://nodejs.org/).  If you don't have it already, you'll also need the Grunt CLI: `npm install -g grunt-cli`.  Then, clone this repository and run `npm install` in the project root to install dependencies.

You can have Grunt watch the repository and continuously rebuild the project as you make changes by running `grunt` before you start working.  

Tests are run with the command `grunt test`.  Please ensure that your contributions pass all tests before you submit a pull request.

License
-----
Released under the MIT license.  [See the LICENSE](https://github.com/manleyjster/Leaflet.Illustrate/blob/master/LICENSE).