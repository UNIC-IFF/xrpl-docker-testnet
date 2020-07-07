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
# Reading the list of existing wallets to be used.

myaccounts={}
#accounts_files=['./wallets.txt','./wallets_secrets.txt']
#with open(accounts_files[0],'r') as f:
#    wallets=f.read().strip().split('\n')

#with open(accounts_files[1],'r') as f:
#    wallets_secrets=f.read().strip().split('\n')

#for i,w in enumerate(wallets):
#    myaccounts[w]={'master_seed':wallets_secrets[i]}

accounts_file='output_data/wallets.json'
with open(accounts_file,'r') as f:
    myaccounts=json.load(f)

naccounts=len(myaccounts)

#print(myaccounts)

sleeptime=1/txrate


for i in range(txcount):
    stime=time.time()
    r1=int(random.uniform(1,naccounts))
    r2=int(random.uniform(1,naccounts))
    r3=random.gauss(15,3)
    faccobj= myaccounts[r1]    
    taccobj= myaccounts[r2]
    facc=Account(server_address,faccobj['address'],faccobj['secret'])
    tx_info=facc.send_xrp(faccobj['address'],taccobj['address'],r3,faccobj['secret'])
    print (tx_info)
    sleeptime=stime +sleeptime - time.time()
    if sleeptime>0:
        time.sleep(sleeptime)

