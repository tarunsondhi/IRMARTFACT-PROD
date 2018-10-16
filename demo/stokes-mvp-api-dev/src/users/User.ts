import * as bcrypt from 'bcryptjs';
import { config } from '../config';

export interface IUser {
    username: string;
    password: string;
}

export class User implements IUser {
    username: string;
    password: string;

    constructor(username: string, password: string) {
        this.username = username;
        this.encryptPassword ( password );
    }

    private encryptPassword(passwordInput: string): void {
        const salt = bcrypt.genSaltSync ( 10 );
        this.password = bcrypt.hashSync ( passwordInput, salt );
    }

    static comparePassword(username: string, password: string): Promise<any> {
        return new Promise ( function (resolve, reject) {
            var url: string;
            if(config.USE_DB=="cloudant"){
                url = config.DB.URL + ':' + config.DB.PORT;
                }
                else if(config.USE_DB=="couchdb"){
                url = config.COUCH_DB.protocol+'://'+config.COUCH_DB.hostname+':'+config.COUCH_DB.port;
                
            }
            require ( 'request' ) ( {
                method: 'POST',
                url: url + '/_session',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify ( {
                    name: username.split ( '@' )[0],
                    password: password
                } )
            }, function (error, response, body) {
                if (error) {
                    return reject ( error );
                }
                return resolve ( body );
            } );
        } );
    }
}
