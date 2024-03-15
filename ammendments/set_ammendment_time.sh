#!/bin/bash

# Check if the argument is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 [minutes]"
    exit 1
fi

# Check if the provided argument is a positive integer
if ! [[ "$1" =~ ^[0-9]+$ ]]; then
    echo "Error: The argument must be a positive integer."
    exit 1
fi

# Check if the provided minutes are at least 15
if [ "$1" -lt 15 ]; then
    echo "Error: The minimum amount of time for an amendment to hold a majority is 15 minutes."
    exit 1
fi

# Define the directory to search in
DIR="../configfiles"

# Check if the directory exists
if [ ! -d "$DIR" ]; then
    echo "Error: The directory $DIR does not exist."
    exit 1
fi

# Start searching and appending or updating
count=0
for d in "$DIR"/xrpl-validator-*; do
    if [ -d "$d" ]; then
        cfg_file="$d/rippled.cfg"
        if [ -f "$cfg_file" ]; then
            # Check if [amendment_majority_time] exists in the file
            if grep -q "\[amendment_majority_time\]" "$cfg_file"; then
                # Use awk to replace the line after [amendment_majority_time] with the new time
                awk -v minutes="$1 minutes" '/^\[amendment_majority_time\]$/ {print; getline; print minutes; next}1' "$cfg_file" > tmpfile && mv tmpfile "$cfg_file"
                echo "Updated $cfg_file with $1 minutes."
            else
                # Append [amendment_majority_time] to the file
                echo -e "[amendment_majority_time]\n$1 minutes" >> "$cfg_file"
                echo "Appended to $cfg_file with $1 minutes."
            fi
            ((count++))
        else
            echo "Error: The file $cfg_file does not exist."
        fi
    fi
done

echo "Processed $count validator directories."
