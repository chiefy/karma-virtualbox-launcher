/* global module, require */
'use strict';

var urlparse = require('url').parse,
    urlformat = require('url').format,
    _ = require('lodash'),
    vb = require('virtualbox'),
    PROCESS_NAME = 'C:\\Program Files\\Internet Explorer\\iexplore.exe';

module.exports = {
    'launcher:VirtualBoxBrowser': ['type', VirtualBoxBrowserInstance]
};

VirtualBoxBrowserInstance.$inject = ['baseBrowserDecorator', 'logger', 'args'];
VirtualBoxBrowserInstance.prototype = {
    name: 'VirtualBoxBrowser',
    DEFAULT_CMD: {
        win32: PROCESS_NAME
    },
    ENV_CMD: 'IE_BIN'
};

function VirtualBoxBrowserInstance(baseBrowserDecorator, logger, args) {

    args.config = _.defaults(args.config, {
        vm_name: null,
        user: 'IEUser',
        password: 'Passw0rd!',
        use_gui: false
    });

    if (!args.config.vm_name) {
        throw new Error('No VirtualBox VM name was provided in config.');
    }

    this.vm_name = args.config.vm_name;
    this.name = this.vm_name + ' via ' + this.name;
    this.use_gui = args.config.use_gui;
    this.credentials = {
        user: args.config.user,
        password: args.config.password
    };

    baseBrowserDecorator(this);

    var log = logger.create('launcher:' + this.name),
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

    this._exec = function(url) {
        var that = this;
        vb.exec({
            user: that.credentials.user,
            password: that.credentials.password,
            vm: that.vm_name,
            cmd: PROCESS_NAME,
            params: url
        }, function(err) {
            if (err) {
                throw err;
            }
        });
    }

    // @todo need to queue these up if there's > 1 VM
    this._start = function(url) {
        var exec = _.bind(this._exec, this),
            vm_name = this.vm_name;

        // @todo figure out if host is win / osx / linux, get IP programatically
        url = url.replace('localhost', '10.0.2.2');

        log.info('starting virtualbox vm w/' + url);

        vb.start(vm_name, this.use_gui, function(err) {
            if (err) {
                throw err;
            }
            var getIP = setInterval(function() {
                // @todo, use config to get correct NIC path
                vb.guestproperty.get({
                    vm: vm_name,
                    key: '/VirtualBox/GuestInfo/Net/0/V4/IP'
                }, function(ip_address) {
                    if (!ip_address) {
                        return log.info('could not get IP for guest VM, trying again...');
                    }
                    clearInterval(getIP);
                    exec(url);
                });
            }, 2000);

        });
    };
}