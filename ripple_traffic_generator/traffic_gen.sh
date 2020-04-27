#!/bin/sh

npm install

RANDOM=$$

# Define how many wallets to be proposed
iteratios=$1

# Define the account addr of the genesis ledger or the account you want to transfer XRPs from
acc_addr=$2

# If file with wallet accounts exists delete it
FILE=wallets.txt
if test -f "$FILE"; then
    rm -rf wallets.txt
fi

#Generate wallet accounts
for (( i=1; i <= $iteratios; ++i ))
do
    node wallet_propose.js
done

#Read the wallets from the file generated from the previous step
lines=`cat $FILE`
for line in $lines; do
    myArray+=("$line")
done

#Split XRPs from genesis ledger to the generated wallets
for i in "${myArray[@]}"
do
    node make_tx.js 1000:$acc_addr:$i:$RANDOM
done