#! /bin/bash

desc=`file /bin/cat`
echo $desc
i=`expr match "$desc" ".*64-bit.*"`
echo $i

if [ $i -lt 1 ]; then
	PATH=$PATH:`pwd`/deploy/node-32/bin/	
else
	PATH=$PATH:`pwd`/deploy/node-64/bin/
fi

npm install forever
npm install

if [ ! -d "./logs" ]; then
	mkdir logs
fi

./startup_production.sh
