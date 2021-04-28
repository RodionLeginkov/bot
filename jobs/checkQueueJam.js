const aws = require('aws-sdk');
const bot = require('../bot');
const logger = require('../helpers/logger');

const cloudwatch = new aws.CloudWatch();

const mapAsync = (arr, func) => Promise.all(arr.map(func));

const queueNames = {
  check_prod: {
    name: 'Check Prod Queue',
    serviceName: 'Check Consumer',
    jammed: false,
  },
  update_prod: {
    name: 'Update Prod Queue',
    serviceName: 'Update Consumer',
    jammed: false,
  },

};

module.exports = async () => {
  const now = new Date();

  const params = {
    EndTime: now.toISOString(),
    StartTime: new Date(now - 60000).toISOString(),
    MetricDataQueries: Object.keys(queueNames).map((queueName) => ({

      Id: queueName,
      MetricStat: {
        Metric: {
          Dimensions: [
            {
              Name: 'QueueName',
              Value: queueName,
            },
          ],
          MetricName: 'ApproximateAgeOfOldestMessage',
          Namespace: 'AWS/SQS',
        },
        Period: 60,
        Stat: 'Maximum',
      },
      ReturnData: true,

    })),
  };
  // const stats = await cloudwatch.getMetricData(params).promise();getMetricData

  const metrics = await cloudwatch.getMetricData(params)
    .promise()
    .then((res) => res.MetricDataResults)
    .catch((err) => {
      logger.info('Can\'t get queue metric');
      logger.error(err);
    });

  await mapAsync(
    metrics || [],
    async ({ Id, Values: [oldestAge] }) => {
      if (oldestAge >= 60 && !queueNames[Id].jammed) {
        queueNames[Id].jammed = true;
        await bot.alert(queueNames[Id].serviceName, 'DOWN', queueNames[Id].name);
      }
      if (oldestAge < 60 && queueNames[Id].jammed) {
        queueNames[Id].jammed = false;
        await bot.alert(queueNames[Id].serviceName, 'UP', queueNames[Id].name);
      }
    },
  );
};
