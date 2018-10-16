# stokes-mvp-api-dev
API development repository for Crozier Iron Mountain project Stokes

# Starting
Run `npm start` to begin the server. The server will adapt to it's environment with various configurations (dev vs prod)

# API components

There are three sets folders for the various components of app functionality: `artwork`, `conditionReport`, and `trackAndTrace`.
Inside each of these folders you will find a `Controller` file, a `Routes` file, and a `*spec` file.
* The `Routes` file defines the endpoints to interact with that component
* The `Controller` file defines the functions that will be called upon interaction with a specific endpoint
* The `spec` file defines the testing scripts for that particular component

# Gateways

All functionality components make use of the composer REST API. The folder `gateways` contains the files to interact with external APIs, such as the Composer REST API.
* The file `ComposerGateway.ts` contains all of the endpoints to interact with the composer api AKA on-chain data

# OffChain 

This folder contains all of the classes to interact with the Cloudant DB for offchain data storage and retrieval.
* ArtHandlerDb.ts connects to the art_handler_name table
* ArtImageDb.ts connects to the art_image table
* ArtistNameDb.ts connects to the art_artist_name table
* ArtOwnerDb.ts connects to the art_owner table
* ConditionReport.ts connects to the art_condition_report table

# Auth

Authorization is set up to communicate with the cloudant DB for user log on and off. See the login credentials here https://ibm.ent.box.com/file/295425097648. These credentials are necessary to connect to the database (and use the full functionality of our API)