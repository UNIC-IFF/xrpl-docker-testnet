
# Generating Traffic in the Network (Python Implementation)
The scripts in this repository are responsible to generate traffic, meaning transactions in out Ripple Testing Environment.

## Prerequisites
There are two ways to run the traffic generator. The first ways is running the scripts natively on your machine and the second, and preferable,one is running the scripts in another container.
For the first way, you need to install python3 with pip and ```jq```. The suggested way is to follow your distributions' package manager way to install them.
For the second way, ```docker``` and ```docker-compose``` should be installed on your machine. Afterwards, you can follow the instructions below to build the required docker image for the traffic-generator container.

[TODO: Update README]
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

