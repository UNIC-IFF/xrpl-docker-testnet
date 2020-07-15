#!/bin/bash
WORKING_DIR=${WORKING_DIR:-"./"}
MONITORING_SERVICES_DOCKER_COMPOSE_FILE=monitoring_compose.yml
#enable debug
set -x

running_testnet=$(docker network ls --filter=name=ripple-testnet --format "{{.Name}}" | head -n 1)

if [[ -n $running_testnet ]] ; then
  echo "Found a running ripple-testnet. Attaching the monitoring services containers to it."
else
  echo "The ripple-testnet docker network couldn't be found!"
  return 1;
fi;

TESTNET=${running_testnet} docker-compose -f ${WORKING_DIR}/${MONITORING_SERVICES_DOCKER_COMPOSE_FILE} up -d

#create prometheus as a data source in grafana container
#chmod +x ./monitoring_system/create-datasource.sh
./monitoring_system/create-datasource.sh

set +x
