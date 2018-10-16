import { db } from '../config/db';
import { logger } from '../config/logger';
var SHA256 = require("crypto-js/sha256");

// Class to connect to the art_condition_report table in the cloudant Db
export class ConditionReportDb {
    private db;

    constructor() {
        (async ()=> {await db.db.list(function(er, all_dbs) {
            if (er){
                return console.log('Error listing databases: %s', er.message)     
            }
            if (!(all_dbs.indexOf('art_condition_report') > -1)) {
                //transaction_details DB is Not present, Creating One
                db.db.create('art_condition_report', function(err, body) {
                    if (!err) {
                      console.log("art_condition_report Db Created Successfully");
                    }
                  });
            }
          })
        })();
        this.db = db.use('art_condition_report');
    }

    async create(conditionReportObj): Promise<any> {

        logger.debug(`Creating Condition Report with crRefID`, conditionReportObj.crRefID);

        return this.db.insert(
            {
                crRefID: conditionReportObj.crRefID,
                artID: conditionReportObj.artID,
                conditionReport: conditionReportObj.conditionReport,
                crHash: conditionReportObj.crHash
            }
        );
    }

    async findByCRRefID(crRefID: string): Promise<any> {
        const query = {
            selector: {
                crRefID: crRefID
            },
            fields: [
                'crRefID',
                'artID',
                'conditionReport',
                'crHash'            
            ]
        };

        const dbCRDocs = await this.db.find(query);
        logger.debug(`crDB#findByCRRefID: found document`, dbCRDocs);

        if (dbCRDocs.docs.length < 1) {
            logger.info(`crDB#findByCRRefID: image with imageRefID ${crRefID} does not exist`);
            return null;
        }

        logger.debug(`crDB#findByCRRefID: returning `, dbCRDocs.docs[0]);
        return dbCRDocs.docs[0];
    }
}