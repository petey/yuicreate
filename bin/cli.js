#!/usr/bin/env node

var YUI = require('yui3').YUI,
    mkdirp = require('mkdirp').mkdirp,
    utils = require('../lib/util.js').Utils;

YUI({
    _logExclude: {
          'attribute': true,
          'base': true,
          'get': true,
          'loader': true,
          'yui': true,
          'widget': true,
          'event': true
    },
    filter: 'min',
    debug: false
}).use('json', function (Y) {

    var templatePath = "../templates/",
        buildTemplates = ['build.xml','build.properties','build.json'],
        options = utils.processArgs(process.argv.slice(2));

    if (!options.modulename) {
        console.log(utils.getUsage());
        process.exit(1);
    }

    options.requires = Y.Array.dedupe(options.requires);
    options.classname = utils.processClassName(options.modulename);

    (function main() {
        mkdirp(options.modulename, 0755, function (err) {
            if (err) {
                console.error(err);
            } else {
              Y.log('test');
                Y.each(buildTemplates, function (t) {
                  Y.log('test');
                      utils.getTemplate(t, function (err, template) {
                          var path = options.modulename + '/' + t;
                          if (path.match(/json/)) {
                              options.requires = Y.JSON.stringify(options.requires);
                              options.use = Y.JSON.stringify(options.use);
                              options.supercedes = Y.JSON.stringify(options.supercedes);
                              options.optional = Y.JSON.stringify(options.optional);
                              options.after = Y.JSON.stringify(options.after);
                          }
                          utils.writeTemplate(err, template, path);
                      });
                });
            }
        });
        mkdirp(options.modulename + '/js/', 0755, function (err) {
            if (err) {
                console.error(err);
            } else {
                utils.getTemplate('module.js', function (err, template) {
                    var path = options.modulename + '/js/' + options.modulename + '.js';
                    utils.writeTemplate(err, template, path);
                });
            }
        });
        if (options.skinnable) {
            mkdirp(options.modulename + '/assets/skins/sam/', 0755, function (err) {
                if (err) {
                    console.error(err);
                } else {
                    utils.getTemplate('core.css', function (err, template) {
                        utils.writeTemplate(err, template, options.modulename + '/assets/' + options.modulename + '-core.css');
                    });
                    utils.getTemplate('skin.css', function (err, template) {
                        utils.writeTemplate(err, template, options.modulename + '/assets/skins/sam/' + options.modulename + '-skin.css');
                    });
                }
            });
        }
    }());

});
