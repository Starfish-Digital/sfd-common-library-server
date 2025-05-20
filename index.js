const config = require('./config');
const logger = require('./logger');
const ExpressServer = require('./expressServer');
const port = 3005;
const launchServer = async () => {
  try {
    this.expressServer = new ExpressServer(port, config.OPENAPI_YAML);
    this.expressServer.launch();
    logger.info('Express server running');
  } catch (error) {
    logger.error('Express Server failure', error.message);
    await this.close();
  }
};

launchServer().catch(e => logger.error(e));
