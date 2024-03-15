#!/bin/bash

# Check if two arguments are provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 [amendment_name_or_id] [accept/reject]"
    exit 1
fi

# Check if the second argument is either 'accept' or 'reject'
if [ "$2" != "accept" ] && [ "$2" != "reject" ]; then
    echo "Error: The second argument must be 'accept' or 'reject'."
    exit 1
fi

# Store arguments in variables for better readability
amendment="$1"
action="$2"

# Get the list of running validator containers
containers=$(docker ps -a --format "{{.Names}}" | grep "^xrpl-validator")

# Check if there are any validators found
if [ -z "$containers" ]; then
    echo "No running xrpl-validator containers found."
    exit 1
fi

# Execute the command on each validator
for container in $containers; do
    echo "Executing 'rippled feature $action $amendment' on $container..."
    docker exec -it "$container" rippled feature "$amendment" "$action"
done

echo "Completed execution for all matching containers."
