import { db } from '../config/db';
import { logger } from '../config/logger';

// Class to connect to the art_artist_name table in the cloudant Db
export class TransactionDetailDb {
    private db;

    constructor() {
        (async ()=> {await db.db.list(function(er, all_dbs) {
            if (er){
                return console.log('Error listing databases: %s', er.message)     
            }
            if (!(all_dbs.indexOf('transaction_details') > -1)) {
                //transaction_details DB is Not present, Creating One
                 db.db.create('transaction_details', function(err, body) {
                    if (!err) {
                      console.log("transaction_details Db Created Successfully");
                    }
                  });
            }
          })
        })();
        this.db = db.use('transaction_details');
    }

    async create(transactionDetails): Promise<any> {

        logger.debug(`Creating transaction with transactionId`, transactionDetails.transactionId);

        return this.db.insert(
            {
                artID: transactionDetails.artID,
                transactionID: transactionDetails.transactionId,
                transactionTimestamp: transactionDetails.transactionTimestamp,
                transactionType: transactionDetails.transactionType,
                blockNo: transactionDetails.blockNo,
                user: transactionDetails.user
            }
        );
    }

    async findByArtID(artID: string): Promise<any> {
        const query = {
            selector: {
                artID: artID
            },
            fields: [
                'artID',
                'transactionID',
                'transactionTimestamp',
                'transactionType',
                'blockNo',
                'user'
            ]
        };

        const dbTransactionsDocs = await this.db.find(query);
        logger.debug(`TransactionDetailsDB#findByArtworkID: found document`, dbTransactionsDocs);

        if (dbTransactionsDocs.docs.length < 1) {
            logger.info(`TransactionDetailsDB#findByArtworkID: Transactions for artId ${artID} does not exist`);
            return null;
        }

        logger.debug(`TransactionDetailsDB#findByArtworkID: returning `, dbTransactionsDocs.docs[0]);
        return dbTransactionsDocs.docs;
    }
}