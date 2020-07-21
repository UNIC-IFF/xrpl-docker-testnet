#!/bin/bash

apt update

apt install -y build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev wget

cd /tmp

wget https://www.python.org/ftp/python/3.7.5/Python-3.7.5.tgz

tar –xf Python-3.7.5.tgz

cd Python-3.7.5

./configure ––enable–optimizations

make altinstall

make install

apt install -y python3-pip

pip3 install -r server_info/requirements.txt

python3 server_info/server_info.py