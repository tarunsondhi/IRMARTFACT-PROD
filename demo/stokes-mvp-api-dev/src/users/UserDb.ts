import { db } from '../config/db';
import { IUser, User } from './User';
import { logger } from '../config/logger';
import { config } from '../config';

export class UserDb {
    private db;

    constructor() {
        (async ()=> {await db.db.list(function(er, all_dbs) {
            if (er){
                return console.log('Error listing databases: %s', er.message)     
            }
            if (!(all_dbs.indexOf('users') > -1)) {
                //transaction_details DB is Not present, Creating One
                 db.db.create('users', function(err, body) {
                    if (!err) {
                      console.log("users Db Created Successfully");
                    }
                  });
            }
          })
        })();
        if(config.USE_DB=="cloudant"){
            this.db = db.use('_users');
            }
            else if(config.USE_DB=="couchdb"){
                this.db = db.use('users');
        }
        
    }

    async create(user: User): Promise<any> {
        return this.db.insert({username: user.username, password: user.password});
    }

    async findByUsername(username: string): Promise<IUser> {
        const query = {
            selector: {
                username: username
            },
            fields: [
                '_id',
                'name',
                'firstname',
                'lastname',
                'username',
                'roles'
            ]
        };
        try{
        const dbUserDocs = await this.db.find(query);
        
        logger.debug(`UserDb#findByUsername: found document`, dbUserDocs);

        if (dbUserDocs.docs.length < 1) {
            logger.info(`UserDb#findByUsername: user with username ${username} does not exist`);
            return null;
        }

        logger.debug(`UserDb#findByUsername: returning `, dbUserDocs.docs[0]);
        return dbUserDocs.docs[0];
    }catch(err){
        console.log("Error in while Querying users : "+err);
    }
    }
}