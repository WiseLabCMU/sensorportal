# sensorportal
This repository holds a web interface for the Sensor Andrew platform. 
The site is based on angular.js (1.5) and communicates with the Sensor Andrew
XMPP server using [BOSH](http://xmpp.org/extensions/xep-0124.html). More information about the platform 

## Installation

The NGINX server hosts the portal while bower manages js packages required by the site.
The following sections describe how to install and setup the server.

### NGINX

First install 
NGINX from source or a package manager. More installation information is found
at https://www.nginx.com. 

Once installed add the following server entry to the nginx configuration. For more information on 
nginx configuration visit the [[ admin guide | https://www.nginx.com/resources/admin-guide/ ]]. 

This sets up a server on port 80. If using another port use `lsof -i` to determine what ports are in use.
Also note that the nginx user may not have access to some port ranges, such as if you are using selinux.
Make sure that the nginx user, and optionally groups, has read permission to your public directory.
Here you can set the access and error logs to locations of your choosing. 

```
server {
    listen 80;
    root [path to public folder in repo];
    index index.html;
    server_name localhost;
    charset utf-8;
    location / {
        try_files $uri $uri/ index.html;
    }
    location /RPC2 {
        proxy_pass [xmpp server]:4560/RPC2;
    }
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    access_log [path to log]/mortar-access.log;
    error_log  [path to log]/mortar-io-error.log error;
    error_page 404 index.html;
    
    sendfile off;

    location ~ /\.ht/ {
        deny all;
    }
    
}
```


### Bower

Bower is a tool for managing javascript depenedencies. It relies on npm so npm must be installed first, 
from npmjs.com or your prefered package manager. More information about bower can be found at https://bower.io. 

To install bower and the dependencies after npm is installed : 

```

 cd [path to repo]/sensorportal/mortar-io/
 npm install -g bower
 bower install 
```

If any dependency issues come up, choose the most up to date 1.x version suggested. 

### Configure Deployment

Under mortar-io/public/resources/variables.js you can set the pubsub service, xmpp server, login screen name, and the website url.
This allows the webportal to work with XMPP servers accross instances. 
