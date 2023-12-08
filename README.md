Simple lightweight file server

## Environment variables
|                Env Var | Description                                        | Example Value          |
| ---------------------: | :------------------------------------------------- | :--------------------- |
|                  API_USERS | Users that have access                                     | `user1:pwd1,user2:pwd2`        |
|             SERVER_VOLUMNS | Volumns available for users to upload                                   | `user1:volumn1,user2:volumn2`                 |
|             JWT_SECRET_KEY | Secret key                                     | `somekeygoeshere` |
|             SERVER_PORT | Python server port                                  | `8888`                 |
|         DEBUG | Run server in debug mode                                | `true`             |
|          REACT_APP_SERVER_ADDRESS | Address of server for app to make requests to                                    | `localhoat:8888`           |
