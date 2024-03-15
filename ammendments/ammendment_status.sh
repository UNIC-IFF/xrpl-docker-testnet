#!/bin/bash

# Check if an argument (feature name) is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 [feature-name]"
    exit 1
fi

# Define the feature name
feature_name="$1"

# Check the XRPL network status using server_info.js
echo "Checking XRPL network status..."
network_status=$(cd ../xrpl_traffic_generator && node server_info.js 2>&1)

# Check if the execution was successful
if [[ $network_status == *"Error"* || -z "$network_status" ]]; then
    echo "Network is not running."
    exit 1
else
    echo "XRPL network status is operational."
fi

# If the network is running, then check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "Error: Docker does not seem to be running, please start Docker first."
    exit 1
fi

# Define the container name
container_name="xrpl-validator-genesis"

# Check if the specified container is running
if ! docker ps -a --format "{{.Names}}" | grep -q "^$container_name$"; then
    echo "Error: The container $container_name does not exist or is not running."
    exit 1
fi

# Execute the command in the specified validator container
echo "Checking feature status for '$feature_name' on $container_name..."
result=$(docker exec "$container_name" rippled feature "$feature_name" 2>&1)

# Check if the execution was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to check feature status on $container_name."
    echo "Docker exec output: $result"
else
    echo "Feature status on $container_name:"
    echo "$result"
fi

echo "Completed all checks."
