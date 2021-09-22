#!/bin/bash

TRAFFIC_GEN_DOCKER_COMPOSE_FILE=ripple-traffic-generator.yml
#enable debug
set -x

running_testnet=$(docker network ls --filter=name=ripple_testnet --format "{{.Name}}" | head -n 1)

if [[ -n $running_testnet ]] ; then
  echo "Found a running ripple-testnet. Attaching the traffic generator container to it."
else
  echo "The ripple-testnet docker network couldn't be found!"
  return 1;
fi;

MYTESTNET=${running_testnet} docker-compose -f ${TRAFFIC_GEN_DOCKER_COMPOSE_FILE} up -d

set +x
