# sensorportal
This repository holds a web interface for the Sensor Andrew platform. 
The site is based on angular.js and communicates with an ejabberd server
over the BOSH protocol. 

## Installation

### NGINX
An nginx server hosts the website and is very easy to setup. First install 
nginx from source or a package manager. More installation information is found
at https://www.nginx.com. 

Once installed add the following server entry to the nginx configuration. 

'''
server {
    listen 80;
    root [path to public];
    index index.html;
    server_name localhost;
    charset utf-8;

    location / {
	      try_files $uri $uri/ index.html;
    }
    # pass through proxy  rpc commands.
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
'''


### Bower

Bower is a tool for managing javascript depenedencies. It relies on npm so npm must be installed first, 
from npmjs.com or your prefered package manager. More information about bower can be found at https://bower.io. 

To install bower and  
'''
# npm install -g bower
# cd [path to repo]/mortar-io/
# bower install 
'''
If any dependency issues come up, it may be necessary to select which packages to install. 

