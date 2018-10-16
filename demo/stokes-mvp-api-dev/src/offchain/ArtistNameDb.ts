import { db } from '../config/db';
import { logger } from '../config/logger';
var SHA256 = require("crypto-js/sha256");

// Class to connect to the art_artist_name table in the cloudant Db
export class ArtistNameDb {
    private db;

    constructor() {
        db.db.list(function(er, all_dbs) {
            if (er){
                return console.log('Error listing databases: %s', er.message)     
            }
            if (!(all_dbs.indexOf('art_artist_name') > -1)) {
                //transaction_details DB is Not present, Creating One
                db.db.create('art_artist_name', function(err, body) {
                    if (!err) {
                      console.log("art_artist_name Db Created Successfully");
                    }
                  });
            }
          })
        this.db = db.use('art_artist_name');
    }

    async create(artistName): Promise<any> {

        logger.debug(`Creating artist with artistRefID`, artistName.artistRefID);

        return this.db.insert(
            {
                artistRefID: artistName.artistRefID,
                artID: artistName.artID,
                artistName: artistName.artistName,
                artistNameHash: artistName.artistNameHash
            }
        );
    }

    async findByArtistRefID(artistRefID: string): Promise<any> {
        const query = {
            selector: {
                artistRefID: artistRefID
            },
            fields: [
                'artistRefID',
                'artID',
                'artistName',
                'artistNameHash'
            ]
        };

        const dbArtistDocs = await this.db.find(query);
        logger.debug(`ArtistNameDB#findByUsername: found document`, dbArtistDocs);

        if (dbArtistDocs.docs.length < 1) {
            logger.info(`ArtistNameDB#findByUsername: user with username ${artistRefID} does not exist`);
            return null;
        }

        logger.debug(`ArtistNameDB#findByUsername: returning `, dbArtistDocs.docs[0]);
        return dbArtistDocs.docs[0];
    }

    async findByArtistName(artistName: string): Promise<any> {
        const query = {
            selector: {
                // artistRefID: artistName
                artistName: artistName
            },
            fields: [
                'artistRefID',
                'artID',
                'artistName',
                'artistNameHash'
            ]
        };

        let docs = (await this.db.find(query)).docs;
        let artIds = [];
        for(let i in docs){
            artIds.push({artworkID : docs[i].artID});
        }

        return artIds;

    }
}