#! /bin/bash

npm install

if [ ! -d "./logs" ]; then
mkdir logs
fi

./startup_production.sh
