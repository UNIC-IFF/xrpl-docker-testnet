# Private Ripple Testnet

This project is a set of scripts that generate all the required validators' key-pairs and configuration files to start a private Ripple network. Additionally, it generates a docker-compose file for the private Ripple Testnet that can be used to launch a testnet locally, or on a server or on a Docker Swarm Cluster.

The main idea behind this effort, is to provide a one-click testing tool for those developers want to test it while they are implementing  major networking features, such as on consensus mechanism. It can also be used for further testing or benchmarking in small-scale networks. It is a very usefull tool for anyone that do not have access to a cluster and it is way easier to manage than kubernetes.  

## Requirements
Docker daemon should be installed and running.
Currently, the docker daemon will pull the rippled-runner image from the DockerHub the first time it runs.

## Key Variables and Parameters


- ```OUTPUT_DIR``` : The directory path where all validators configuration files and keys will be stored. Default to *./configfiles/*
- ```VAL_NAME_PREFIX``` : A prefix used for the naming of the validators.
- ```TEMPLATES_DIR``` : The directory that contains the template files. Defaults to *./templates/* 
- ```PEER_PORT``` : The port used for the communication between peers in the network. The docker network DOES NOT expose ports to the physical network interfaces of the host.
- ```IMAGE_TAG```: The docker image tag of the uniciff/rippled-runner repository

Launching the testnet

```
chmod +x run_testnet.sh
./run_testnet.sh <num of validators>
```
If no arguments passed, *num of validators* defaults to *0* and only the genesis validator will be included in the final generated docker-compose file of the testnet.

Print the mapping between the validators' public keys and their names.
```
cat ./configfiles/validators-map.json | jq 
```
Print all the ips/names of the validators (used in [ips_fixed] section in the configuration file.
```
cat ./configfiles/ips_fixed.lst
``` 

check the connectivity of one validator. The following command prints the *peers* of the *validator-0*

```
docker exec -it validator-0 sh -c "./rippled --conf config/rippled.cfg peers"
```

Executing a curl request to a validator

```
docker run -it --rm --network $(docker network ls -q --filter=name=ripple-testnet) curlimages/curl --insecure https://validator-0:51235/crawl | jq"
```


## Launching a simple private Ripple Testnet in Docker - WANTED FUNCTIONALITY

* Generate validators' key-pairs only for a given number of validators
	```bash
	./xrp_testnet.sh --generate-keys --validators <num> [--clean ] [--name-prefix <prefix>]
	```
* Generate validators' configuration files for a given number of validators
	```bash
	./xrp_testnet.sh --generate-configs --validators <num> [--clean] [--name-prefix <prefix>]
	```
	It generates the configuration files for the validators and uses the already generated keys, if they exist, or it generates the keys, if they do not exist. If ```--clean`` flag is passed, it generates new validator key-pairs as well.
* Generate Ripple Testnet Docker-compose file for all the network.
	```bash
	./xrp_testnet.sh --generate-docker-compose --validators <num> [--name-prefix <prefix>]
	```
	It generates the *docker-compose.yml* YAML file of our Ripple Testnet for a given number of validators. It uses the already generated keys, if they exist, or it generates the key-pairs, if they do not exist.

* Launch the Ripple Testnet in a single command.

	```bash
	chmod +x ./xrp_testnet.sh 
	./xrp_testnet.sh --start --validators <num of validators>
	```
	This command is equivalent of ```docker-compose -f docker-compose.yaml up -d ``` command, if the ```docker-compose.yaml``` file already exists. Otherwise, it generates the validators' key-pairs, the configuration files and the *docker-compose.yaml* file, prior of the launch.

* Stop the Ripple Testnet in a single command
	```bash
	./xrp_testnet.sh --stop
	```
	This command is equivalent of ```docker-compose -f docker-compose.yaml down``` command. 

## Contributors

IFF Research Team @ UNIC

- Antonios Inglezakis ( @antIggl ) - UBRI Fellow Researcher / Senior Software Engineer and Systems Administrator, University of Nicosia - Institute For the Future (UNIC-IFF)
- Marios Touloupos ( @mtouloup ) - UBRI Fellow Researcher / PhD Candidate, University of Nicosia - Institute for the Future ( UNIC -IFF)
- Klitos Christodoulou ( @klitoschr ) - Research Manager and Faculty Member, University of Nicosia - Institute For the Future (UNIC-IFF)

## UBRI Funding
[TODO]

## About IFF

IFF is an interdisciplinary research centre, aimed at advancing emerging technologies, contributing to their effective application and evaluating their impact. The general mission at IFF is to educate leaders, develop knowledge and build communities to help society prepare for a future shaped by transformative technologies. The institution has been engaged with the community since 2013 offering the World’s First Massive Open Online Course (MOOC) on blockchain and cryptocurrency for free, supporting the community and bridging the educational gap on blockchains and digital currencies.
