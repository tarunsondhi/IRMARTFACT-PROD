const config = {
    ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'superSecret',
    API_BASE: process.env.API_BASE || '/',
    KEYSTORE: process.env.KEYSTORE || 'network/hfc-kvs/',
    LOGGER: {
        LEVEL: process.env.LOG_LEVEL || 'debug',
        SILENT: process.env.LOG_SILENT || false
    },
    DB_1: {
        ACCOUNT: process.env.DB_ACCOUNT || '108a51c8-6bc1-4fb0-a53c-319a750e1eeb-bluemix',
        PASSWORD: process.env.DB_PASSWORD || '26d3978ecc3b74c9953deee0bcb0475440283c2407e41a6dd86041be62d3d93c',
        URL: 'https://4ac38e3c-7516-4438-a33d-b597f6c94ac9-bluemix.cloudant.com',
        PORT: '443'
    }, 
    DB: {
        ACCOUNT: process.env.DB_ACCOUNT || '64e86784-1d13-4647-bde7-499827a8d58b-bluemix',
        PASSWORD: process.env.DB_PASSWORD || '147f662fb54c5285032adaffe63d9da5e69f53d7192ea66706c36a47d5dfc271',
        URL: 'https://64e86784-1d13-4647-bde7-499827a8d58b-bluemix.cloudant.com',
        PORT: '443'
    },
    COUCH_DB:{
        "protocol" : "http",
        "hostname":"18.191.139.6",
        "port":"6001",
        "user":"admin",
        "password":"adminpw"
    },
    USE_DB:"couchdb",
    USE_DB_PROPERTY_DESCRIPTION:"couchdb/cloudant can be used in USE_DB property to configure db respectively",
    BC_CHAINCODES: {},
    ORGS: process.env.ORGS || 3,
    CONNECTION_PROFILE_DIR: process.env.CONNECTION_PROFILE_DIR || 'network/',
    COMPOSER_ADDRESS_1: 'http://localhost',
    COMPOSER_ADDRESS: 'http://18.191.139.6',
    COMPOSER_ADDRESS_2: 'http://ec2-18-191-223-251.us-east-2.compute.amazonaws.com',
    COMPOSER_PORT: '3001'
};

export { config as defaultConfig };
