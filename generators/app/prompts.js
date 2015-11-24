'use strict';

let yeoman = require('./yeoman');
let config = require('./config.json');

module.exports = [
    {
        type: 'input',
        name: 'appName',
        message: 'Please choose your application name',
        default: yeoman.appName(),
    },
    {
        type: 'list',
        name: 'style',
        message: 'Which styles language you prefer to use?',
        choices: Object.keys(config.style.choices),
        default: config.style.default,
        store: true
    },
    {
        type: 'checkbox',
        name: 'jslibs',
        message: 'Which library you prefer to use?',
        choices: Object.keys(config.jslibs.choices),
        default: config.jslibs.default,
        store: true
    }
];
