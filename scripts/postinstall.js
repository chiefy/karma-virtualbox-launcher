process.on('uncaughtException', function (err) {
    console.log('Not installing karma-virtualbox-launcher. VirtualBox not installed.');
    process.exit(1);
});

require('virtualbox');
