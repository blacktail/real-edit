#! /bin/bash

npm install

bower install

if [ ! -d "./logs" ]; then
mkdir logs
fi

./startup_production.sh
