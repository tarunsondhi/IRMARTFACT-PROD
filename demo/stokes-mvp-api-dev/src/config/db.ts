import { config } from './index';

var db: any;
if(config.USE_DB=="cloudant"){
const Cloudant = require('@cloudant/cloudant');
 db = Cloudant({account: config.DB.ACCOUNT, password: config.DB.PASSWORD, plugins: 'promises'});

}
else if(config.USE_DB=="couchdb"){
 db = require('nano')(config.COUCH_DB.protocol + '://'+config.COUCH_DB.user+':'+config.COUCH_DB.password+'@' + config.COUCH_DB.hostname + ':' + config.COUCH_DB.port);
}

export{db};