import { db } from '../config/db';
import { logger } from '../config/logger';
var SHA256 = require("crypto-js/sha256");

// Class to connect to the art_handler_name table in the cloudant Db
export class ArtHandlerDb {
    private db;

    constructor() {
        (async ()=> {await db.db.list(function(er, all_dbs) {
            if (er){
                return console.log('Error listing databases: %s', er.message)     
            }
            if (!(all_dbs.indexOf('art_handler_name') > -1)) {
                //transaction_details DB is Not present, Creating One
                db.db.create('art_handler_name', function(err, body) {
                    if (!err) {
                      console.log("art_handler_name Db Created Successfully");
                    }
                  });
            }
          })
        })();
        this.db = db.use('art_handler_name');
    }

    async create(artHandler): Promise<any> {

        logger.debug(`Creating handler with crArtHandlerRefID`, artHandler.crArtHandlerRefID);

        return this.db.insert(
            {
                crArtHandlerRefID: artHandler.crArtHandlerRefID,
                artID: artHandler.artID,
                artHandlerName: artHandler.artHandlerName,
                artHandlerNameHash: artHandler.artHandlerNameHash
            }
        );
    }

    async findByHandlerRefID(crArtHandlerRefID: string): Promise<any> {
        const query = {
            selector: {
                crArtHandlerRefID: crArtHandlerRefID
            },
            fields: [
                'crArtHandlerRefID',
                'artID',
                'artHandlerName',
                'artHandlerNameHash'            
            ]
        };

        const dbHandlerDocs = await this.db.find(query);
        logger.debug(`ArtHandlerDb#findByHandlerRefID: found document`, dbHandlerDocs);

        if (dbHandlerDocs.docs.length < 1) {
            logger.info(`ArtHandlerDb#findByHandlerRefID: image with imageRefID ${crArtHandlerRefID} does not exist`);
            return null;
        }

        logger.debug(`ArtHandlerDb#findByHandlerRefID: returning `, dbHandlerDocs.docs[0]);
        return dbHandlerDocs.docs[0];
    }
}