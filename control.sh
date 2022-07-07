#!/bin/bash

DEFAULT_ENVFILE="$(dirname $0)/defaults.env"
ENVFILE=${ENVFILE:-"$DEFAULT_ENVFILE"}

### Define or load default variables
WORKING_DIR=${WORKING_DIR:-$(realpath $(dirname $0))}
TEMPLATES_DIR=${TEMPLATES_DIR:-$(realpath $(dirname $0)/templates/)}
OUTPUT_DIR=${OUTPUT_DIR:-$(realpath $(dirname $0)/configfiles)}

source $ENVFILE

###

### Source scripts under scripts directory
. $(dirname $0)/scripts/helper_functions.sh
. $(dirname $0)/scripts/gen_valkeys.sh
###


USAGE="$(basename $0) is the main control script for the testnet.
Usage : $(basename $0) <action> <arguments>

Actions:
  start     --val-num|-n <num of validators>
       Starts a network with <num_validators> 
  configure --val-num|-n <num of validators>
       configures a network with <num_validators> 
  stop
       Stops the running network
  clean
       Cleans up the configuration directories of the network
  status
       Prints the status of the network
        "

function help()
{
  echo "$USAGE"
}

function generate_network_configs()
{
  nvals=$1
  echo "Generating network configuration for $nvals validators..."
  generate_keys_and_configs $nvals
  dockercompose_testnet_generator $nvals ${OUTPUT_DIR}
  echo "  done!"
}

function start_network()
{
  nvals=$1
  echo "Starting network with $nvals validators..."

# check if the network exists and create it
  existing_net=$( docker network ls --filter=name="^$TESTNET_NAME$" --format={{.Name}}) 
  if [ -z "$existing_net" ]; then
    docker network create ${TESTNET_NAME}
  fi

  if [[ -n "$UNL_MANAGER_ENABLE" && "$UNL_MANAGER_ENABLE" == true ]]; then

    if [[ ! -e ${UNL_SCENARIO_FILE} ]] ; then
      echo "  ERROR: ${UNL_SCENARIO_FILE} does not exist!!!"
    fi;

    if [[ ! -e ${OUTPUT_DIR}/unl-manager/validator-token.txt ]] ; then
      echo "  ERROR: ${OUTPUT_DIR}/unl-manager/validator-token.txt does not exist!!!"
    fi;
  
    # Run UNL manager containers
    echo "Running UNL manager containers..."

    BASE_DIR=$WORKING_DIR/xrpl-unl-manager \
    TESTNET_NAME=${TESTNET_NAME} \
    VALIDATORS_KEYS_PATH=${OUTPUT_DIR} \
    UNL_PUBLISHER_CONTAINER_NAME=${UNL_PUBLISHER_CONTAINER_NAME} \
    UNL_SCENARIO_FILE=${UNL_SCENARIO_FILE} \
    UNL_MANAGER_KEYFILE=${OUTPUT_DIR}/unl-manager/validator-token.txt \
      ${WORKING_DIR}/xrpl-unl-manager/start_UNL_manager_services.sh

    echo "    Done!"
  fi;

  # TESTNET_NAME=$TESTNET_NAME docker-compose -f docker-compose-testnet.yml up -d
  echo "Starting the testnet..."

  TESTNET_NAME=${TESTNET_NAME} CONFIGFILES=${OUTPUT_DIR} IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${WORKING_DIR}/${COMPOSE_FILENAME} up -d

  echo "Waiting for everything to come up..."
  sleep 10
  echo "Triggering statsd with inetdd"
  docker exec -it xrpl-validator-genesis sh -c "inetd"
  for (( i=0; i<"${VAL_NUM}"; i++ ))
  do
      
      docker exec -it ${VAL_NAME_PREFIX}$i sh -c "inetd"
  done

  # setup exporter
  echo "Setup exporter in each validator"

  docker exec -d ${VAL_NAME_PREFIX}genesis sh -c "python3 exporters/server_info/server_info.py"

  for (( i=0; i<"${VAL_NUM}"; i++ ))
  do
	docker exec -d ${VAL_NAME_PREFIX}$i sh -c "python3 exporters/server_info/server_info.py"
  done
  echo "  network started!"
}

function stop_network()
{
  echo "Stopping network..."
  # TESTNET_NAME=$TESTNET_NAME docker-compose -f docker-compose-testnet.yml down
  CONFIGFILES=${OUTPUT_DIR} IMAGE_TAG=${IMAGE_TAG} TESTNET_NAME=$TESTNET_NAME docker-compose -f ${WORKING_DIR}/${COMPOSE_FILENAME} down

  if [[ -n "$UNL_MANAGER_ENABLE" && "$UNL_MANAGER_ENABLE" == true ]]; then
    # Stop UNL manager
    TESTNET_NAME=$TESTNET_NAME docker-compose -f ${WORKING_DIR}/xrpl-unl-manager/docker/docker-compose.yml down
  fi;

  #if [[ -n $TESTNET_NAME ]]; then
  #  running_testnet=$TESTNET_NAME
  #else
  #  running_testnet=$(docker network ls --filter=name=${TESTNET_NAME} --format "{{.Name}}" | head -n 1)
  #fi;

  #if [[ -n $running_testnet ]] ; then
  #  echo "Found a running ripple-testnet. Removing..."
  #  docker network rm $running_testnet
  #fi;
  echo "  stopped!"
}

function print_status()
{
  echo "Printing status of the  network..."
  # TESTNET_NAME=$TESTNET_NAME docker-compose -f docker-compose-testnet.yml status
  CONFIGFILES=${OUTPUT_DIR} IMAGE_TAG=${IMAGE_TAG} TESTNET_NAME=$TESTNET_NAME docker-compose -f ${WORKING_DIR}/${COMPOSE_FILENAME} ps
  echo "  Finished!"
}

function do_cleanup()
{
  echo "Cleaning up network configuration..."
  # rm -rf ${DEPLOYMENT_DIR}/*
  set -x
  rm -rf ${OUTPUT_DIR}/*
  rm ${WORKING_DIR}/${COMPOSE_FILENAME}
  set +x
  echo "  clean up finished!"
}


ARGS="$@"

if [ $# -lt 1 ]
then
  #echo "No args"
  help
  exit 1
fi

while [ "$1" != "" ]; do
  case $1 in
    "start" ) shift
      while [ "$1" != "" ]; do
        case $1 in 
             -n|--val-num ) shift
               VAL_NUM=$1
               ;;
        esac
        shift
      done
      start_network $VAL_NUM
      exit
      ;;
    "configure" ) shift
      while [ "$1" != "" ]; do
        case $1 in 
             -n|--val-num ) shift
               VAL_NUM=$1
               ;;
        esac
        shift
      done
      generate_network_configs $VAL_NUM
      exit
      ;;
    "stop" ) shift
      stop_network
      exit
      ;;
    "status" ) shift
      print_status
      exit
      ;;
    "clean" ) shift
      do_cleanup
      exit
      ;;
  esac
  shift
done
