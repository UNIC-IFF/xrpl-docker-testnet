from ripple_api import RippleRPCClient
import json
import os.path
from prometheus_client import CollectorRegistry, Gauge, push_to_gateway

def get_server_info_from_file(directory = './ripple_traffic_generator/output_data/', filename = 'server_info.json'):
    file_path = os.path.join(directory, filename)
    f = open(file_path)
    data = json.load(f)
    f.close()

    return data

def get_server_info_remotely(host, ripple_port):
    rpc = RippleRPCClient('http://'+host+':'+ripple_port+'/')
    data = rpc.server_info()
    return data

def prepare_gauges_and_push(data):
    registry = CollectorRegistry()

    g = Gauge('ServerLatency', 'Amount of time spent waiting for I/O operations to be performed, in milliseconds. If this number is not very, very low, then the rippled server is probably having serious load issues.', registry=registry)
    g.set(data['info']['io_latency_ms'])

    g = Gauge('validationQuorum', 'Minimum number of trusted validations required in order to validate a ledger version. Some circumstances may cause the server to require more validations.', registry=registry)
    g.set(data['info']['validation_quorum'])

    g = Gauge('loadFactor', 'The load factor the server is currently enforcing, as a multiplier on the base transaction fee. The load factor is determined by the highest of the individual server’s load factor, cluster’s load factor, and the overall network’s load factor.', registry=registry)
    g.set(data['info']['load_factor'])

    g = Gauge('Peers', 'How many other rippled servers the node is currently connected to.', registry=registry)
    g.set(data['info']['peers'])

    g = Gauge('Uptime', 'Number of consecutive seconds that the server has been operational.', registry=registry)
    g.set(data['info']['uptime'])

    g = Gauge('serverStateDurationUs', 'The amount of time, in microseconds, that the server has continuously been in the present state (full, syncing, etc.)', registry=registry)
    g.set(data['info']['server_state_duration_us'])

    g = Gauge('convergeTimeS', 'The time it took to reach a consensus for the last ledger closing, in seconds.', registry=registry)
    g.set(data['info']['last_close']['converge_time_s'])

    g = Gauge('proposers', 'Number of trusted validators participating in the ledger closing.', registry=registry)
    g.set(data['info']['last_close']['proposers'])

    try:
        push_to_gateway(prometheus_complete_url_str, job=data['info']['hostid'], registry=registry)
        print("Data for server info succesfully pushed towards Push Gateway")
    except:
        print("There are was an error trying to reach the monitoring engine")

    return registry

def get_and_push_data(host,port,scheduler=None):
    #data = get_server_info_from_file()
    data = get_server_info_remotely(host,port)
    prepare_gauges_and_push(data)
    if scheduler:
        scheduler.enter(5, 1, get_and_push_data, argument=(host,port,scheduler))

if __name__ == "__main__":

    import configparser
    import sched,time

    path_current_directory = os.path.dirname(__file__)
    path_config_file = os.path.join(path_current_directory, 'config.ini')
    config = configparser.ConfigParser()
    config.read(path_config_file)

    host = config['MONITORING']['mon_pg_host_domain']
    prom_port = config['MONITORING']['prometheus_port']
    pg_port = config['MONITORING']['pg_port']
    alert_mg_port = config['MONITORING']['alert_manager']
    grafana_port = config['MONITORING']['grafana']

    ripple_host = config['RIPPLE_TESTNET']['ripple_host']
    ripple_port = config['RIPPLE_TESTNET']['ripple_port']

    prometheus_complete_url = host+':'+pg_port
    prometheus_complete_url_str = str(prometheus_complete_url)

    sch = sched.scheduler(time.time, time.sleep)

    sch.enter(5, 1, get_and_push_data, argument=(ripple_host,ripple_port,sch))
    sch.run()
    