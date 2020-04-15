#!/bin/bash


WORKING_DIR=${WORKING_DIR:-$(realpath ./)}
COMPOSE_FILE=${WORKING_DIR}/docker-compose-testnet.yaml
OUTPUT_DIR=${OUTPUT_DIR:-$(realpath ./configfiles)}
IMAGE_TAG=${IMAGE_TAG:-"v1.5"}

CONFIGFILES=${OUTPUT_DIR} IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${COMPOSE_FILE} up -d


