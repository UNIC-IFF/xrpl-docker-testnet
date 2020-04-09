#!/bin/bash

VAL_NAME_PREFIX_DEFAULT="validator-"

WORKING_DIR=${WORKING_DIR:-$(realpath ./)}
TEMPLATES_DIR=${TEMPLATES_DIR:-$(realpath ./templates/)}
COMPOSE_FILENAME=${COMPOSE_FILENAME:-"docker-compose.yml"}
PEER_PORT=${PEER_PORT:-51235}
VAL_NAME_PREFIX=${VAL_NAME_PREFIX:-VAL_NAME_PREFIX_DEFAULT}

function validator_service()
{
	valnum=$1
	sed -e "s/\${VALNUM}/$valnum/g" \
    -e "s/\${PEER_PORT}/${PEER_PORT}/g" \
    -e "s/\${VAL_NAME_PREFIX}/${VAL_NAME_PREFIX}/g" \
		${TEMPLATES_DIR}/validator-template.yml | sed -e $'s/\\\\n/\\\n    /g'
}

function dockercompose_testnet_generator ()
{
	num_of_validators=$1
	configfiles_root_path=$2

	# cp ${TEMPLATES_DIR}/docker-compose-genesis-template.yml ${WORKING_DIR}/${COMPOSE_FILE}
  # replace peer-port and validator name prefix in template file
  sed -e "s/\${PEER_PORT}/${PEER_PORT}/g" \
     -e "s/\${VAL_NAME_PREFIX}/${VAL_NAME_PREFIX}/g" \
		${TEMPLATES_DIR}/docker-compose-genesis-template.yml  > ${WORKING_DIR}/${COMPOSE_FILENAME}

	for (( i=0;i<${num_of_validators};i++ ))
	do
		echo "$(validator_service $i)" >> ${WORKING_DIR}/${COMPOSE_FILENAME}
	done
}

