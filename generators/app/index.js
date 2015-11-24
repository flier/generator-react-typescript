'use strict';
let path = require('path');
let fs = require('fs');
let child_process = require('child_process');
let _ = require('underscore');
let generators = require('yeoman-generator');
let config = require('./config.json');

module.exports = generators.Base.extend({
    constructor: function() {
        generators.Base.apply(this, arguments);

        this.option('skip-welcome-message', {
            desc: 'Skip the welcome message',
            type: Boolean,
            defaults: false
        });
        this.option('skip-install');

        this.config.save();
    },

    initializing: function() {
        if(!this.options['skip-welcome-message']) {
            this.log(require('yeoman-welcome'));
        }
    },

    prompting: function() {
        let done = this.async();

        this.prompt(require('./prompts'), (answers) => {
            this.appName = answers.appName;
            this.style = answers.style;

            this.config.set('appName', this.appName);
            this.config.set('appPath', this.appPath);
            this.config.set('style', this.style);
            this.config.save();

            done();
        })
    },

    configuring: function() {
        this.context = {
            name: this.appName,
            author: {
                name: child_process.execSync('git config user.name').toString().trim(),
                email: child_process.execSync('git config user.email').toString().trim()
            },
            devDependencies: {}
        }
    },

    _generatePackage: function() {
        for (let pkg of config.style.choices[this.style].packages) {
            this.context.devDependencies[pkg.name] = pkg.version;
        }

        let settings = _.extend(this.fs.readJSON(this.templatePath('package.json')), this.context);

        this.fs.writeJSON(this.destinationPath('package.json'), settings);
    },

    _generateBower: function() {
        this.fs.copyTpl(this.templatePath('bower.json'), this.destinationPath('bower.json'), this.context);
    },

    writing: function() {
        this._generatePackage();
        this._generateBower();

        fs.readdir(this.sourceRoot(), (err, names) => {
            for(let name of names) {
                if (config.excludeFiles.indexOf(name) !== -1) {
                    continue;
                }

                if (fs.lstatSync(path.join(this.sourceRoot(), name)).isDirectory()) {
                    this.bulkDirectory(name, name);
                } else {
                    this.copy(name, name);
                }
            }
        });
    },

    install: function() {
        if(!this.options['skip-install']) {
            this.installDependencies();
        }
    },

    end: function() {

    }
});