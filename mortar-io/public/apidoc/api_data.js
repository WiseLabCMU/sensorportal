define({ api: [
  {
    "type": "post",
    "url": "/api/user/create_user",
    "title": "Add User",
    "name": "Add",
    "group": "User",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "field": "username",
            "optional": false,
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "field": "password",
            "optional": false,
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "field": "password2",
            "optional": false,
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "field": "name",
            "optional": false,
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "field": "email",
            "optional": false,
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "field": "group",
            "optional": false,
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "field": "message",
            "optional": false,
            "description": "<p>message with success text</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "field": "UserMissingData",
            "optional": false,
            "description": "<p>Missing required fields</p>"
          },
          {
            "group": "Error 4xx",
            "field": "UserPasswordMissmatch",
            "optional": false,
            "description": "<p>Passwords did not match</p>"
          },
          {
            "group": "Error 4xx",
            "field": "UserCouldNotCreate",
            "optional": false,
            "description": "<p>Could not register user</p>"
          },
          {
            "group": "Error 4xx",
            "field": "UserNoMetadata",
            "optional": false,
            "description": "<p>Registered user, but could not create save his metadata</p>"
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "field": "Request",
            "optional": false,
            "description": "<p>token obtained on login</p>"
          }
        ]
      }
    },
    "filename": "app/routes.php"
  },
  {
    "type": "get",
    "url": "/api/user",
    "title": "List Users",
    "name": "Index",
    "group": "User",
    "version": "1.0.0",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "field": "error",
            "optional": false,
            "description": "<p>indicator if there was an error (false)</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "field": "users",
            "optional": false,
            "description": "<p>User data</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "field": "user.username",
            "optional": false,
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "String",
            "field": "user.name",
            "optional": false,
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "String",
            "field": "user.email",
            "optional": false,
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "String",
            "field": "user.group",
            "optional": false,
            "description": ""
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "String",
            "field": "UserListError",
            "optional": false,
            "description": "<p>Could not get registered users</p>"
          },
          {
            "group": "Error 4xx",
            "field": "UserDataError",
            "optional": false,
            "description": "<p>Could not get user&#39;s metadata</p>"
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "field": "Request",
            "optional": false,
            "description": "<p>token obtained on login</p>"
          }
        ]
      }
    },
    "filename": "app/routes.php"
  },
  {
    "type": "post",
    "url": "/api/user/login",
    "title": "Login",
    "name": "Login",
    "group": "User",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "field": "username",
            "optional": false,
            "description": "<p>User&#39;s username</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "field": "password",
            "optional": false,
            "description": "<p>User&#39;s password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "field": "error",
            "optional": false,
            "description": "<p>indicator if there was an error (false)</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "field": "user",
            "optional": false,
            "description": "<p>User data</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "field": "user.name",
            "optional": false,
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "String",
            "field": "user.email",
            "optional": false,
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "String",
            "field": "user.group",
            "optional": false,
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "String",
            "field": "user.request_token",
            "optional": false,
            "description": "<p>Token for making next requests</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "field": "AuthError",
            "optional": false,
            "description": "<p>Could not authenticate the user</p>"
          },
          {
            "group": "Error 4xx",
            "field": "UserDataError",
            "optional": false,
            "description": "<p>Could not get user&#39;s metadata</p>"
          }
        ]
      }
    },
    "filename": "app/routes.php"
  },
  {
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "field": "Request",
            "optional": false,
            "description": "<p>token obtained on login</p>"
          }
        ]
      }
    },
    "group": "routes_php",
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "app/routes.php"
  }
] });