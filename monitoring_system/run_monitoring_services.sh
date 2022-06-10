#!/bin/bash
WORKING_DIR=${WORKING_DIR:-"./"}
MONITORING_SERVICES_DOCKER_COMPOSE_FILE=monitoring_compose.yml
TESTNET_NAME=${TESTNET_NAME:-"ripple_testnet"}
#enable debug
#set -x

running_testnet=$(docker network ls --filter=name=${TESTNET_NAME} --format "{{.Name}}" | head -n 1)

if [[ -n $running_testnet ]] ; then
  echo "Found a running ripple-testnet. Attaching the monitoring services containers to it."
else
  echo "The ripple-testnet docker network couldn't be found!"
  return 1;
fi;

#creating docker volumes if they are not existed

INFLUXDB_VOL_NAME=${INFLUXDB_VOL_NAME:-"testnet_influxdb_data"}
existedvol=$(docker volume ls --filter=name=$INFLUXDB_VOL_NAME --format "{{.Name}}" | head -n 1)
if [[ -n $existedvol ]] ; then
  echo "Found an existed docker volume for monitoring InfluxDB, $existedvol. Attaching it to the monitoring influxdb."
else
  echo "The $INFLUXDB_VOL_NAME docker volume not found! Creating one..."
  docker volume create $INFLUXDB_VOL_NAME
  return 1;
fi;


GF_DATA_VOL_NAME=${GF_DATA_VOL_NAME:-"testnet_grafana_data"}
existedvol=$(docker volume ls --filter=name=$GF_DATA_VOL_NAME --format "{{.Name}}" | head -n 1)
if [[ -n $existedvol ]] ; then
  echo "Found an existed docker volume for monitoring Grafana dashboard, $existedvol. Attaching it to the Grafana container."
else
  echo "The $GF_DATA_VOL_NAME docker volume not found! Creating one..."
  docker volume create $GF_DATA_VOL_NAME
  return 1;
fi;

PROM_DATA_VOL_NAME=${PROM_DATA_VOL_NAME:-"testnet_prometheus_data"}
existedvol=$(docker volume ls --filter=name=$PROM_DATA_VOL_NAME --format "{{.Name}}" | head -n 1)
if [[ -n $existedvol ]] ; then
  echo "Found an existed docker volume for monitoring POrometheus service, $existedvol. Attaching it to the Prometheus container."
else
  echo "The $PROM_DATA_VOL_NAME docker volume not found! Creating one..."
  docker volume create $PROM_DATA_VOL_NAME
  docker run --rm -v $PROM_DATA_VOL_NAME:/prom alpine sh -c 'chown -R 65534:65534 /prom'
  return 1;
fi;



TESTNET=${running_testnet} \
GF_DATA_VOL_NAME=$GF_DATA_VOL_NAME \
INFLUXDB_VOL_NAME=$INFLUXDB_VOL_NAME \
PROM_DATA_VOL_NAME=$PROM_DATA_VOL_NAME \
docker-compose -f ${WORKING_DIR}/${MONITORING_SERVICES_DOCKER_COMPOSE_FILE} up -d

#create prometheus as a data source in grafana container
#chmod +x ./monitoring_system/create-datasource.sh
./monitoring_system/create-datasource.sh

#set +x
