#!/usr/bin/env node

var sys = require('sys'),
    fs = require('fs'),
    Mustache = require('mustache'),
    YUI = require('yui3').YUI,
    mkdirp = require('mkdirp').mkdirp;

    var templatePath = "./templates/";
    var buildTemplates = ['build.xml','build.properties','build.json'];
    var jsTemplates = ['module.js'];

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

    var data = { title: ""};
    
    var usage = [
        "usage: ",
        "yuicreate [options] modulename",
        "",
        "options:",
        " -h, --help              Display this help message",
        "",
        " -e, --extend <a>        Extend a (default Y.Widget)",
        "",
        " -r, --requires <a,b,c>  This module requires a,b,c (default base)",
        "",
        " --skinnable             Create CSS files for this module",
        "",
        " --skip-register         Tell build files not to insert module registration (for config modules)",
        "",
        " --use <a,b,c>           Use modules a,b,c",
        "",
        " --optional <a,b,c>      Optional use modules a,b,c",
        "",
        " --supercedes a          Supercedes module a",
        "",
        " --after  <a,b>          Load this module after a,b",
        ""
    ].join('\n');
    
    var arg,
        argv = process.argv.slice(2),
        options = {
            requires: ['base'],
            extend: 'Y.Widget',
            skinnable: false,
            use: null,
            classname: '',
            supercedes: null,
            optional: null,
            after: null,
            skipRegister: false
        };
    
    while (arg = argv.shift()) {
        if (arg === __filename) { continue; }
    
        switch(arg) {
            case '-h':
            case '--help':
                 console.log(usage);
                 process.exit(1);
                 break;
      
            case '-r':
            case '--requires': 
               options.requires = options.requires.concat(argv.shift().split(','));
               break;
    
            case '--use': 
                options.use = argv.shift().split(',');
                break;
      
            case '--supercedes': 
                options.supercedes = argv.shift();
                break;

            case '--optional': 
                options.optional = argv.shift().split(',');
                break;

            case '--after': 
                options.after = argv.shift().split(',');
                break;
      
            case '--skinnable': 
                options.skinnable = true
                break;

            case '--skip-register':
                options.skipRegister = true
                break;
       
            case '-e':
            case '--extend': 
               options.extend = argv.shift();
               break;
     
             default:
                options.modulename = arg;
        }
    }

    if (!options.modulename) {
        console.log(usage);
        process.exit(1);
    }
    
    options.requires = Y.Array.dedupe(options.requires);
    if (Y.Lang.isArray(options.use)) {
        Y.Array.dedupe(options.use);
    }
    
    function processClassName(name) {
        var stuff = name.split(/\W/), i = 0, str;
        for (i; i < stuff.length; i += 1) {
            str = stuff[i];
            stuff[i] = str.substr(0,1).toUpperCase() + str.substr(1);
        }
        if (stuff.length > 1) {
          options.classname = 'namespace("' + stuff.slice(0, -1).join('.') + '").';
        } 
        options.classname += stuff.slice(-1);
    }
    
    processClassName(options.modulename);
    
    function applyTemplate(template) {
        return result = Mustache.to_html(template, options);
    }
    
    function createFile(path, code, encoding, callback) {
        callback = Y.Lang.isFunction(callback) ? callback : function(err) {
            if (err) {
                throw err;
            } else {
                Y.log("Created: " + path);
            }
        }
        fs.writeFile(path, code, encoding, callback);
    }

    function writeTemplate(err, t, path) {
        if (err) {
            throw err;
        }
        if (t) {
            createFile(path, applyTemplate(t), 'utf8');
        }
    }

    function getTemplate(template, callback) {
        fs.readFile(templatePath + template, 'utf8', callback);	
    }
   
    function main() {
        mkdirp(options.modulename, 0755, function (err) {
            if (err) {
                console.error(err);
            } else {
                Y.each(buildTemplates, function (t) {
                      getTemplate(t, function (err, template) {
                          var path = options.modulename + '/' + t;
                          if (path.match(/json/)) {
                              options.requires = Y.JSON.stringify(options.requires);
                              options.use = Y.JSON.stringify(options.use);
                              options.supercedes = Y.JSON.stringify(options.supercedes);
                              options.optional = Y.JSON.stringify(options.optional);
                              options.after = Y.JSON.stringify(options.after);
                          }
                          writeTemplate(err, template, path);
                      });
                });
            }
        });
        mkdirp(options.modulename + '/js/', 0755, function (err) {
            if (err) {
                console.error(err);
            } else {
                getTemplate('module.js', function (err, template) {
                    var path = options.modulename + '/js/' + options.modulename + '.js';
                    writeTemplate(err, template, path);
                });
            }
        });
        if (options.skinnable) {
            mkdirp(options.modulename + '/assets/skins/sam/', 0755, function (err) {
                if (err) {
                    console.error(err);
                } else {
                    getTemplate('core.css', function (err, template) {
                        writeTemplate(err, template, options.modulename + '/assets/' + options.modulename + '-core.css');
                    });
                    getTemplate('skin.css', function (err, template) {
                        writeTemplate(err, template, options.modulename + '/assets/skins/sam/' + options.modulename + '-skin.css');
                    });
                }
            });
        }
    }
    
    main();

});
