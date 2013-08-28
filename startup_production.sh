#! /bin/bash

export NODE_ENV=production
forever start -e ./logs/error.log -o ./logs/out.log app.js 