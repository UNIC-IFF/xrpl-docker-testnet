'use strict'
const readline = require('readline');
const xrpl = require('xrpl');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt the user for input
function prompt(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Connect to the network -----------------------------------------------------
async function main() {
  try {
    const network_ip = await prompt("Enter the IP address of the XRPL network: ");
    const WS_URL = `ws://${network_ip}:6006`;

    const currency_code = await prompt("Enter the name of the token to issue (3 characters): ");
    if (currency_code.length !== 3) {
      throw new Error("The token name must be exactly 3 characters long.");
    }

    const hot_wallet_seed = await prompt("Enter the hot wallet seed: ");
    const cold_wallet_seed = await prompt("Enter the cold wallet seed: ");
    const customer_one_seed = await prompt("Enter the customer one wallet seed: ");
    const customer_two_seed = await prompt("Enter the customer two wallet seed: ");

    const client = new xrpl.Client(WS_URL);
    console.log("Connecting to the XRPL network...");
    await client.connect();
    console.log("Connected to the XRPL network");

    const hot_wallet = xrpl.Wallet.fromSeed(hot_wallet_seed, { algorithm: 'secp256k1' });
    const cold_wallet = xrpl.Wallet.fromSeed(cold_wallet_seed, { algorithm: 'secp256k1' });
    const customer_one = xrpl.Wallet.fromSeed(customer_one_seed, { algorithm: 'secp256k1' });
    const customer_two = xrpl.Wallet.fromSeed(customer_two_seed, { algorithm: 'secp256k1' });

    console.log(`Using hot wallet ${hot_wallet.address} and cold wallet ${cold_wallet.address}`);
    console.log(`Using customer one wallet ${customer_one.address} and customer two wallet ${customer_two.address}`);

    // Check if AMM already exists ----------------------------------------------
    const amm_info_request = {
      "command": "amm_info",
      "asset": {
        "currency": currency_code,
        "issuer": cold_wallet.address,
      },
      "asset2": {
        "currency": "XRP"
      },
      "ledger_index": "validated"
    }
    let amm_exists = false;
    try {
      const amm_info_result = await client.request(amm_info_request);
      console.log("AMM exists.");
      amm_exists = true;

      const lp_token = amm_info_result.result.amm.lp_token;
      const amount = amm_info_result.result.amm.amount;
      const amount2 = amm_info_result.result.amm.amount2;
      console.log(`The AMM account ${lp_token.issuer} has ${lp_token.value} total LP tokens outstanding.`);
      console.log(`In its pool, the AMM holds ${amount.value} ${amount.currency}.${amount.issuer} and ${xrpl.dropsToXrp(amount2)} XRP.`);

      const account_lines_result = await client.request({
        "command": "account_lines",
        "account": hot_wallet.address,
        "ledger_index": "validated"
      });
      console.log("Hot Wallet Token Balances:", account_lines_result.result.lines);

      await client.disconnect();
      console.log("Disconnected from XRPL network");
      return;
    } catch (err) {
      if (err.data && err.data.error === 'actNotFound') {
        console.log(`No AMM exists yet for the pair ${currency_code}.${cold_wallet.address} / XRP.`);
      } else {
        throw err;
      }
    }

    // If AMM does not exist, create it ------------------------------------------
    // Look up AMM transaction cost ---------------------------------------------
    let amm_fee_drops;
    try {
      const ss = await client.request({ "command": "server_state" });
      amm_fee_drops = ss.result.state.validated_ledger.reserve_inc.toString();
      console.log(`Current AMMCreate transaction cost: ${xrpl.dropsToXrp(amm_fee_drops)} XRP`);
    } catch (err) {
      throw err;
    }

    // Create AMM ---------------------------------------------------------------
    // This example assumes that 15 XRP ≈ 100 of the currency in value.
    try {
      const ammcreate_result = await client.submitAndWait({
        "TransactionType": "AMMCreate",
        "Account": hot_wallet.address,
        "Amount": {
          "currency": currency_code,
          "issuer": cold_wallet.address,
          "value": "100"
        },
        "Amount2": xrpl.xrpToDrops(15), // 15 XRP
        "TradingFee": 500, // 0.5%
        "Fee": amm_fee_drops
      }, { autofill: true, wallet: hot_wallet, fail_hard: true });
      if (ammcreate_result.result.meta.TransactionResult == "tesSUCCESS") {
        console.log("AMM created successfully.");
      } else {
        // Add a comment explaining the common cause of this error
        if (ammcreate_result.result.meta.TransactionResult === 'tecUNFUNDED_AMM') {
          console.error("Error: The AMM creation failed because the token has not been issued yet. Please issue the token before creating the AMM.");
        }
        throw new Error(`Error sending transaction: ${JSON.stringify(ammcreate_result.result.meta, null, 2)}`);
      }
    } catch (err) {
      throw err;
    }

    // Confirm that AMM exists --------------------------------------------------
    try {
      const amm_info_result2 = await client.request(amm_info_request);
      console.log("Confirmed AMM Information:");
      const lp_token = amm_info_result2.result.amm.lp_token;
      const amount = amm_info_result2.result.amm.amount;
      const amount2 = amm_info_result2.result.amm.amount2;
      console.log(`The AMM account ${lp_token.issuer} has ${lp_token.value} total LP tokens outstanding.`);
      console.log(`In its pool, the AMM holds ${amount.value} ${amount.currency}.${amount.issuer} and ${xrpl.dropsToXrp(amount2)} XRP.`);
    } catch (err) {
      throw err;
    }

    // Check token balances
    try {
      const account_lines_result = await client.request({
        "command": "account_lines",
        "account": hot_wallet.address,
        "ledger_index": "validated"
      });
      console.log("Hot Wallet Token Balances:", account_lines_result.result.lines);
    } catch (err) {
      throw err;
    }

    // Disconnect when done -----------------------------------------------------
    await client.disconnect();
    console.log("Disconnected from XRPL network");
    rl.close();
  } catch (err) {
    console.error("An error occurred:", err.message);
    rl.close();
    process.exit(1);
  }
}

main().catch(err => {
  console.error("Error in main function:", err);
  process.exit(1);
});
