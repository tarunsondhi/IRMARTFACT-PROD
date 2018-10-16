import { db } from '../config/db';
import { logger } from '../config/logger';
var SHA256 = require("crypto-js/sha256");

// Class to connect to the art_image table in the cloudant Db
export class ArtImageDb {
    private db;

    constructor() {
        db.db.list(function(er, all_dbs) {
            if (er){
                return console.log('Error listing databases: %s', er.message)     
            }
            if (!(all_dbs.indexOf('art_image') > -1)) {
                //transaction_details DB is Not present, Creating One
                db.db.create('art_image', function(err, body) {
                    if (!err) {
                      console.log("art_image Db Created Successfully");
                    }
                  });
            }
          })
        this.db = db.use('art_image');
    }

    async create(artImage): Promise<any> {

        logger.debug(`Creating image with imageRefID`, artImage.imageRefID);

        return this.db.insert(
            {
                imageRefID: artImage.imageRefID,
                artID: artImage.artID,
                image: artImage.image,
                imageHash: artImage.imageHash,
                orginialImagePath: artImage.orginialImagePath
            }
        );
    }

    async findByImageRefID(imageRefID: string): Promise<any> {
        const query = {
            selector: {
                imageRefID: imageRefID
            },
            fields: [
                'imageRefID',
                'artID',
                'image',
                'imageHash',   
                'orginialImagePath'         
            ]
        };

        const dbImageDocs = await this.db.find(query);
        //logger.debug(`ImageNameDB#findByImageRefID: found document`, dbImageDocs);

        if (dbImageDocs.docs.length < 1) {
            logger.info(`ImageNameDB#findByImageRefID: image with imageRefID ${imageRefID} does not exist`);
            return null;
        }

        //logger.debug(`ImageNameDB#findByImageRefID: returning `, dbImageDocs.docs[0]);
        return dbImageDocs.docs[0];
    }
}