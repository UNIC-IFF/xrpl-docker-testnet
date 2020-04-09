#!/bin/bash

#DOCKERFILE_GENESIS=./docker/docker-compose-testnet-genesis.yml
#DOCKERFILE_VALIDATOR=./docker/docker-compose-testnet-validator.yml

WORKING_DIR=$(realpath ./)
COMPOSE_FILE=${WORKING_DIR}/docker-compose-testnet.yaml
OUTPUT_DIR=$(realpath ./testnet_configfiles)


CONFIGFILES=${OUTPUT_DIR} docker-compose -f ${COMPOSE_FILE} down


