#!/bin/bash

if [ -e ./package.json ]; then
  npm install
fi

if [ -e ./requirements.txt ]; then
  pip3 install -r ./requirements.txt
fi

/bin/bash
