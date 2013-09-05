#! /bin/bash

desc=`file /bin/cat`
i=`expr match "$desc" ".*64-bit.*"`


if [ $i -lt 1 ]; then
	PATH=`pwd`/deploy/node-32/bin/:$PATH
	chmod a+x ./deploy/node-32/bin/npm
	chmod a+x ./deploy/node-32/bin/node
else
	PATH=`pwd`/deploy/node-64/bin/:$PATH
	chmod a+x ./deploy/node-64/bin/npm
	chmod a+x ./deploy/node-64/bin/node
fi

if [ $? -eq 126 ]; then
	echo 'no execution permission for node&npm'
	exit $?
fi

echo 'npm version: '`npm --version`
echo 'node version: '`node --version`

echo 'installing dependencies'

npm install --production 


if [ ! -d "./logs" ]; then
	echo 'create logs directory'
	mkdir logs
fi

export NODE_ENV=production

chmod a+x ./node_modules/forever/bin/forever

if [ $? -eq 126 ]; then
	echo 'please add excuete permission for ./node_modules/forever/bin/forever'
	exit $?
fi

./node_modules/forever/bin/forever stop app.js &>/dev/null 

./node_modules/forever/bin/forever start -e ./logs/error.log -o ./logs/out.log app.js 1>/dev/null &&

ip=`LC_ALL=C ifconfig  | grep 'inet addr:'| grep -v '127.0.0.1' |
cut -d: -f2 | awk '{ print $1}'` &&

echo 'server started, please visit: http://'$ip':3000 '
