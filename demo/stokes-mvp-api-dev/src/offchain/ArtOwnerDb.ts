import { db } from '../config/db';
import { logger } from '../config/logger';
var SHA256 = require("crypto-js/sha256");

// Class to connect to the art_owner table in the cloudant Db
export class ArtOwnerDb {
    private db;

    constructor() {
        db.db.list(async function(er, all_dbs) {
            if (er){
                return console.log('Error listing databases: %s', er.message)     
            }
            if (!(all_dbs.indexOf('art_owner') > -1)) {
                //transaction_details DB is Not present, Creating One
                await db.db.create('art_owner', function(err, body) {
                    if (!err) {
                      console.log("art_owner Db Created Successfully");
                    }
                  });
            }
          })
        this.db = db.use('art_owner');
    }

    async create(ownerObj): Promise<any> {

        ownerObj.ownerHash = SHA256(ownerObj.owner).toString();

        logger.debug(`Creating owner with ownerRefID `, ownerObj.ownerRefID);

        return this.db.insert(
            {
                ownerRefID: ownerObj.ownerRefID,
                artID: ownerObj.artID,
                owner: ownerObj.owner,
                proposedOwner: ownerObj.proposedOwner,
                ownerHash: ownerObj.ownerHash
            }
        );
    }

    async update(ownerObj): Promise<any> {
        logger.debug(`Updating ownership doc`, ownerObj.ownerRefID);

        return this.db.insert(ownerObj);
    }

    async findByOwnerRefID(ownerRefID: string): Promise<any> {
        const query = {
            selector: {
                ownerRefID: ownerRefID
            },
            fields: [
                '_id',
                '_rev',
                'ownerRefID',
                'artID',
                'owner',
                'proposedOwner',
                'ownerHash'            
            ]
        };

        const dbOwnerDocs = await this.db.find(query);
        logger.debug(`ArtOwnerDb#findByOwnerRefID: found document`, dbOwnerDocs);

        if (dbOwnerDocs.docs.length < 1) {
            logger.info(`ArtOwnerDb#findByOwnerRefID: image with ownerRefID ${ownerRefID} does not exist`);
            return null;
        }

        logger.debug(`ArtOwnerDb#findByOwnerRefID: returning `, dbOwnerDocs.docs[0]);
        return dbOwnerDocs.docs[0];
    }
}