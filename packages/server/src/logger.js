import winston from 'winston';

const logFile = process.env.DATA_DIR + '/dfotose.log';

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: logFile }),
  ],
});

export default logger;
