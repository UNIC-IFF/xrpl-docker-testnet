#!/bin/bash

CURRENT_DIR="$( cd "$( dirname "$0" )" && pwd )"
MONITORING_DIR=$(dirname "$CURRENT_DIR")

if [[ $# -ne 2 ]]; then
    echo "Illegal number of parameters"
    exit 2
fi

CONFIG_FILE=$CURRENT_DIR/config/config.json
if test -f "$CONFIG_FILE"; then
	acc_addr=$(cat $CONFIG_FILE | jq -r ".account_addr")
fi
 
RANDOM=$$

# Define how many wallets to be proposed (1st argument)
iteratios=$1

#Define the amount to transfer as 2nd argument
amount=$2

# If file with wallet accounts exists delete it
FILE=$CURRENT_DIR/output_data/accounts_to_pay.txt
if test -f "$FILE"; then
    rm -rf $FILE
fi

# If .json file with wallets exists delete it
FILE_WALLETS=$CURRENT_DIR/output_data/wallets.json
# Create new .json file for wallets information
echo "[]" > $FILE_WALLETS

#Generate wallet accounts
for (( i=1; i <= $iteratios; ++i ))
do
    node $CURRENT_DIR/wallet_propose.js
done

#Read the wallets from the file generated from the previous step
lines=`cat $FILE`
for line in $lines; do
    myArray+=("$line")
done

# If .json file with transactions traffic exists delete it
FILE_TRANS=$CURRENT_DIR/output_data/transactions.json
# Create new .json file for transactions traffic
echo "[]" > $FILE_TRANS

#Split XRPs from genesis ledger to the generated wallets
for i in "${myArray[@]}"
do
    node $CURRENT_DIR/make_tx.js $amount:$acc_addr:$i:$RANDOM
done

# Push transaction data to monitoring engine
python $MONITORING_DIR/monitoring_system/push_metrics.py 
