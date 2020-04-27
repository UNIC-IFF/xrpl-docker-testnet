# Generating Traffic in the Network
The scripts in this repository are responsible to generate traffic, meaning transactions in out Ripple Testing Environment.

## Prerequisites
First, you need to install node.js at your machine. If you haven't done it already please visit the following URL: https://nodejs.org/en/    
In the config.json file you can find variables needed to be provided for your private Ripple Network
Note that that the variable "account_secret" in the config.json file ise the secret of the genesis ledger's account. In this case
you can make a transaction transfering XRPs from the genesis ledger to any other account. If you want to transfer XRPs 
from another account you need to update the value of the secret in the config file.

### Both the account key and secret of the validator genesis node are the following:
```Account Address: rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh```    
```Account Secret: snoPBrXtMeMyMHUVTgbuqAfg1SUTb```

## Definition of Scripts
1. traffic_gen.sh
In this script we have automated the process of the generation of the transcations. First step is to propose-create new accounts,
and then spread the XRPs from the Genesis Ledger to those accounts.

## Definition of Ripple-lib scripts
1. acc_info.js
This javascript file is responsible to request from the Ripple API the information for a specific account. You can run the 
script with this command ```node acc_info.js <account_key>```
2. wallet_propose.js
This javascript file is responsible to request from the Ripple API the generation of a new account. The new account keys
will be appended in a new file called "wallets.txt". You can run the script with this command ```node wallet_propose.js <number_of_accounts>```
3. make_tx.js
This javascript file is responsible to request from the Ripple API the execution of a transaction in the network.
You can run the script with this command ```node wallet_propose.js <AMOUNT:FROMADDR:TOADDR:TOTAG>```
4. server_info.js
This javascript file is responsible to request the server info from the specified Node ip and port in the config file.
You can run the script with this command ```node server_info.js```

## Run it for the first time
```sh traffic_gen.sh 5 rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh``` 

This command will generate 5 new wallet accounts and it will spread 1000 XRPs to each one of those accounts.

