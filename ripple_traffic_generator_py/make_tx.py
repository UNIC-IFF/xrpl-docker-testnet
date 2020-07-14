#!/usr/bin/env python3

import json
from ripple_api import RippleRPCClient, Account
import sys


USAGE=  """
        Usage: %s <AMOUNT:FROM_ADDR:TO_ADDR:TXTAG>
        """

if len(sys.argv)>=2:
    txdesc=sys.argv[1].strip().split(':',maxsplit=4)
else:
    print(USAGE%sys.argv[0])
    sys.exit()


amount=int(txdesc[0]) # integer?
issuer=txdesc[1]
taker=txdesc[2]
txtag=txdesc[3]

print("Txdesc: ", txdesc)

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

with open(accounts_file,'r') as f:
    accounts=json.load(f)

if issuer not in accounts.keys():
    print("credentials are not available")
    sys.exit()

# make tx
fromAcc=Account(server_address,issuer,accounts[issuer]['master_seed'])

#submit the tx
tx_info=fromAcc.send_xrp(issuer,taker,amount,accounts[issuer]['master_seed'])

print ('Tx info: ',tx_info)
