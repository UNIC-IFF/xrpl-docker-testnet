'use strict';
var config = require('./config/config.json');
const fs = require('fs')
const RippleAPI = require('ripple-lib').RippleAPI;
var test_server = config.protocol+config.host_domain+config.port;
var keypairs = require('ripple-keypairs');
const api = new RippleAPI({
    server: test_server // Private rippled server
});
api.connect().then(() => { 
    /* begin custom code ------------------------------------ */
    return api.generateAddress();
}).then(address_info => {
    //console.log("Secret: " + address_info.secret);
    console.log("Address: " + address_info.address);
	var acc_id = address_info.address
	var acc_secret = address_info.secret
    var keypair = keypairs.deriveKeypair(address_info.secret);
    var privateKey = keypair.privateKey;
    var publicKey = keypair.publicKey;
    var address = keypairs.deriveAddress(keypair.publicKey);
	fs.appendFile('wallets.txt',  acc_id + "\n", (err) => {     
		// In case of a error throw err. 
		if (err) throw err; 
	}) 
	
	fs.appendFile('wallets_secrets.txt',  acc_secret + "\n", (err) => {     
		// In case of a error throw err. 
		if (err) throw err; 
	}) 
    /* end custom code -------------------------------------- */
}).then(() => {
    return api.disconnect();
}).then(() => {
    //console.log('Done and Disconnected.');
}).catch(console.error);