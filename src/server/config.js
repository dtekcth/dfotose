import _ from 'lodash';

import yamlConfig from 'node-yaml-config';
import logger from './logger';

const config = yamlConfig.load(__dirname + '/config/config.yml');

function checkValue(path) {
  const hasValue = _.has(config, path);
  if (!hasValue) {
    logger.error("Config value undefined " + path);
    throw "required config value missing " + path;
  }
}

function checkModel(model, basePath) {
  const keys = _.keys(model);
  keys.forEach((key) => {
    const dot = (basePath.length > 0) ? '.' : '';
    const path = `${basePath}${dot}${key}`;
    checkValue(path);
    
    const hasChildren = _.get(model, path) !== undefined;
    if (hasChildren) {
      checkModel(model[key], path);
    }
  });
}

const model = {
  port: undefined,
  session: {
    static: undefined,
    secret: undefined
  },
  database: {
    host: undefined,
    name: undefined
  },
  redis: {
    host: undefined
  }
};

checkModel(model, '');

export default config;

