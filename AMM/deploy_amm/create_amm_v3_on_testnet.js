'use strict'
// Dependencies for Node.js; this if statement lets the code run unmodified
// in browsers, as long as you provide a <script> tag (see example demo.html),
// as well as in Node.js.
if (typeof module !== "undefined") {
  var xrpl = require('xrpl')
  require('util').inspect.defaultOptions.depth = 5
}

// Connect to the network -----------------------------------------------------
const WS_URL = 'wss://s.altnet.rippletest.net:51233'
const EXPLORER = 'https://testnet.xrpl.org'

async function main() {
  const client = new xrpl.Client(WS_URL);
  console.log("Connecting to Testnet...")
  await client.connect()

  // Use existing accounts -----------------------------------------------------
  // These should be the addresses and secrets from the issue-a-token.js script
  const hot_wallet = xrpl.Wallet.fromSeed('sEdTUwEEtvQaMJmCfqdxkp3XJbL2RL4') // Replace with the actual secret of the hot wallet
  const cold_wallet = xrpl.Wallet.fromSeed('sEdSSc9TKrMZnj6p53y8SDYY6pE4qze') // Replace with the actual secret of the cold wallet
  const customer_one = xrpl.Wallet.fromSeed('sEdVU5GrDdE8Pcn1RSnzdmBZqASreR8') // Replace with the actual secret of the customer one
  const customer_two = xrpl.Wallet.fromSeed('sEdTBeyRPDipBmCVjMBwpGebf2gDA22') // Replace with the actual secret of the customer two

  console.log(`Using hot wallet ${hot_wallet.address} and cold wallet ${cold_wallet.address}`)
  console.log(`Using customer one wallet ${customer_one.address} and customer two wallet ${customer_two.address}`)

  // Acquire tokens (we assume this step was done in the other script) ---------
  // Skipping token issuance as they are already created in issue-a-token.js

  // Check if AMM already exists ----------------------------------------------
  const amm_info_request = {
    "command": "amm_info",
    "asset": {
      "currency": "FOO",
      "issuer": cold_wallet.address,
    },
    "asset2": {
      "currency": "XRP"
    },
    "ledger_index": "validated"
  }
  try {
    const amm_info_result = await client.request(amm_info_request)
    console.log(amm_info_result)
  } catch(err) {
    if (err.data.error === 'actNotFound') {
      console.log(`No AMM exists yet for the pair
                   FOO.${cold_wallet.address} / XRP.
                   (This is probably as expected.)`)
    } else {
      throw(err)
    }
  }

  // Look up AMM transaction cost ---------------------------------------------
  const ss = await client.request({"command": "server_state"})
  const amm_fee_drops = ss.result.state.validated_ledger.reserve_inc.toString()
  console.log(`Current AMMCreate transaction cost:
               ${xrpl.dropsToXrp(amm_fee_drops)} XRP`)

  // Create AMM ---------------------------------------------------------------
  // This example assumes that 15 XRP ≈ 100 FOO in value.
  const ammcreate_result = await client.submitAndWait({
    "TransactionType": "AMMCreate",
    "Account": hot_wallet.address,
    "Amount": {
      "currency": "FOO",
      "issuer": cold_wallet.address,
      "value": "100"
    },
    "Amount2": xrpl.xrpToDrops(15), // 15 XRP
    "TradingFee": 500, // 0.5%
    "Fee": amm_fee_drops
  }, {autofill: true, wallet: hot_wallet, fail_hard: true})
  if (ammcreate_result.result.meta.TransactionResult == "tesSUCCESS") {
    console.log(`AMM created: ${EXPLORER}/transactions/${ammcreate_result.result.hash}`)
  } else {
    throw `Error sending transaction: ${ammcreate_result}`
  }

  // Confirm that AMM exists --------------------------------------------------
  const amm_info_result2 = await client.request(amm_info_request)
  console.log(amm_info_result2)
  const lp_token = amm_info_result2.result.amm.lp_token
  const amount = amm_info_result2.result.amm.amount
  const amount2 = amm_info_result2.result.amm.amount2
  console.log(`The AMM account ${lp_token.issuer} has ${lp_token.value} total
               LP tokens outstanding, and uses the currency code ${lp_token.currency}.`)
  console.log(`In its pool, the AMM holds ${amount.value} ${amount.currency}.${amount.issuer}
               and ${amount2.value} ${amount2.currency}.${amount2.issuer}`)

  // Check token balances
  const account_lines_result = await client.request({
    "command": "account_lines",
    "account": hot_wallet.address,
    "ledger_index": "validated"
  })
  console.log(account_lines_result)

  // Disconnect when done -----------------------------------------------------
  await client.disconnect()
}

main()

async function get_new_token(client, wallet, currency_code, issue_quantity) {
  console.log("Funding an issuer address with the faucet...")
  const issuer = (await client.fundWallet()).wallet
  console.log(`Got issuer address ${issuer.address}.`)

  const issuer_setup_result = await client.submitAndWait({
    "TransactionType": "AccountSet",
    "Account": issuer.address,
    "SetFlag": xrpl.AccountSetAsfFlags.asfDefaultRipple
  }, {autofill: true, wallet: issuer} )
  if (issuer_setup_result.result.meta.TransactionResult == "tesSUCCESS") {
    console.log(`Issuer DefaultRipple enabled: ${EXPLORER}/transactions/${issuer_setup_result.result.hash}`)
  } else {
    throw `Error sending transaction: ${issuer_setup_result}`
  }

  const trust_result = await client.submitAndWait({
    "TransactionType": "TrustSet",
    "Account": wallet.address,
    "LimitAmount": {
      "currency": currency_code,
      "issuer": issuer.address,
      "value": "10000000000"
    }
  }, {autofill: true, wallet: wallet})
  if (trust_result.result.meta.TransactionResult == "tesSUCCESS") {
    console.log(`Trust line created: ${EXPLORER}/transactions/${trust_result.result.hash}`)
  } else {
    throw `Error sending transaction: ${trust_result}`
  }

  const issue_result = await client.submitAndWait({
    "TransactionType": "Payment",
    "Account": issuer.address,
    "Amount": {
      "currency": currency_code,
      "value": issue_quantity,
      "issuer": issuer.address
    },
    "Destination": wallet.address
  }, {autofill: true, wallet: issuer})
  if (issue_result.result.meta.TransactionResult == "tesSUCCESS") {
    console.log(`Tokens issued: ${EXPLORER}/transactions/${issue_result.result.hash}`)
  } else {
    throw `Error sending transaction: ${issue_result}`
  }

  return {
    "currency": currency_code,
    "value": issue_quantity,
    "issuer": issuer.address
  }
}
