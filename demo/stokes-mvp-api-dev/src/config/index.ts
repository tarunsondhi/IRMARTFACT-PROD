import * as _ from 'lodash';
import { defaultConfig } from './env/default';

const config = defaultConfig;

let localConfig = {};

try {
    localConfig = require(`./env/${config.ENV}`);
    localConfig = localConfig['config'] || {};
} catch (err) {
    localConfig = {};
}

_.merge(config, localConfig);

export {config};