import json
from prometheus_client import CollectorRegistry, Gauge, push_to_gateway



f = open('./ripple_traffic_generator/output_data/txs.json')
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

    push_to_gateway('localhost:9091', job=string_text, registry=registry)
