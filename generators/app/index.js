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
        this.option('ignore-cdn', {
            desc: 'Ignore CDN, using the local fallback',
            type: Boolean,
            defaults: false
        });

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
            this.jslibs = answers.jslibs;

            this.config.set('appName', this.appName);
            this.config.set('appPath', this.appPath);
            this.config.set('style', this.style);
            this.config.set('jslibs', this.jslibs);
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
            }
        }
    },

    _generatePackage: function() {
        let settings = this.fs.readJSON(this.templatePath('package.json'));

        _.extend(settings.devDependencies, config.style.choices[this.style].packages);

        this.fs.writeJSON(this.destinationPath('package.json'), _.extend(settings, this.context));
    },

    _generateBower: function() {
        let settings = this.fs.readJSON(this.templatePath('bower.json'));

        for (let jslib of this.jslibs) {
            _.extend(settings.dependencies, config.jslibs.choices[jslib].packages);
        }

        this.fs.writeJSON(this.destinationPath('bower.json'), _.extend(settings, this.context));
    },

    _generateTsd: function() {
        let settings = this.fs.readJSON(this.templatePath('tsd.json'));

        for (let jslib of this.jslibs) {
            _.extend(settings.installed, config.jslibs.choices[jslib].typings);
        }

        this.fs.writeJSON(this.destinationPath('tsd.json'), settings);
    },

    writing: function() {
        this._generatePackage();
        this._generateBower();
        this._generateTsd();

        fs.readdir(this.sourceRoot(), (err, names) => {
            for(let name of names) {
                this.log(name);

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
