#!/usr/bin/env python3

import json
import sys
from ripple_api import RippleRPCClient, Account

USAGE=  """
        Usage: %s <num of new accounts> <ammount transferred on each>
        """

naccounts=1
nAmmount=1000
# parse Argument
if len(sys.argv)>=3:
    naccounts=int(sys.argv[1])
    nAmmount=int(sys.argv[2])
else:
    print("Not enough arguments!!!")
    print(USAGE%sys.argv[0])


# load configuration
configfile='./config/config.json'
mconf=''
with open(configfile,'r') as f:
    mconf=json.load(f)

# genesis account credentials
gen_account_addr = mconf['account_addr']
gen_secret = mconf['account_secret']

# accounts file
accounts_file='./wallets.json'#mconf['accounts_file']


server_address=''
# websocket case. Not supported
# if ':' in mconf['host_domain'] :
#     server_address=mconf['protocol']+mconf['host_domain']+mconf['port']
# else :
#     server_address=mconf['protocol']+mconf['host_domain']+':'+mconf['port']

# JSONRPC case
# if ':' in mconf['host_domain'] :
#     server_address='http://'+mconf['host_domain']+mconf['jsonrpc_port']
# else :
#     server_address='http://'+mconf['host_domain']+':'+mconf['jsonrpc_port']

#override address
if ':' in mconf['host_domain'] :
    server_address='http://'+mconf['host_domain']+'5006'
else:
    server_address='http://'+mconf['host_domain']+':'+'5006'



print("Server address: %s"%server_address)

rpcClient=RippleRPCClient(server_address)
genesisAccount=Account(server_address,gen_account_addr,gen_secret)

# create accounts
print("Creating %d new accounts and transfer %d XRPs on each"%(naccounts,nAmmount))
wallet_tries=0
send_tries=0
n=0
accountsDict={}
while (n < naccounts):
    acc_info =rpcClient.wallet_propose()
    if acc_info['status']!='success':
        wallet_tries+=1
        if wallet_tries >3 :
            break
        else:
            continue
    
    wallet_tries=0
    send_tries=0
    while(send_tries<3):
        tx_info = genesisAccount.send_xrp(issuer=gen_account_addr,taker=acc_info['account_id'],secret=gen_secret, amount=nAmmount)
        if tx_info['status']!='success':
            send_tries+=1
        else:
            send_tries=0
            break
    
    if send_tries>0:
        print("Failed to send %d XRPs to new account %s"%(nAmmount,acc_info['account_id']))   
        break
    # account created successfully
    accountsDict[acc_info['account_id']]=acc_info
    n+=1


with open(accounts_file,'w') as f:
    json.dump(accountsDict,f)

print("Accounts Created: ")
print (accountsDict)
    
