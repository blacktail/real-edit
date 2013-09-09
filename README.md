real-edit
=========

multi-users realtime editor using web socket, lightweight operation transformation algorithm.
support online chat, collab edit.

Run
=========

```
./deploy.sh
```

Development
=========

```
npm install -g forever
npm install -g grunt-cli
npm install
bower install
```

start in debug mode: 

```
./startup_development.sh
grunt init
```

start in production mode: 

```
./startup_production.sh
```


Deploy
=========

```
grunt dist
```



