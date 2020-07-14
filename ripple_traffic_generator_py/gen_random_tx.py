#!/usr/bin/env python3
import json
import sys
import random
import time 
from ripple_api import Account, RippleRPCClient, RippleDataAPIClient



USAGE=  """
        Usage: %s <Tx count> <Tx rate (tx per sec)>
        """

if len(sys.argv)>=3:
    txcount=int(sys.argv[1])
    txrate= float(sys.argv[2])
else:
    print(USAGE%sys.argv[0])
    sys.exit()




# load configuration
configfile='./config/config.json'
mconf=''
with open(configfile,'r') as f:
    mconf=json.load(f)

# genesis account credentials
gen_account_addr = mconf['account_addr']
gen_secret = mconf['account_secret']

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

# server_address='http://localhost:5006/'
accounts_file='./wallets.json'
myaccounts={}
with open(accounts_file,'r') as f:
    myaccounts=json.load(f)

naccounts=len(myaccounts.keys())


sleeptime=1/txrate


for i in range(txcount):
    stime=time.time()
    r1=int(random.uniform(1,naccounts))
    r2=int(random.uniform(1,naccounts))
    r3=random.gauss(15,3)
    faccid= list(myaccounts)[r1]    
    taccid= list(myaccounts)[r2]
    facc=Account(server_address,faccid,myaccounts[faccid]['master_seed'])
    tx_info=facc.send_xrp(faccid,taccid,r3,myaccounts[faccid]['master_seed'])
    print (tx_info)
    sleeptime=stime +sleeptime - time.time()
    if sleeptime>0:
        time.sleep(sleeptime)

