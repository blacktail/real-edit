#! /bin/bash

export NODE_ENV=development
forever start -e ./logs/error.log -o ./logs/out.log app.js
