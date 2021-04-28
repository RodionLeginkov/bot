const aws = require('aws-sdk');
const bot = require('../bot');
const logger = require('../helpers/logger');
const config = require('../config').app;

const ddb = new aws.DynamoDB();

let services = {};
let lastIps = [];

const runJob = async () => {
  const params = {
    TableName: `${config.dynamoDbTableName}`,
  };
  const privateIps = await ddb.scan(params)
    .promise()
    .then((res) => res.Items.map((i) => i.private_ip.S))
    .catch((err) => console.log('Can\'t get api metrics', err));

  logger.info('IPs from DynamoDB;');
  logger.info(privateIps);

  lastIps.forEach((ip) => {
    if (!privateIps.includes(ip)) {
      clearTimeout(services[`checkApi${ip}`].timeout);
      clearTimeout(services[`updateApi${ip}`].timeout);
      delete services[`checkApi${ip}`];
      delete services[`updateApi${ip}`];
    }
  });

  privateIps.forEach((ip) => {
    if (!lastIps.includes(ip)) {
      services[`checkApi${ip}`] = new bot.MonitoringUnit(`Check API ${ip}`);
      services[`updateApi${ip}`] = new bot.MonitoringUnit(`Update API ${ip}`);
    }
  });

  lastIps = privateIps;
};

module.exports = {
  runJob,
  config: (outputObj) => { services = outputObj; },
};
