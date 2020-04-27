'use strict';
var config = require('./config/config.json');
const RippleAPI = require('ripple-lib').RippleAPI;

const api = new RippleAPI({
server: config.protocol+config.host_domain+config.port	
});
api.connect().then(() => {

return api.getServerInfo().then(info => {
	console.log(info)
});

}).then(() => {
return api.disconnect();
}).then(() => {
console.log('Done and Disconnected.');
}).catch(console.error);
