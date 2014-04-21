karma-virtualbox-launcher
===================

Launcher for using VirtualBox IE / Windows VMs

This is a little launcher I developed for using VirtualBox VMs with various flavors of Internet Explorer to test using Karma.

### Usage 
For now, there is a hard dependency on my fork of ```node-virtualbox```
```
npm install karma-virtualbox-launcher --save-dev
```
### Configure your karma.conf.js
```
[snip]
customLaunchers: {
    'IE8': {
        base: 'VirtualBoxBrowser',
        config: {
            vm_name: 'IE8 - Win7' // configured name of your Virtualbox VM
        }
    },
    'IE9': {
        base: 'VirtualBoxBrowser',
        config: {
            vm_name: 'IE9 - Win7' // configured name of your Virtualbox VM
        }
    }
},

// start these browsers
// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
browsers: ['IE8', 'IE9'],
[/snip]
```
### Limitations / Known Issues
* For now, only works with NAT networking on guest OSes.
* Need to test in non-Windows host environments.
* Only supports IE at the moment.
* No killing of guest browsers (yet).