import { config } from '../config';
import UserController from './UserController';

export = (app) => {

    const endpoint = config.API_BASE + 'users';

    app.post(endpoint, UserController.create);

    app.get(endpoint + '/:name', UserController.findByUsername);
};