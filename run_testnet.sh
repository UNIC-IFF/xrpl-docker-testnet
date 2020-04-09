#!/bin/bash

#DOCKERCOMPOSE_GENESIS_BASE=./docker/docker-compose-testnet-genesis.yml
#DOCKERCOMPOSE_VALIDATOR_BASE=./docker/docker-compose-testnet-validator.yml
WORKING_DIR=$(realpath ./)
TEMPLATES_DIR=$(realpath ./templates/)
COMPOSE_FILENAME=docker-compose-testnet.yaml
OUTPUT_DIR=$(realpath ./configfiles)
VAL_NAME_PREFIX="validator-"
PEER_PORT=51235

source scripts/helper_functions.sh
source scripts/gen_valkeys.sh

VAL_NUM=${1:-0}


generate_keys_and_configs ${VAL_NUM}

dockercompose_testnet_generator ${VAL_NUM} ${OUTPUT_DIR}

#run testnet
echo "Starting the testnet..."

CONFIGFILES=${OUTPUT_DIR} docker-compose -f ${WORKING_DIR}/${COMPOSE_FILENAME} up -d

echo "Waiting for everything goes up..."
sleep 1

echo "Running connect command on each validator..."

for (( i=0; i<"${VAL_NUM}"; i++ ))
do
	docker exec -it ${VAL_NAME_PREFIX}$i sh -c "./rippled --conf config/rippled.cfg connect ${VAL_NAME_PREFIX}genesis ${PEER_PORT}"
done

echo "Done!!!"
