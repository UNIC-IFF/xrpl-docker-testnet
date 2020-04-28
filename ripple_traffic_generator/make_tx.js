var config = require('./config/config.json');
const RippleAPI = require('ripple-lib').RippleAPI
const api       = new RippleAPI({ server: config.protocol+config.host_domain+config.port }) // Private rippled server
const fetch     = require('node-fetch')
const fs = require('fs')

var gen_secr = config.genesis_ledger_secret; 

var closedLedger = 0
var fee = 0
var startLedger = 0

/* * * * * * * * * * */

  var feeLimit = 100
  var ledgerAwait = 5

  var argv = process.argv.reverse()[0].split(':')

  if(argv.length !== 4) {
    console.log('Invalid # arguments')
    process.exit(1)
  }

  var payFrom = argv[1]
  var payTo = argv[2]
  var payTo_tag = parseInt(argv[3])
  var xrpAmount = parseFloat(argv[0])

  var signed_tx = null
  var tx_at_ledger = 0
  var tx_result = null

/* * * * * * * * * * */

var _processTransaction = function () {
  var _fee = fee
  if(fee > feeLimit) _fee = feeLimit

  api.getAccountInfo(payFrom).then(function(accInfo){

    var transaction = {
        "TransactionType" : "Payment",
        "Account" : payFrom,
        "Fee" : _fee+"",
        "Destination" : payTo,
        "DestinationTag" : payTo_tag,
        "Amount" : (xrpAmount*1000*1000)+"",
        "LastLedgerSequence" : closedLedger+ledgerAwait,
        "Sequence" : accInfo.sequence
     }


    var txJSON = JSON.stringify(transaction)
    var secret = config.account_secret

    if(typeof secret === 'undefined') {
      process.exit(1)
    }

    signed_tx = api.sign(txJSON, secret)
    tx_at_ledger = closedLedger

    api.submit(signed_tx.signedTransaction).then(function(tx_data){	
		console.log(tx_data)
		
		try {
			var data = [];
			data = require('./transactions.json');
			data.push(tx_data);
			
			fs.writeFile("./transactions.json", JSON.stringify(data), (err) => {
				if (err) {
					console.error(err);
					return;
				};
				//console.log("File has been created");
			});
		} catch ( err ) {
			console.log("File not found.");
		}
			
    }).catch(function(e){
      process.exit(1)
    })
  })
}

var _lastClosedLedger = function (ledgerIndex) {
  var i = parseInt(ledgerIndex)
  if (ledgerIndex > closedLedger) {
    if(startLedger < 1) {
      startLedger = ledgerIndex
    }

    closedLedger = ledgerIndex

    if(closedLedger > startLedger + ledgerAwait + 1){
      process.exit(1)
    }

    api.getFee().then(function(e){
      _fee = parseFloat(e)*1000*1000
      if(_fee !== fee){
        fee = _fee
      }
    })

    if(signed_tx !== null && tx_result === null && (closedLedger-tx_at_ledger) <= ledgerAwait){
      api.getTransaction(signed_tx.id, {
        minLedgerVersion: tx_at_ledger,
        maxLedgerVersion: closedLedger
      }).then(function(d){
        tx_result = d
        process.exit(0)
      }).catch(function(e,x){
      })
    }else{
      if(signed_tx !== null && (closedLedger-tx_at_ledger) > ledgerAwait){
        process.exit(1)
      }
    }
  }
}

var _bootstrap = function () {

  api.connection._ws.on('message', function(m){
    var message = JSON.parse(m)
    if (message.type === 'ledgerClosed') {
      _lastClosedLedger(message.ledger_index)
    }else{
      if (message.type !== 'response') {
      }
    }
  })

  return

}

api.on('error', (errorCode, errorMessage) => {
  console.log(errorCode + ': ' + errorMessage)
  process.exit(1);
})
api.on('connected', () => {

})
api.on('disconnected', (code) => {
  process.exit(1);
})
api.connect().then(() => {
  api.getServerInfo().then(function (server) {
    fee = parseFloat(server.validatedLedger.baseFeeXRP)*1000*1000
    _lastClosedLedger(server.validatedLedger.ledgerVersion)
    _bootstrap()

    _processTransaction()
  })
}).then(() => {
}).catch(console.error)