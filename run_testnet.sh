#!/bin/bash

#DOCKERCOMPOSE_GENESIS_BASE=./docker/docker-compose-testnet-genesis.yml
#DOCKERCOMPOSE_VALIDATOR_BASE=./docker/docker-compose-testnet-validator.yml
WORKING_DIR=${WORKING_DIR:-$(realpath ./)}
TEMPLATES_DIR=${TEMPLATES_DIR:-$(realpath ./templates/)}
COMPOSE_FILENAME=${COMPOSE_FILENAME:-"docker-compose-testnet.yaml"}
OUTPUT_DIR=${OUTPUT_DIR:-$(realpath ./configfiles)}
VAL_NAME_PREFIX=${VAL_NAME_PREFIX:-"validator-"}
PEER_PORT=${PEER_PORT:-51235}
IMAGE_TAG=${IMAGE_TAG:-"v1.5"}

TESTNET_NAME=${TESTNET_NAME:-"xrpl-testnet"}

source scripts/helper_functions.sh
source scripts/gen_valkeys.sh

VAL_NUM=${1:-0}

generate_keys_and_configs ${VAL_NUM}

dockercompose_testnet_generator ${VAL_NUM} ${OUTPUT_DIR}
# Creating Testnet
docker network create ${TESTNET_NAME}

# Run UNL manager containers
echo "Running UNL manager containers..."

BASE_DIR=$(pwd)/xrpl-unl-manager ./xrpl-unl-manager/start_UNL_manager_services.sh

echo "    Done!"

#run testnet
echo "Starting the testnet..."

TESTNET_NAME=${TESTNET_NAME} CONFIGFILES=${OUTPUT_DIR} IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${WORKING_DIR}/${COMPOSE_FILENAME} up -d

echo "Waiting for everything goes up..."
sleep 1

echo "Running connect command on each validator..."

for (( i=0; i<"${VAL_NUM}"; i++ ))
do
	docker exec -it ${VAL_NAME_PREFIX}$i sh -c "./rippled connect ${VAL_NAME_PREFIX}genesis ${PEER_PORT}"
done

#run monitoring system
echo "Starting the monitoring system..."


mon_start_script=${WORKING_DIR}/monitoring_system/run_monitoring_services.sh
if [ -x "$mon_start_script" ]; then
  chmod +x $mon_start_script
fi

WORKING_DIR=${WORKING_DIR}/monitoring_system $mon_start_script

echo "Done!!!"
