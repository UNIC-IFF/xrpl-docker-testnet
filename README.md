
# XRPL Docker Testnet

This project is a set of scripts that generate all the required validators' key-pairs and configuration files to start a private XRPL network. Additionally, it generates a docker-compose file for the private testnet that can be used to launch a testnet locally, or on a server or on a Docker Swarm Cluster.

The main idea behind this effort, is to provide a one-click testing tool for those developers want to test it while they are implementing  major networking features, such as on consensus mechanism. It can also be used for further testing or benchmarking in small-scale networks. It is a very usefull tool for anyone that do not have access to a cluster and it is way easier to manage than kubernetes.

In regards to the consensus process of the private testnet, a UNL mananger is spawned that generated the UNL list that is served by an nginx server. Each validator is configured with a unique URL that uses in order to invoke and read the UNL that trusts.  

## Requirements
- Docker Engine should be installed and running.
Currently, the docker daemon will pull the rippled-runner image from the DockerHub the first time it runs.
- Docker Compose
- jq , JSON Command line tool
- sed, File Streams Command line tool
- Tested on Ubuntu > 16.04

## Key Variables and Parameters
The key environment variables of the scripts are the following:
- ```OUTPUT_DIR``` : The directory path where all validators configuration files and keys will be stored. Default to *./configfiles/*
- ```VAL_NAME_PREFIX``` : A prefix used for the naming of the validators.
- ```TEMPLATES_DIR``` : The directory that contains the template files. Defaults to *./templates/* 
- ```PEER_PORT``` : The port used for the communication between peers in the network. The docker network DOES NOT expose ports to the physical network interfaces of the host.
- ```IMAGE_TAG```: The docker image tag of the uniciff/rippled-runner repository

Setting them before the executing the script overwrites default values.

## Testnet related operations

### Using the *control.sh* script

```
control.sh is the main control script for the testnet.
Usage : control.sh <action> <arguments>

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
```

### Launching the testnet

```
git clone https://github.com/UNIC-IFF/xrpl-docker-testnet.git
git submodule update --init --recursive
chmod +x control.sh
cd xrpl-unl-manager && pip install -r requirements.txt
./control.sh configure -n <num_of_validators>
./control.sh start -n <num_of_validators>
```

### Getting useful information
- Print the mapping between the validators' public keys and their names.
```
cat ./configfiles/validators-map.json | jq 
```
- Print all the ips/names of the validators (used in [ips_fixed] section in the configuration file.
```
cat ./configfiles/ips_fixed.lst
``` 
- Check the connectivity of one validator. The following command prints the *peers* of the *validator-0*

```
docker exec -it validator-0 sh -c "./rippled --conf config/rippled.cfg peers"
```

- Executing a curl request to a validator

```
docker run -it --rm --network $(docker network ls -q --filter=name=ripple-testnet) curlimages/curl --insecure https://validator-0:51235/crawl | jq"
```

## Lead Developer

- Marios Touloupos ( @mtouloup ) - UBRI Fellow Researcher / PhD Candidate, University of Nicosia - Institute for the Future ( UNIC -IFF)

# Research Team
* Marios Touloupou (@mtouloup) [ touloupos.m@unic.ac.cy ]
* Antonios Inglezakis (@antiggl) [ inglezakis.a@unic.ac.cy ]
* Klitos Christodoulou [ christodoulou.kl@unic.ac.cy ]
* Elias Iosif [ iosif.e@unic.ac.cy ]

## UBRI Funding
This work is funded by the Ripple’s Impact Fund, an advised fund of Silicon Valley Community Foundation (Grant id: 2018–188546).
Link: [University Blockchain Research Initiative](https://ubri.ripple.com)


## About IFF

IFF is an interdisciplinary research centre, aimed at advancing emerging technologies, contributing to their effective application and evaluating their impact. The general mission at IFF is to educate leaders, develop knowledge and build communities to help society prepare for a future shaped by transformative technologies. The institution has been engaged with the community since 2013 offering the World’s First Massive Open Online Course (MOOC) on blockchain and cryptocurrency for free, supporting the community and bridging the educational gap on blockchains and digital currencies.
