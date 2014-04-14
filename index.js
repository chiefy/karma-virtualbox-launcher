/* global module, require */
'use strict';

var fs = require('fs'),
    urlparse = require('url').parse,
    urlformat = require('url').format,
    vb = require('virtualbox'),
    process_name = 'C:\\Program Files\\Internet Explorer\\iexplore.exe',
    VM_NAME = 'IE8Win7';

VBBrowser.$inject = ['baseBrowserDecorator', 'logger', 'args'];
VBBrowser.prototype = {
    name: 'vbIE8',
    DEFAULT_CMD: {
        win32: process_name
    },
    ENV_CMD: 'IE_BIN'
};

module.exports = {
    'launcher:vbIE8': ['type', VBBrowser]
};

function VBBrowser(baseBrowserDecorator, logger, args) {
    baseBrowserDecorator(this);

    var log = logger.create('launcher:vbIE8'),
        flags = args.flags || {};

    this._getOptions = function(url) {
        var urlObj = urlparse(url, true);
        handleXUaCompatible(args, urlObj);
        delete urlObj.search; //url.format does not want search attribute
        url = urlformat(urlObj);
        return [
            '-extoff'
        ].concat(flags, [url]);

        function handleXUaCompatible(args, urlObj) {
            if (args['x-ua-compatible']) {
                urlObj.query['x-ua-compatible'] = args['x-ua-compatible'];
            }
        }
    };

    function _exec(url) {
        vb.exec({
            user: 'IEUser',
            password: 'Passw0rd!',
            vm: VM_NAME,
            cmd: process_name,
            params: url
        }, function(err) {
            if (err) {
                throw err;
            }
        });
    }

    this._start = function(url) {
        // @todo figure out if host is win or linux
        url = url.replace('localhost', '10.0.2.2');

        log.info('starting virtualbox vm w/' + url);

        vb.start(VM_NAME, function(err) {
            log.info('started virtualbox VM!');
            if (err) {
                throw err;
            }
            setTimeout(function() {
                _exec(url);
            }, 20000);
        });
    };
}