'use strict';
var config = require(__dirname+'/config/config.json');
const RippleAPI = require('ripple-lib').RippleAPI;
var test_server = config.protocol+config.host_domain+config.port;

const api = new RippleAPI({
    server: test_server // Private rippled server
});

api.connect().then(() => {
/* begin custom code ------------------------------------ */

var  myAddress = process.argv.reverse()[0]

console.log('getting account info for', myAddress);
return api.getAccountInfo(myAddress);

}).then(info => {
console.log(info);
console.log('getAccountInfo done');

/* end custom code -------------------------------------- */
}).then(() => {
return api.disconnect();
}).then(() => {
console.log('Done and Disconnected.');
}).catch(console.error);
