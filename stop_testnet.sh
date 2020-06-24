#!/bin/bash

#DOCKERFILE_GENESIS=./docker/docker-compose-testnet-genesis.yml
#DOCKERFILE_VALIDATOR=./docker/docker-compose-testnet-validator.yml

WORKING_DIR=${WORKING_DIR:-$(realpath ./)}
COMPOSE_FILE=${WORKING_DIR}/docker-compose-testnet.yaml
OUTPUT_DIR=${OUTPUT_DIR:-$(realpath ./configfiles)}
IMAGE_TAG=${IMAGE_TAG:-"v1.5"}

CONFIGFILES=${OUTPUT_DIR} IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${COMPOSE_FILE} down
docker-compose -f ${WORKING_DIR}/monitoring_system/monitoring_compose.yml down


