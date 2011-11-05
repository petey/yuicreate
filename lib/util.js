var Mustache = require('mustache'),
    fs = require('fs'), Utils,
    templatePath = './templates/',
    options;

Utils = function () {}

Utils.prototype.getUsage = function () {
  console.log('beep');
    return [
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
};

Utils.prototype.processArgs = function (argv) {

    var arg;
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
              console.log('baz');
                 console.log(this.getUsage());
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
    return options;
};

Utils.prototype.processClassName = function (name) {
    var stuff = name.split(/\W/), i = 0, str, classname = "";
    for (i; i < stuff.length; i += 1) {
        str = stuff[i];
        stuff[i] = str.substr(0,1).toUpperCase() + str.substr(1);
    }
    if (stuff.length > 1) {
      classname = 'namespace("' + stuff.slice(0, -1).join('.') + '").';
    } 
    classname += stuff.slice(-1);
    return classname;
};

Utils.prototype.applyTemplate = function (template) {
    return result = Mustache.to_html(template, options);
};

Utils.prototype.createFile = function (path, code, encoding, callback) {
    callback = callback ? callback : function(err) {
        if (err) {
            throw err;
        } else {
            console.log("Created: " + path);
        }
    }
    fs.writeFile(path, code, encoding, callback);
};

Utils.prototype.writeTemplate = function (err, t, path) {
    if (err) {
        throw err;
    }
    if (t) {
        this.createFile(path, this.applyTemplate(t), 'utf8');
    }
};

Utils.prototype.getTemplate = function (template, callback) {
    fs.readFile(templatePath + template, 'utf8', callback);	
}

exports.Utils = new Utils();