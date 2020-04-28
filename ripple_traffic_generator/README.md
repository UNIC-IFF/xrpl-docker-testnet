
# Generating Traffic in the Network
The scripts in this repository are responsible to generate traffic, meaning transactions in out Ripple Testing Environment.

## Prerequisites
First, you need to install node.js at your machine. If you haven't done it already please visit the following URL: https://nodejs.org/en/    
In the config.json file you can find variables needed to be provided for your private Ripple Network
Note that that by default, in the config file, the validator's genesis account address and secret are defined. In this case, the trasnactions will be compiled/signed and commited from the aforementioned account. If you want to change those values you are free to do so.
Also, you need to run ```npm install``` so the libraries needed like ripple-lib to be installed on your machine.

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
You can run the script with this command ```node make_tx.js <AMOUNT:FROMADDR:TOADDR:TOTAG>```
4. server_info.js
This javascript file is responsible to request the server info from the specified Node ip and port in the config file.
You can run the script with this command ```node server_info.js```

## Run it for the first time
To simplify things, the shell script called traffic_gen.sh is responsible to create an end-end scenario from the proposal of new wallets to transfering XRPs to the newly generated accounts. Again, the account that is used to trasfer XRPs from is set in the configuration file in this repository.

```sh traffic_gen.sh 5 1000``` 

This command will generate 5 new wallet accounts and will spread 1000 XRPs to each one of those accounts from the account set in the config file (Genesis Ledger).

