
# XRPL Token Issuance Scripts

# Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.  
- Basic understanding of the XRP Ledger and its terminology.  
- For the private XRPL network script, you need to have created accounts and have the seeds ready.

# Setup

1. Clone this repository:  
```sh  
git clone https://github.com/your-repository/xrpl-token-issuance.git  
cd xrpl-token-issuance  
```  
2. Install the necessary dependencies:  
```sh  
npm install xrpl readline  
```

# Script 1: Connect to XRP Ledger Testnet

## Description

This script connects to the XRP Ledger Testnet, requests credentials from the Testnet faucet, and issues a fungible token. The token name is provided as an argument when running the script.

## Usage

1. Run the script:  
```sh  
node testnet-issue-token.js <TOKEN_NAME>  
```  
Example:  
```sh  
node testnet-issue-token.js FOO  
```

## Code Explanation

- **Connect to Testnet:** Connects to the XRP Ledger Testnet using a WebSocket.  
- **Request Testnet Credentials:** Funds wallets for the issuer (cold wallet), distributor (hot wallet), and two customer wallets from the Testnet faucet.  
- **Configure Account Settings:** Sets specific configurations for both the issuer (cold) and distributor (hot) wallets.  
- **Create Trust Lines:** Establishes trust lines between the distributor and issuer, and between the customers and issuer.  
- **Issue Tokens:** Issues tokens from the issuer to the distributor and then from the distributor to customers.  
- **Check Balances:** Retrieves and displays the balance information for the hot and cold wallets.

# Script 2: Connect to Private XRPL Network

## Description

This script connects to a private XRPL network through the Blockchain Benchmarking Framework (BBF). It requires the user to provide the network IP, token name, and seeds for the hot wallet, cold wallet, and two customer wallets.

## Usage

1. Ensure you have created accounts on the private XRPL network and have the seeds ready.  
2. Run the script:  
```sh  
node private-network-issue-token.js  
```  
3. Follow the prompts to provide the necessary details:  
- IP address of the XRPL network.  
- Token name (3 characters).  
- Hot wallet seed.  
- Cold wallet seed.  
- Customer one wallet seed.  
- Customer two wallet seed.

## Code Explanation

- **Connect to Private Network:** Connects to the private XRPL network using a WebSocket.  
- **Prompt for User Input:** Prompts the user for the network IP, token name, and wallet seeds.  
- **Create and Verify Wallets:** Creates wallets from the provided seeds and verifies their account information.  
- **Configure Account Settings:** Sets specific configurations for both the issuer (cold) and distributor (hot) wallets.  
- **Create Trust Lines:** Establishes trust lines between the distributor and issuer, and between the customers and issuer.  
- **Issue Tokens:** Issues tokens from the issuer to the distributor and then from the distributor to customers.  
- **Check Balances:** Retrieves and displays the balance information for the hot and cold wallets.

# Error Handling

Both scripts include comprehensive error handling to manage issues such as:  
- Invalid token name (must be exactly 3 characters).  
- Network connection errors.  
- Wallet creation errors.  
- Transaction submission errors.  
If an error occurs, the script will output an error message and exit gracefully.

# License

This project is licensed under the MIT License. See the LICENSE file for details.

# Contributors
* Marios Touloupou (@mtouloup) [ touloupos.m@unic.ac.cy ]    

## UBRI Funding
This work is funded by the Ripple’s Impact Fund, an advised fund of Silicon Valley Community Foundation (Grant id: 2021-244121).
Link: [University Blockchain Research Initiative](https://ubri.ripple.com)