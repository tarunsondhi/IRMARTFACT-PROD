import { config } from '../config';
import AuthController from './AuthController';

export = (app) => {
    const endpoint = config.API_BASE;

    // app.all(endpoint + '*', AuthController.authenticate);

    app.post(endpoint + 'login', AuthController.login);
};