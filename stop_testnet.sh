#!/bin/bash

#DOCKERFILE_GENESIS=./docker/docker-compose-testnet-genesis.yml
#DOCKERFILE_VALIDATOR=./docker/docker-compose-testnet-validator.yml

WORKING_DIR=${WORKING_DIR:-$(realpath ./)}
COMPOSE_FILE=${WORKING_DIR}/docker-compose-testnet.yaml
OUTPUT_DIR=${OUTPUT_DIR:-$(realpath ./configfiles)}
IMAGE_TAG=${IMAGE_TAG:-"v1.7.2"}
TESTNET_NAME=${TESTNET_NAME:-"ripple-testnet"}

UNL_MANAGER_ENABLE=${UNL_MANAGER_ENABLE:-true}

CONFIGFILES=${OUTPUT_DIR} IMAGE_TAG=${IMAGE_TAG} TESTNET_NAME=$TESTNET_NAME docker-compose -f ${COMPOSE_FILE} down
docker-compose -f ${WORKING_DIR}/monitoring_system/monitoring_compose.yml down

if [[ -n "$UNL_MANAGER_ENABLE" && "$UNL_MANAGER_ENABLE" == true ]]; then
  # Stop UNL manager
  TESTNET_NAME=$TESTNET_NAME docker-compose -f ${WORKING_DIR}/xrpl-unl-manager/docker/docker-compose.yml down
fi;

if [[ -n $TESTNET_NAME ]]; then
  running_testnet=$TESTNET_NAME
else
  running_testnet=$(docker network ls --filter=name=${TESTNET_NAME} --format "{{.Name}}" | head -n 1)
fi;

if [[ -n $running_testnet ]] ; then
  echo "Found a running ripple-testnet. Removing..."
  docker network rm $running_testnet
fi;


