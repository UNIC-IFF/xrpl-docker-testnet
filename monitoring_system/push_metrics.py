import json
import os.path
from prometheus_client import CollectorRegistry, Gauge, push_to_gateway
from config import monitoring_vars

directory = './output_data/'
filename = 'transactions.json'
file_path = os.path.join(directory, filename)

f = open(file_path)
data = json.load(f)
f.close()

for i in data:
    tx = i['tx_json']['Sequence']
    string_text = "tx"+str(tx)

    for j in i:      
        registry = CollectorRegistry()
        
        g = Gauge('Result_Code', 'Transaction Result', registry=registry)
        g.set(i['engine_result_code'])

        g = Gauge('Last_Closed_Ledger', 'Last Closed Ledger', registry=registry)
        g.set(i['tx_json']['LastLedgerSequence'])

        g = Gauge('Amount', 'Amount Transfered', registry=registry)
        g.set(i['tx_json']['Amount'])

        g = Gauge('Fee', 'Transaction Fee', registry=registry)
        g.set(i['tx_json']['Fee'])
    try:
        push_to_gateway(monitoring_vars.HOST_DOMAIN+':'+monitoring_vars.PG_PORT, job=string_text, registry=registry)
        print("Data for " + string_text + " Succesfully pushed towards Push Gateway")
    except:
        print("There are was an error trying to reach the monitoring engine")
