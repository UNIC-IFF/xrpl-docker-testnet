# Blockchain TestNet Monitoring System

## What's Included?
This repository includes the needed scripts for the automatic deployment of a monitoring system (Consisted of a prometheus server, a push gateway, an alert manager and a grafana - in form of containers) along with custom exporters for the exposure of monitoring data towards the monitoring system.

## Check if monitoring system is up and running
1. Deploy a private TestNet (This process will also deploy the monitoirng system as well)
1. Navigate to [http://<ip-address>:9090]() for Prometheus.  
1. Navigate to [http://<ip-address>:9091]() for the Push Gateway.  
1. Navigate to [http://<ip-address>:9093]() for Alert Manager.
1. Navigate to [http://<ip-address>:3000]() for Grafana.

## General Architecture
```
               +--------------+
               |              |
               |   Grafana    |
               |              |
               +--------------+
                      |
                      | datasource
                      |
               +------v-------+           +--------------+
         +-----+              |           |              |
  scrape |     |  Prometheus  +-----------> AlertManager |
         +----->    Server    |   push    |              |
               |              |   alerts  |              |
               +--------------+           +--------------+
                      |
                      | scrape
                      |
               +------v-------+
               |              |
               | Pushgateway  |
               |              |
               +--------------+
```
## Acknowledgement
This repository was initially forked from [https://github.com/evnsio/prom-stack](https://github.com/evnsio/prom-stack).