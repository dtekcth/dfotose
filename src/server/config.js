const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const logger = require('./logger');

function loadConfig() {
  const configPath = path.join(__dirname, 'config/config.yml');
  const parsed = YAML.parse(fs.readFileSync(configPath, 'utf8')) || {};
  const environment = process.env.NODE_ENV || 'default';

  return _.merge(
    {},
    _.get(parsed, 'default', {}),
    environment === 'default' ? {} : _.get(parsed, environment, {})
  );
}

const config = loadConfig();

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
  },
  storage: {
    path: undefined,
    temporaryImagePath: undefined
  }
};

checkModel(model, '');

module.exports = config;

