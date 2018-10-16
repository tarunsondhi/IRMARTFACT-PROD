import { UserDb } from './UserDb';
import { User } from './User';
import { logger } from '../config/logger';
import { NotFoundError } from '../errors/NotFoundError';

class UserController {

    public create = async (req, res) => {
        logger.debug(`UserController#create attempt to create user with username ${req.body.username}`);

        try {
            const newUser = new User(req.body.username, req.body.password);
            const dbUser = await new UserDb().create(newUser);
            res.status(201).json({message: 'User saved successfully!', id: dbUser.id});
        } catch (err) {
            logger.error(`UserController#create failed. ${err}`);
            res.status(400).json({message: 'Bad request', error: err.message});
        }
    };

    public findByUsername = async (req, res) => {
        logger.debug(`UserController#findByUsername attempt to find user with username ${req.params.name}`);

        try {
            const dbUser = await new UserDb().findByUsername(req.params.name);
            if (dbUser == null) throw new NotFoundError(`Username does not exist`);
            res.status(200).json({username: dbUser.username});
        } catch (err) {
            if (err instanceof NotFoundError) {
                res.status(404).json({error: err.message});
            } else {
                res.status(400).json({error: err.message});
            }
        }
    };
}

export default new UserController();