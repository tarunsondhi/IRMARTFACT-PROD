import * as bodyParser from 'body-parser';
import { config } from './config';

// Import dependencies
const express = require('express');
const expressValidator = require('express-validator');
const app = express();
const cors = require('cors');

app.use(bodyParser.json());
app.use(expressValidator());
app.use(cors());


// Set routes for various components
require('./auth/AuthRoutes')(app);
require('./users/UserRoutes')(app);
require('./artwork/ArtworkRoutes')(app);
require('./conditionReport/ConditionReportRoutes')(app);
require('./transportation/TransportationRoutes')(app);

app.get('/', (req, res) => res.status(200).json({message: `Application is running on ${config.PORT} in ${config.ENV}`}));

app.use((req, res, next) => {
    res.status(404)
        .json({error: 'Sorry! Endpoint not found'});
    next();
});

app.use((err, req, res, next) => {
    const sc = err.status || 500;
    res.status(sc);
});

export { app };