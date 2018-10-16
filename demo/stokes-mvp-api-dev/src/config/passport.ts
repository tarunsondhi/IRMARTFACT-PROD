import { ExtractJwt, Strategy } from 'passport-jwt';
import * as passport from 'passport';
import { UserDb } from '../users/UserDb';
import { config } from './index';

const options = {
    secretOrKey: config.JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeader()
};

passport.use('jwt', new Strategy(options, (payload: any, done) => {
    return new UserDb().findByUsername(payload.username)
        .then(user => {
            if (user === null) {
                return done(null, false, {message: 'The user in the token was not found'});
            }

            return done(null, {username: user.username});
        })
        .catch(err => {
            return done(err);
        });
}));

passport.initialize();