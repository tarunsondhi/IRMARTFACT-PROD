import * as jwt from 'jwt-simple';
import {IUser, User} from '../users/User';
import {logger} from '../config/logger';
import {UserDb} from '../users/UserDb';
import {NotFoundError} from '../errors/NotFoundError';
import moment = require('moment');
import {config} from '../config';
import * as passport from 'passport';

class AuthController {

    public authenticate = async (req, res, next) => {
        logger.info ( 'AuthController#authenticate: Routing through authentication middleware' );

        if (req.path.includes ( config.API_BASE + 'login' )) return next ();

        passport.authenticate ( 'jwt', {session: false, failWithError: true}, (err, user, info) => {
            if (err) {
                return next ( err );
            }

            if (!user) {
                if (info.name === 'TokenExpiredError') {
                    return res.status ( 401 ).json ( {message: 'Your token has expired. Please generate a new one'} );
                } else {
                    return res.status ( 401 ).json ( {message: info.message} );
                }
            }

            return next ();
        } ) ( req, res, next );
    };

    public login = async (req, res) => {
        try {
            logger.info ( `AuthController#login: Logging in username ${req.body.username}` );

            let dbUser = await new UserDb ().findByUsername ( req.body.username );
            User.comparePassword ( req.body.username, req.body.password ).then( result => {
                logger.info ( 'AuthController#login: Response of login ok 1: ', JSON.parse(result).ok );
                logger.info ( 'AuthController#login: Response of login ok 2: ', JSON.parse(result).ok===true );
                if (JSON.parse(result).ok){
                    logger.info ( 'Login is a success');
                    dbUser.sessionInfo = this.generateToken ( dbUser );
                    res.status ( 200 ).json ( dbUser );
                }
                else{
                    logger.info ( 'Login failed', result );
                    
                    res.status ( 200 ).json ( JSON.parse(result) );
                }

                
            });

        } catch (err) {
            if (err instanceof NotFoundError) {
                res.status ( 404 ).json ( {message: 'Username does not exist'} );
            } else {
                res.status ( 401 ).json ( {message: 'Invalid credentials'} );
            }
        }
    };

    private generateToken = (user: IUser): Object => {
        const expires = moment ().utc ().add ( {days: 1} ).unix ();
        const token = jwt.encode ( {
            exp: expires,
            username: user.username
        }, config.JWT_SECRET );

        return {
            token: 'JWT ' + token,
            expires: moment.unix ( expires ).format (),
            username: user.username
        };
    };
}

export default new AuthController ();
