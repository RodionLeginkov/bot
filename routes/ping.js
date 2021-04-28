const router = require('express').Router();
const logger = require('../helpers/logger');
const populateMonitoringUnits = require('../jobs/populateMonitoringUnits.js');
const bot = require('../bot');

const servicesStatuses = {
  backendApi: new bot.MonitoringUnit('Backend Api'),
  cronJob: new bot.MonitoringUnit('Cron Job'),
  loadManager: new bot.MonitoringUnit('Load Manager'),
};
populateMonitoringUnits.config(servicesStatuses);

router.post('/', async (req, res) => {
  let { serviceName } = req.body;
  logger.info(serviceName);
  if (['checkApi', 'updateApi'].includes(serviceName)) {
    serviceName += req.clientIp.replace('::ffff:', '');
  }
  const currentService = servicesStatuses[serviceName];
  logger.info(`Ping from: ${serviceName}`);
  if (currentService) {
    await currentService.reset();
  }
  res.sendStatus(200);
});

module.exports = router;
