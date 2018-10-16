import { config } from './config';
import { logger } from './config/logger';
import { app } from './app';

const port = config.PORT;

app.listen(port, err => {
    if (err) {
        logger.error(err);
    }
    return logger.info(`Server is listening on ${port} in ${config.ENV} environment`);
});