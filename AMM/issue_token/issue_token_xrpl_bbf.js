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

// Function to create a wallet and verify account info
async function createAndVerifyWallet(client, seed) {
  let wallet;
  try {
    wallet = xrpl.Wallet.fromSeed(seed);
    await verifyAccountInfo(client, wallet);
  } catch (error) {
    if (error.data && error.data.error === 'actNotFound') {
      wallet = xrpl.Wallet.fromSeed(seed, { algorithm: 'secp256k1' });
      await verifyAccountInfo(client, wallet);
    } else {
      throw error;
    }
  }
  return wallet;
}

// Function to verify account info
async function verifyAccountInfo(client, wallet) {
  const account_info = await client.request({
    command: 'account_info',
    account: wallet.address,
    ledger_index: 'validated'
  });
}

// Connect ---------------------------------------------------------------------
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
    const customer_one_wallet_seed = await prompt("Enter the customer one wallet seed: ");
    const customer_two_wallet_seed = await prompt("Enter the customer two wallet seed: ");

    const client = new xrpl.Client(WS_URL);
    console.log("Connecting to the XRPL private network...");
    await client.connect();
    console.log("Connected!!!");
    
    const hot_wallet = await createAndVerifyWallet(client, hot_wallet_seed);
    const cold_wallet = await createAndVerifyWallet(client, cold_wallet_seed);
    const customer_one_wallet = await createAndVerifyWallet(client, customer_one_wallet_seed);
    const customer_two_wallet = await createAndVerifyWallet(client, customer_two_wallet_seed);

    // Configure issuer (cold address) settings ----------------------------------
    const cold_settings_tx = {
      "TransactionType": "AccountSet",
      "Account": cold_wallet.address,
      "TransferRate": 0,
      "TickSize": 5,
      "Domain": "6D746F756C6F75702E657468", // "mtouloup.eth"
      "SetFlag": xrpl.AccountSetAsfFlags.asfDefaultRipple,
      // Using tf flags, we can enable more flags in one transaction
      "Flags": (xrpl.AccountSetTfFlags.tfDisallowXRP |
               xrpl.AccountSetTfFlags.tfRequireDestTag)
    }

    const cst_prepared = await client.autofill(cold_settings_tx);
    const cst_signed = cold_wallet.sign(cst_prepared);
    console.log("Sending cold address AccountSet transaction...");
    const cst_result = await client.submitAndWait(cst_signed.tx_blob);
    if (cst_result.result.meta.TransactionResult == "tesSUCCESS") {
      console.log(`Transaction succeeded: ${cst_signed.hash}`);
    } else {
      throw new Error(`Error sending transaction: ${cst_result}`);
    }

    // Configure hot address settings --------------------------------------------
    const hot_settings_tx = {
      "TransactionType": "AccountSet",
      "Account": hot_wallet.address,
      "Domain": "6D746F756C6F75702E657468", // "mtouloup.eth"
      // enable Require Auth so we can't use trust lines that users
      // make to the hot address, even by accident:
      "SetFlag": xrpl.AccountSetAsfFlags.asfRequireAuth,
      "Flags": (xrpl.AccountSetTfFlags.tfDisallowXRP |
                xrpl.AccountSetTfFlags.tfRequireDestTag)
    }

    const hst_prepared = await client.autofill(hot_settings_tx);
    const hst_signed = hot_wallet.sign(hst_prepared);
    console.log("Sending hot address AccountSet transaction...");
    const hst_result = await client.submitAndWait(hst_signed.tx_blob);
    if (hst_result.result.meta.TransactionResult == "tesSUCCESS") {
      console.log(`Transaction succeeded: ${hst_signed.hash}`);
    } else {
      throw new Error(`Error sending transaction: ${hst_result.result.meta.TransactionResult}`);
    }

    // Create trust line from hot to cold address --------------------------------
    const trust_set_tx = {
      "TransactionType": "TrustSet",
      "Account": hot_wallet.address,
      "LimitAmount": {
        "currency": currency_code,
        "issuer": cold_wallet.address,
        "value": "10000000000" // Large limit, arbitrarily chosen
      }
    }

    const ts_prepared = await client.autofill(trust_set_tx);
    const ts_signed = hot_wallet.sign(ts_prepared);
    console.log("Creating trust line from hot address to issuer...");
    const ts_result = await client.submitAndWait(ts_signed.tx_blob);
    if (ts_result.result.meta.TransactionResult == "tesSUCCESS") {
      console.log(`Transaction succeeded: ${ts_signed.hash}`);
    } else {
      throw new Error(`Error sending transaction: ${ts_result.result.meta.TransactionResult}`);
    }

    // Create trust line from customer_one to cold address --------------------------------
    const trust_set_tx2 = {
      "TransactionType": "TrustSet",
      "Account": customer_one_wallet.address,
      "LimitAmount": {
        "currency": currency_code,
        "issuer": cold_wallet.address,
        "value": "10000000000" // Large limit, arbitrarily chosen
      }
    }

    const ts_prepared2 = await client.autofill(trust_set_tx2);
    const ts_signed2 = customer_one_wallet.sign(ts_prepared2);
    console.log("Creating trust line from customer_one address to issuer...");
    const ts_result2 = await client.submitAndWait(ts_signed2.tx_blob);
    if (ts_result2.result.meta.TransactionResult == "tesSUCCESS") {
      console.log(`Transaction succeeded: ${ts_signed2.hash}`);
    } else {
      throw new Error(`Error sending transaction: ${ts_result2.result.meta.TransactionResult}`);
    }

    // Create trust line from customer_two to cold address --------------------------------
    const trust_set_tx3 = {
      "TransactionType": "TrustSet",
      "Account": customer_two_wallet.address,
      "LimitAmount": {
        "currency": currency_code,
        "issuer": cold_wallet.address,
        "value": "10000000000" // Large limit, arbitrarily chosen
      }
    }

    const ts_prepared3 = await client.autofill(trust_set_tx3);
    const ts_signed3 = customer_two_wallet.sign(ts_prepared3);
    console.log("Creating trust line from customer_two address to issuer...");
    const ts_result3 = await client.submitAndWait(ts_signed3.tx_blob);
    if (ts_result3.result.meta.TransactionResult == "tesSUCCESS") {
      console.log(`Transaction succeeded: ${ts_signed3.hash}`);
    } else {
      throw new Error(`Error sending transaction: ${ts_result3.result.meta.TransactionResult}`);
    }

    // Send token ----------------------------------------------------------------
    let issue_quantity = "3800";

    const send_token_tx = {
      "TransactionType": "Payment",
      "Account": cold_wallet.address,
      "Amount": {
        "currency": currency_code,
        "value": issue_quantity,
        "issuer": cold_wallet.address
      },
      "Destination": hot_wallet.address,
      "DestinationTag": 1 // Needed since we enabled Require Destination Tags
                          // on the hot account earlier.
    }

    const pay_prepared = await client.autofill(send_token_tx);
    const pay_signed = cold_wallet.sign(pay_prepared);
    console.log(`Cold to hot - Sending ${issue_quantity} ${currency_code} to ${hot_wallet.address}...`);
    const pay_result = await client.submitAndWait(pay_signed.tx_blob);
    if (pay_result.result.meta.TransactionResult == "tesSUCCESS") {
      console.log(`Transaction succeeded: ${pay_signed.hash}`);
    } else {
      throw new Error(`Error sending transaction: ${pay_result.result.meta.TransactionResult}`);
    }

    issue_quantity = "100";
    const send_token_tx2 = {
      "TransactionType": "Payment",
      "Account": hot_wallet.address,
      "Amount": {
        "currency": currency_code,
        "value": issue_quantity,
        "issuer": cold_wallet.address
      },
      "Destination": customer_one_wallet.address,
      "DestinationTag": 1 // Needed since we enabled Require Destination Tags
                          // on the hot account earlier.
    }

    const pay_prepared2 = await client.autofill(send_token_tx2);
    const pay_signed2 = hot_wallet.sign(pay_prepared2);
    console.log(`Hot to customer_one - Sending ${issue_quantity} ${currency_code} to ${customer_one_wallet.address}...`);
    const pay_result2 = await client.submitAndWait(pay_signed2.tx_blob);
    if (pay_result2.result.meta.TransactionResult == "tesSUCCESS") {
      console.log(`Transaction succeeded: ${pay_signed2.hash}`);
    } else {
      throw new Error(`Error sending transaction: ${pay_result2.result.meta.TransactionResult}`);
    }

    issue_quantity = "12";
    const send_token_tx3 = {
      "TransactionType": "Payment",
      "Account": customer_one_wallet.address,
      "Amount": {
        "currency": currency_code,
        "value": issue_quantity,
        "issuer": cold_wallet.address
      },
      "Destination": customer_two_wallet.address,
      "DestinationTag": 1 // Needed since we enabled Require Destination Tags
                          // on the hot account earlier.
    }

    const pay_prepared3 = await client.autofill(send_token_tx3);
    const pay_signed3 = customer_one_wallet.sign(pay_prepared3);
    console.log(`Customer_one to customer_two - Sending ${issue_quantity} ${currency_code} to ${customer_two_wallet.address}...`);
    const pay_result3 = await client.submitAndWait(pay_signed3.tx_blob);
    if (pay_result3.result.meta.TransactionResult == "tesSUCCESS") {
      console.log(`Transaction succeeded: ${pay_signed3.hash}`);
    } else {
      throw new Error(`Error sending transaction: ${pay_result3.result.meta.TransactionResult}`);
    }

    // Check balances ------------------------------------------------------------
    console.log("Getting hot address balances...");
    const hot_balances = await client.request({
      command: "account_lines",
      account: hot_wallet.address,
      ledger_index: "validated"
    });
    console.log(hot_balances.result);

    console.log("Getting cold address balances...");
    const cold_balances = await client.request({
      command: "gateway_balances",
      account: cold_wallet.address,
      ledger_index: "validated",
      hotwallet: [hot_wallet.address]
    });
    console.log(JSON.stringify(cold_balances.result, null, 2));

    client.disconnect();
    rl.close();
  } catch (error) {
    console.error("An error occurred:", error.message);
    rl.close();
    process.exit(1);
  }
} // End of main()

main();
