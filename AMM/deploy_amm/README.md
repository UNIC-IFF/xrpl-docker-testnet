
# XRPL AMM Creation Script

## Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.
- Basic understanding of the XRP Ledger and its terminology.
- The token must be issued before running this script. Use the token issuance script to issue the token.
- For the private XRPL network script, you need to have created accounts and have the seeds ready.

## Setup

1. Clone this repository:
    ```sh
    git clone https://github.com/your-repository/xrpl-token-issuance.git
    cd xrpl-token-issuance
    ```
2. Install the necessary dependencies:
    ```sh
    npm install xrpl readline
    ```

## Script: Create AMM on Private XRPL Network

### Description

This script creates an Automated Market Maker (AMM) on a private XRPL network through the Blockchain Benchmarking Framework (BBF). It requires the user to provide the network IP, token name, and seeds for the hot wallet, cold wallet, and two customer wallets. Note that the token must be issued before running this script.

### Usage

1. Ensure you have issued the token using the private network script.
2. Run the script:
    ```sh
    node create-amm.js
    ```
3. Follow the prompts to provide the necessary details:
    - IP address of the XRPL network.
    - Token name (3 characters).
    - Hot wallet seed.
    - Cold wallet seed.
    - Customer one wallet seed.
    - Customer two wallet seed.

### Code Explanation

- **Connect to Private Network:** Connects to the private XRPL network using a WebSocket.
- **Prompt for User Input:** Prompts the user for the network IP, token name, and wallet seeds.
- **Check if AMM Exists:** Checks if an AMM already exists for the provided token and XRP.
- **Look Up AMM Transaction Cost:** Retrieves the transaction cost for creating an AMM.
- **Create AMM:** Creates an AMM with the provided token and XRP if it does not already exist.
- **Confirm AMM Existence:** Confirms the existence of the AMM and retrieves its details.
- **Check Token Balances:** Retrieves and displays the token balances for the hot wallet.
- **Error Handling:** Includes error handling for common issues, such as token not being issued.

### Error Handling

This script includes comprehensive error handling to manage issues such as:
- Invalid token name (must be exactly 3 characters).
- Network connection errors.
- Wallet creation errors.
- Transaction submission errors.

If an error occurs, the script will output an error message and exit gracefully. 

Note: If you encounter the `tecUNFUNDED_AMM` error, it means that the token has not been issued yet. Ensure the token is issued before running this script.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contributors

* Marios Touloupou (@mtouloup) [touloupos.m@unic.ac.cy]

### UBRI Funding

This work is funded by Ripple’s Impact Fund, an advised fund of Silicon Valley Community Foundation (Grant id: 2021-244121).  Link: [University Blockchain Research Initiative](https://ubri.ripple.com)
