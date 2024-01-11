Simple lightweight file server

Create `.env` file in root and add env variables bellow

## Environment variables
|                Env Var | Description                                        | Example Value          |
| ---------------------: | :------------------------------------------------- | :--------------------- |
|                  API_USERS | Users that have access                                     | `user1:pwd1,user2:pwd2`        |
|             SERVER_VOLUMNS | Volumns available for users to upload                                   | `user1:volumn1,user2:volumn2`                 |
|             JWT_SECRET_KEY | Secret key                                     | `somekeygoeshere` |
|             SERVER_PORT | Python server port                                  | `8888`                 |
|         DEBUG | Run server in debug mode                                | `true`             |
|          REACT_APP_SERVER_ADDRESS | Address of server for app to make requests to                                    | `localhoat:8888`           |
| REACT_APP_UPLOAD_CHUNK_SIZE_MB | Upload chunk size in MB | `5` |
|                   SERVER_CERT | Cert pem file | `cert.pem` |
|                   SERVER_KEY | Key pem file | `key.pem` |